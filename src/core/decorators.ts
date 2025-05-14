import 'reflect-metadata';
import { Elysia } from 'elysia';
import { ROUTE_PREFIX_METADATA, ROUTE_METADATA, MODULE_METADATA } from '../decorators/constants';
import { registerProviders, resolveProvider } from '../di';
import { getLifecycleManager } from '../lifecycle/lifecycle-manager';

// Types
import type { RouteMetadata, ModuleOptions } from '../decorators/types';
import type { 
  OnModuleInit, 
  OnApplicationBootstrap,
  OnModuleDestroy
} from '../interfaces/lifecycle.interface';

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
export function Module(options: ModuleOptions) {
  // Create a factory function that will be the actual decorated value
  const moduleFactory = function () {
    // Get the lifecycle manager
    const lifecycleManager = getLifecycleManager();
    
    // Create a plugin function that Elysia can use directly
    const plugin = function (app: Elysia) {
      const metadata: ModuleOptions = Reflect.getMetadata(MODULE_METADATA, moduleFactory);

      if (!metadata) {
        throw new Error(`No metadata found for module. Did you add @Module() decorator?`);
      }

      // Register providers if any are provided
      const providers: any[] = [];
      if (metadata.providers && metadata.providers.length > 0) {
        registerProviders(metadata.providers, moduleFactory as any);
        
        // Keep track of all provider instances for lifecycle hooks
        metadata.providers.forEach(provider => {
          const instance = resolveProvider(provider, moduleFactory as any);
          if (instance) {
            providers.push(instance);
            
            // Register with lifecycle manager
            lifecycleManager.register(instance);
          }
        });
      }

      // Run onModuleInit for this module's providers
      providers.forEach(provider => {
        if (typeof provider === 'object' && (provider as unknown as OnModuleInit).onModuleInit) {
          (provider as unknown as OnModuleInit).onModuleInit();
        }
      });

      // Import other modules first (if any)
      if (metadata.imports && metadata.imports.length > 0) {
        for (const importedModule of metadata.imports) {
          // Create an instance of the module
          const moduleInstance = new importedModule();
          
          // Apply the module
          app = (moduleInstance as any)(app);
        }
      }

      // Return the modified app
      return app;
    };

    return plugin;
  };

  // Store the module options as metadata on the factory function
  Reflect.defineMetadata(MODULE_METADATA, options, moduleFactory);
  
  // Return the factory function
  return moduleFactory;
}

// Factory function to create an Elysia plugin from a module class
export function Factory(ModuleClass: any): (app: Elysia) => Elysia {
  // Create module instance and return its plugin function
  const moduleInstance = new ModuleClass();
  return moduleInstance;
}

// Initialize the application with the root module
export async function initializeApp<T extends Elysia>(app: T, moduleClass: any): Promise<T> {
  const lifecycleManager = getLifecycleManager();
  
  // Apply the root module
  app = Factory(moduleClass)(app);
  
  // Call onApplicationBootstrap for all registered providers
  lifecycleManager.triggerOnApplicationBootstrap();
  
  // Return the app with the module applied
  return app;
} 