import 'reflect-metadata';
import { Elysia, type Context as ElysiaContextType, type Handler as ElysiaHandler } from 'elysia';
import { 
  ROUTE_PREFIX_METADATA, 
  ROUTE_METADATA, 
  MODULE_METADATA,
  PARAMS_METADATA
} from '../decorators/constants';
import { 
  DIContainer, 
  Container, // Import Container for static methods
  type Type, 
  Scope, 
  isTypeProvider, 
  isCustomProvider, 
  Inject // Import Inject for potential parameter DI
} from '../di';
import { INJECTABLE_METADATA } from '../di/injectable.decorator';
import { getLifecycleManager } from '../lifecycle/lifecycle-manager';

// Types
import type { RouteMetadata, ModuleOptions, ParamMetadata } from '../decorators/types';
import type { 
  OnModuleInit, 
  OnApplicationBootstrap,
} from '../interfaces/lifecycle.interface';
import { randomUUID } from 'node:crypto'; // For unique request IDs
import { type MiddlewareType, isClassMiddleware, type ElysiaNestMiddleware } from '../interfaces/middleware.interface'; // Import middleware types

// Controller decorator is now part of this file for simplicity or imported from http.decorators
// Assuming it's available as it was previously.

// Define controller metadata type
export interface ControllerMetadata {
  prefix: string;
  routes: RouteMetadata[];
}

// Controller decorator
export function Controller(prefix: string = '') {
  return function (constructor: Function) {
    Reflect.defineMetadata(ROUTE_PREFIX_METADATA, prefix, constructor);
  };
}

