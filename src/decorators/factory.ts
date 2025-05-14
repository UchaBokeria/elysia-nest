import { Elysia } from 'elysia';
import { getModuleMetadata, getControllerMetadata, getRouteMiddleware } from './index';
import type { ModuleOptions, RouteMetadata } from './index';
import { errors } from '@utils/hbs/errors';
import { authMiddleware } from '@/middlewares/auth.middleware';

/**
 * Creates an Elysia app from a module
 * @param ModuleClass The module class
 * @returns A function that takes an Elysia app and returns an enhanced app
 */
export function moduleFactory(ModuleClass: any): (app: Elysia) => Elysia {
  return (app: Elysia) => {
    const metadata = getModuleMetadata(ModuleClass);

    if (!metadata) {
      throw new Error(
        `No metadata found for module ${ModuleClass.name}. Did you add @Module() decorator?`
      );
    }

    // Create module app with optional prefix
    const moduleApp = new Elysia({ prefix: metadata.prefix || '' }).use(errors);

    // Apply middlewares if provided
    if (metadata.middlewares && metadata.middlewares.length > 0) {
      metadata.middlewares.forEach((middleware) => {
        moduleApp.use(middleware);
      });
    }

    // Mount all controllers
    metadata.controllers.forEach((controllerClass) => {
      const instance = new controllerClass();
      const { prefix, routes } = getControllerMetadata(controllerClass);

      if (!routes || routes.length === 0) {
        console.warn(`No routes found for controller ${controllerClass.name}`);
        return;
      }

      const controllerApp = new Elysia({ prefix }).derive({ as: 'global' }, authMiddleware);

      for (const route of routes) {
        // Get route-specific middleware
        const middleware = getRouteMiddleware(controllerClass, route.propertyKey);

        // Create a middleware chain using controller app as base
        let routeHandler = controllerApp;

        // Apply all middleware to the route handler
        if (middleware && middleware.length > 0) {
          middleware.forEach((m: (app: Elysia) => Elysia) => {
            routeHandler = routeHandler.use(m);
          });
        }

        // Add the route using the appropriate method
        switch (route.method) {
          case 'get':
            routeHandler.get(
              route.path,
              instance[route.propertyKey as keyof typeof instance].bind(instance)
            );
            break;
          case 'post':
            routeHandler.post(
              route.path,
              instance[route.propertyKey as keyof typeof instance].bind(instance)
            );
            break;
          case 'put':
            routeHandler.put(
              route.path,
              instance[route.propertyKey as keyof typeof instance].bind(instance)
            );
            break;
          case 'delete':
            routeHandler.delete(
              route.path,
              instance[route.propertyKey as keyof typeof instance].bind(instance)
            );
            break;
          case 'patch':
            routeHandler.patch(
              route.path,
              instance[route.propertyKey as keyof typeof instance].bind(instance)
            );
            break;
        }
      }

      moduleApp.use(controllerApp);
    });

    // Initialize providers if available (for future dependency injection)
    if (metadata.providers && metadata.providers.length > 0) {
      // This is a placeholder for future dependency injection implementation
      // For now, we just instantiate the providers to make sure they're loaded
      metadata.providers.forEach((providerClass) => {
        new providerClass();
      });
    }

    return app.use(moduleApp);
  };
}

/**
 * Helper function to create a module plugin
 * @param ModuleClass The module class to create a plugin from
 */
export function Factory(ModuleClass: any): (app: Elysia) => Elysia {
  return moduleFactory(ModuleClass);
}

/**
 * Creates a module instance directly usable with Elysia's plugin system
 * @param ModuleClass The module class to create a plugin from
 * @returns An Elysia app with the module's routes and middleware
 */
export function modulePlugin(ModuleClass: any): Elysia {
  const app = new Elysia();
  return moduleFactory(ModuleClass)(app);
}
