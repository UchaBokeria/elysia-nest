import 'reflect-metadata';
import { INJECTABLE_METADATA, INJECT_METADATA, type Type } from './injectable.decorator';
import { Scope } from './scope-options.interface';
import { 
  type Provider, 
  type ProviderToken, 
  isTypeProvider, 
  isCustomProvider, 
  isClassProvider, 
  isValueProvider, 
  isFactoryProvider,
  isExistingProvider
} from './provider.interface';
import { AsyncLocalStorage } from 'node:async_hooks'; // For request scope

// Request context type (can be expanded if needed)
export interface RequestContext {
  id: string | symbol; // Unique request identifier
  container?: Map<ProviderToken, any>; // Request-specific cache
}

// AsyncLocalStorage for request context
const requestAsyncStorage = new AsyncLocalStorage<RequestContext>();

interface StoredProvider<T = any> {
  definition: Provider;
  instance?: T; // For singletons
  scope: Scope;
  resolved?: boolean; // For value providers or fully resolved singletons
}

export class Container {
  private static _instance: Container;
  // Global providers: Map<Token, StoredProviderDefinition>
  private globalProviders = new Map<ProviderToken, StoredProvider<any>>();
  // Module-specific providers: Map<ModuleToken, Map<ProviderToken, StoredProviderDefinition>>
  private moduleProviders = new Map<Type<any>, Map<ProviderToken, StoredProvider<any>>>();

  private constructor() {}

  public static get instance(): Container {
    if (!Container._instance) {
      Container._instance = new Container();
    }
    return Container._instance;
  }

  public static getRequestContext(): RequestContext | undefined {
    return requestAsyncStorage.getStore();
  }

  public static runInRequestContext<R>(context: RequestContext, fn: () => R): R {
    return requestAsyncStorage.run(context, fn);
  }

  public register(providers: Provider[], moduleKey?: Type<any>): void {
    for (const provider of providers) {
      this.registerProvider(provider, moduleKey);
    }
  }

  private registerProvider(providerDefinition: Provider, moduleKey?: Type<any>): void {
    let token: ProviderToken;
    let scope: Scope = Scope.SINGLETON; // Default scope

    if (isTypeProvider(providerDefinition)) {
      // It's a class type (e.g., MyService)
      token = providerDefinition;
      const injectableMeta = Reflect.getMetadata(INJECTABLE_METADATA, providerDefinition);
      if (injectableMeta && injectableMeta.scope !== undefined) {
        scope = injectableMeta.scope;
      }
    } else if (isCustomProvider(providerDefinition)) {
      token = providerDefinition.provide;
      if (providerDefinition.scope !== undefined) {
        scope = providerDefinition.scope;
      }
    } else {
      console.warn('Attempted to register an invalid provider:', providerDefinition);
      return; // Or throw error
    }
    
    const storedProvider: StoredProvider = {
      definition: providerDefinition,
      scope: scope,
      resolved: isValueProvider(providerDefinition) // Value providers are resolved immediately
    };
    if (isValueProvider(providerDefinition)) {
      storedProvider.instance = providerDefinition.useValue;
    }

    if (moduleKey) {
      if (!this.moduleProviders.has(moduleKey)) {
        this.moduleProviders.set(moduleKey, new Map());
      }
      this.moduleProviders.get(moduleKey)!.set(token, storedProvider);
    } else {
      this.globalProviders.set(token, storedProvider);
    }
  }
  