// Module decorator that automatically creates an Elysia plugin
export const Module = (options: ModuleOptions): any => {
  const moduleFactory = function (instance: any) {
    if(instance === undefined)
       throw new Error('Module instance is undefined.');

    const moduleinstance = instance instanceof Function ? instance : instance.constructor;
    const metadata: ModuleOptions = options;

    return async (app: Elysia): Promise<any> => {
      const prefix = metadata?.prefix?.replace(/\/$/, '') || ''
      if(app === undefined) app = new Elysia({ prefix: prefix }) as any
      if(!metadata?.controllers?.length) app = app.get('/__health__', () => 'ok')
      
      if (metadata?.providers?.length) {
        DIContainer.register(metadata.providers, moduleinstance as Type<any>);
      }

      // Middlewares
      if (metadata?.middlewares?.length) {
        for (const middlewareItem of metadata.middlewares) {
          if (isClassMiddleware(middlewareItem)) {
            // Resolve class-based middleware instance from DI container
            // Middleware classes should be @Injectable()
            try {
                const middlewareInstance = await DIContainer.get<ElysiaNestMiddleware>(middlewareItem, moduleinstance as Type<any>);
                // Adapt its .use() method to be an Elysia handler/plugin
                const elysiaMiddlewareHandler = (elysiaAppContext: ElysiaContextType) => {
                    // The concept of 'next' is implicit in Elysia's handler chain unless specific lifecycle hooks are used.
                    // For a simple app = app.use(), the middleware either handles the request or lets it pass through.
                    // If middlewareInstance.use is async and doesn't return, or returns undefined, Elysia moves on.
                    // If it needs to behave like Express middleware (req, res, next), it's more complex.
                    // For now, assume middlewareInstance.use(context) will do its job.
                    // A true 'next' would require more advanced hook like onBeforeHandle or custom dispatcher.
                    return middlewareInstance.use(elysiaAppContext, async () => {}); // Dummy next, as .use doesn't directly provide it
                };
                app = app = app.use(elysiaMiddlewareHandler as any) as any;
            } catch (e) {
                console.error(`Failed to resolve or apply middleware ${middlewareItem.name}:`, e);
                // Decide if this should throw or just warn
            }
          } else {
            // middlewareItem is FunctionalMiddleware (ElysiaHandler)
            try {
                // Pass middlewareItem directly, as it should be an ElysiaHandler
                app = app = app.use(middlewareItem as any) as any; // Cast middlewareItem to any
            } catch (e) {
                console.error(`Failed to apply functional middleware:`, e);
            }
          }
        }
      }

      const importing = (importedModule: any) => {
        if (typeof importedModule === 'function' && Reflect.getMetadata(MODULE_METADATA, importedModule)) {
          const importedModulePlugin = importedModule();
          app = app.use(importedModulePlugin as any) as any; 
        } else if (typeof importedModule === 'object' && typeof (importedModule as any).plugin === 'function'){
          app = app.use((importedModule as any).plugin as any) as any; 
        } else {
           try { app = app.use(importedModule as any) as any; } 
           catch (e) { console.error(`Failed to apply import: ${importedModule.name || 'Unknown import'}.`, e); throw e; }
        }
      }

      // imports
      if (metadata?.imports?.length) {
        for (const importedModule of metadata?.imports) {
          importing(importedModule)
        } 
      }

      // children
      if(metadata?.children?.length){
        for (const childModule of metadata.children) {
          importing(await childModule())
        }
      }

      // controllers
      if (metadata?.controllers?.length) {
        for (const controllerClass of metadata.controllers) {
          const controllerMeta = Reflect.getMetadata(ROUTE_PREFIX_METADATA, controllerClass)
          const controllerPrefix = (typeof controllerMeta === 'string' ? controllerMeta : controllerMeta?.prefix) || '';
          const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA, controllerClass) || [];
          
          for (const route of routes) {
            const fullPath = `${controllerPrefix}${route.path.startsWith('/') || controllerPrefix.endsWith('/') ? '' : '/'}${route.path}`;
            const handlerMethodName = route.propertyKey;
            
            const elysiaHandler = async (elysiaContext: ElysiaContextType) => {
              return Container.runInRequestContext({ id: randomUUID(), container: new Map() }, async () => {
                const controllerInstance = await DIContainer.get(controllerClass, moduleinstance as Type<any>);
                const originalMethod = controllerInstance[handlerMethodName];
                
                if (typeof originalMethod !== 'function') {
                  console.error(`Handler method ${handlerMethodName} not found on ${controllerClass.name}`);
                  elysiaContext.set.status = 500; return { error: `Internal server error` };
                }
                
                const paramDefinitions: ParamMetadata[] = Reflect.getMetadata(PARAMS_METADATA, controllerClass, handlerMethodName) || [];
                const resolvedParams = await Promise.all(
                  (Reflect.getMetadata('design:paramtypes', controllerInstance, handlerMethodName) || []).map(async (paramType: any, index: number) => {
                    const paramMeta = paramDefinitions.find(p => p.index === index);
                    if (paramMeta) {
                      switch (paramMeta.type) {
                        case 'body': return elysiaContext.body;
                        case 'param': return elysiaContext.params[paramMeta.data as string];
                        case 'query': return paramMeta.data ? elysiaContext.query[paramMeta.data as string] : elysiaContext.query;
                        case 'request': case 'req': return elysiaContext.request;
                        case 'response': case 'res': return elysiaContext.set;
                        case 'context': case 'ctx': case 'elysiaContext': return elysiaContext;
                        case 'headers': return paramMeta.data ? elysiaContext.request.headers.get(paramMeta.data as string) : elysiaContext.request.headers;
                        case 'ip': return elysiaContext.request.headers.get('x-forwarded-for') || (elysiaContext as any).ip;
                        default: try { return await DIContainer.get(paramType, moduleinstance as Type<any>); } catch (e) { return undefined; }
                      }
                    } else if (paramType && paramType !== Object) {
                        try { return await DIContainer.get(paramType, moduleinstance as Type<any>); } catch (e) { return undefined; }
                    }
                    return undefined;
                  })
                );
                return await originalMethod.apply(controllerInstance, resolvedParams);
              });
            };
            const elysiaApp = app as any;
            if (typeof elysiaApp[route.method.toLowerCase()] === 'function') {
              app = elysiaApp[route.method.toLowerCase()](fullPath.replace(/\/$/, ''), elysiaHandler) as any;
            } else { console.warn(`HTTP method ${route.method} not supported.`); }
          }
        }
      }

      // providers (lifecycle hooks)
      if (metadata?.providers?.length) {
        for (const providerDefinition of metadata.providers) {
            let providerToken: any; let providerScope: Scope = Scope.SINGLETON;
            if (isTypeProvider(providerDefinition)) {
                providerToken = providerDefinition;
                const injectableMeta = Reflect.getMetadata(INJECTABLE_METADATA, providerDefinition);
                if (injectableMeta && injectableMeta.scope !== undefined) providerScope = injectableMeta.scope;
            } else if (isCustomProvider(providerDefinition)) {
                providerToken = providerDefinition.provide;
                if (providerDefinition.scope !== undefined) providerScope = providerDefinition.scope;
            } else { continue; }
            if (providerToken && providerScope === Scope.SINGLETON) {
                try {
                    const instance = await DIContainer.get(providerToken, moduleinstance as Type<any>);
                    if (instance && typeof (instance as any).onModuleInit === 'function') {
                        if (!(instance as any).__onModuleInitCalled) {
                            await (instance as any).onModuleInit(); (instance as any).__onModuleInitCalled = true; 
                            getLifecycleManager().register(instance); 
                        }
                    }
                } catch (e) { /* Warn */ }
            }
        }
      }

      return app as any;
    };
  };
  Reflect.defineMetadata(MODULE_METADATA, options, moduleFactory);
  return moduleFactory as any; 
}

// Initialize the application with the root module
export async function Bootstrap(rootModule: any): Promise<Elysia> {
  const app = await rootModule()

  // if (!Reflect.getMetadata(MODULE_METADATA, rootModule))
  //   throw new Error('Root module must be decorated with @Module().')


  getLifecycleManager().triggerOnApplicationBootstrap();
  return app
}