  public async get<T = any>(token: ProviderToken, moduleKey?: Type<any>): Promise<T> {
    const requestContext = Container.getRequestContext();

    // 1. Check Request Scope Cache (if applicable)
    if (requestContext?.container?.has(token)) {
      // If the token is in the request container, it implies it was request-scoped or
      // a dependency of a request-scoped provider resolved within this request.
      return requestContext.container.get(token) as T;
    }

    // 2. Find Provider Definition (Module then Global)
    let storedProvider: StoredProvider<T> | undefined;
    if (moduleKey && this.moduleProviders.has(moduleKey)) {
      storedProvider = this.moduleProviders.get(moduleKey)!.get(token) as StoredProvider<T> | undefined;
    }
    if (!storedProvider) {
      storedProvider = this.globalProviders.get(token) as StoredProvider<T> | undefined;
    }

    if (!storedProvider) {
      // If token is a class and not explicitly registered, try to auto-register as singleton
      if (typeof token === 'function' && token.prototype) {
         // Check if it's already being resolved to prevent circular dependency loops for implicit singletons
        if (requestContext && this.isResolvingInRequestContext(token, requestContext)) {
          throw new Error(`Circular dependency detected for ${String(token)} within request context.`);
        }
        this.markAsResolvingInRequestContext(token, requestContext);

        const injectableMeta = Reflect.getMetadata(INJECTABLE_METADATA, token);
        const scope = injectableMeta?.scope ?? Scope.SINGLETON;
        
        this.registerProvider(token as Type<any>, moduleKey); // Auto-register
        storedProvider = (moduleKey ? this.moduleProviders.get(moduleKey)!.get(token) : this.globalProviders.get(token)) as StoredProvider<T>;
        
        if (!storedProvider) { // Should not happen after auto-registering
             this.unmarkAsResolvingInRequestContext(token, requestContext);
             throw new Error(`Provider with token ${String(token)} not found even after attempting auto-registration.`);
        }
        // Proceed to resolve this newly registered provider
      } else {
        throw new Error(`Provider with token ${String(token)} not found.`);
      }
    }


    // If we are in a request context, and this token is currently being resolved, throw error.
    // This specific check is for the *current* token being resolved, not its dependencies.
    if (requestContext && storedProvider.scope !== Scope.TRANSIENT && this.isResolvingInRequestContext(token, requestContext)) {
        if (storedProvider.scope === Scope.SINGLETON && storedProvider.instance) {
            // Singleton already resolved, safe to return
        } else {
            throw new Error(`Circular dependency detected for ${String(token)}.`);
        }
    }
    if (requestContext && storedProvider.scope !== Scope.TRANSIENT) {
        this.markAsResolvingInRequestContext(token, requestContext);
    }


    // 3. Resolve Provider Based on Scope and Type
    if (storedProvider.scope === Scope.SINGLETON) {
      if (!storedProvider.resolved || !storedProvider.instance) {
        storedProvider.instance = await this.resolveValue(storedProvider, moduleKey);
        storedProvider.resolved = true;
      }
      if (requestContext) this.unmarkAsResolvingInRequestContext(token, requestContext);
      return storedProvider.instance!;
    }

    if (storedProvider.scope === Scope.TRANSIENT) {
      const instance = await this.resolveValue(storedProvider, moduleKey);
      // Do not cache transient, do not mark as resolving globally
      if (requestContext) this.unmarkAsResolvingInRequestContext(token, requestContext);
      return instance;
    }

    if (storedProvider.scope === Scope.REQUEST) {
      if (!requestContext) {
        if (requestContext) this.unmarkAsResolvingInRequestContext(token, requestContext);
        throw new Error(`Cannot resolve request-scoped provider ${String(token)} outside of a request context.`);
      }
      if (!requestContext.container) {
        requestContext.container = new Map<ProviderToken, any>();
      }
      // Instance should have already been returned from requestContext.container at the top if present.
      // If we reach here, it means it's not in the request cache yet.
      const instance = await this.resolveValue(storedProvider, moduleKey);
      requestContext.container.set(token, instance);
      if (requestContext) this.unmarkAsResolvingInRequestContext(token, requestContext);
      return instance;
    }
    
    // Should not reach here if scope is handled
    if (requestContext) this.unmarkAsResolvingInRequestContext(token, requestContext);
    throw new Error(`Unknown scope ${storedProvider.scope} for provider ${String(token)}.`);
  }

  private resolvingTokensInRequestContext = new WeakMap<RequestContext, Set<ProviderToken>>();

  private isResolvingInRequestContext(token: ProviderToken, context: RequestContext): boolean {
    return this.resolvingTokensInRequestContext.get(context)?.has(token) || false;
  }

  private markAsResolvingInRequestContext(token: ProviderToken, context?: RequestContext): void {
    if (!context) return;
    if (!this.resolvingTokensInRequestContext.has(context)) {
      this.resolvingTokensInRequestContext.set(context, new Set());
    }
    this.resolvingTokensInRequestContext.get(context)!.add(token);
  }

  private unmarkAsResolvingInRequestContext(token: ProviderToken, context?: RequestContext): void {
    if (!context) return;
    this.resolvingTokensInRequestContext.get(context)?.delete(token);
  }


  private async resolveValue<T>(storedProvider: StoredProvider<T>, moduleKey?: Type<any>): Promise<T> {
    const provider = storedProvider.definition;

    if (isValueProvider(provider)) {
      return provider.useValue as T;
    }

    if (isTypeProvider(provider)) { // e.g. @Injectable() class MyService (no explicit .provide)
      return this.instantiate<T>(provider, moduleKey);
    }

    if (isClassProvider(provider)) {
      return this.instantiate<T>(provider.useClass, moduleKey);
    }

    if (isFactoryProvider(provider)) {
      const deps = [];
      if (provider.inject) {
        for (const depTokenOrConfig of provider.inject) {
          let depToken: ProviderToken;
          let optional = false;
          if (typeof depTokenOrConfig === 'object' && depTokenOrConfig !== null && 'token' in depTokenOrConfig) {
            depToken = depTokenOrConfig.token;
            optional = !!depTokenOrConfig.optional;
          } else {
            depToken = depTokenOrConfig as ProviderToken;
          }
          
          try {
            deps.push(await this.get(depToken, moduleKey));
          } catch (error) {
            if (optional) {
              deps.push(undefined);
            } else {
              throw error; // Re-throw if not optional and resolution failed
            }
          }
        }
      }
      const result = provider.useFactory(...deps);
      return (result instanceof Promise) ? await result : result;
    }
    
    if (isExistingProvider(provider)) {
        return this.get<T>(provider.useExisting, moduleKey);
    }

    throw new Error('Unknown provider type in resolveValue');
  }
  
  private async instantiate<T>(target: Type<T>, moduleKey?: Type<any>): Promise<T> {
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
    const injectionMetadata = Reflect.getMetadata(INJECT_METADATA, target) || [];
    
    const deps = await Promise.all(paramTypes.map(async (paramType: Type<any> | undefined, index: number) => {
      const customInjection = injectionMetadata.find((meta: any) => meta.index === index);
      const depToken = customInjection ? customInjection.token : paramType;

      if (depToken === undefined) {
          // This can happen for example with circular dependencies in JS if not careful,
          // or if a type could not be resolved by TypeScript (e.g. interface used as token without @Inject)
          const paramName = target.prototype.constructor.toString().match(/constructor\s*\(([^)]*)/)?.[1].split(',')[index]?.trim();
          throw new Error(
            `Cannot resolve dependency for parameter at index ${index}` +
            (paramName ? ` (parameter: ${paramName})` : '') +
            ` in ${target.name} constructor. ` +
            `Make sure it's a class, or if it's an interface/symbol, use @Inject(). `+
            `Also check for circular dependencies.`
          );
      }
      return this.get(depToken, moduleKey);
    }));
    
    return new target(...deps);
  }

  public clear(): void {
    this.globalProviders.clear();
    this.moduleProviders.clear();
    // this.requestScopedCache.clear(); // If using WeakMap for request scope directly
  }
}

// Export a singleton instance
export const DIContainer = Container.instance; 