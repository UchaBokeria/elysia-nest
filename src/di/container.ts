import 'reflect-metadata';
import { INJECTABLE_METADATA, INJECT_METADATA, type Type } from './injectable.decorator';

export class Container {
  private static instance: Container;
  private providers = new Map<any, any>();
  private moduleProviders = new Map<any, Map<any, any>>();

  private constructor() {}

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Register a provider in the global container
   */
  public addProvider<T>(token: Type<T> | string | symbol, provider: any): void {
    this.providers.set(token, provider);
  }

  /**
   * Register a provider in a specific module's scope
   */
  public addModuleProvider<T>(
    moduleToken: Type<any>,
    providerToken: Type<T> | string | symbol, 
    provider: any
  ): void {
    if (!this.moduleProviders.has(moduleToken)) {
      this.moduleProviders.set(moduleToken, new Map());
    }
    
    const moduleMap = this.moduleProviders.get(moduleToken);
    moduleMap?.set(providerToken, provider);
  }

  /**
   * Get provider instance or create it if it doesn't exist
   */
  public get<T>(token: Type<T> | string | symbol, moduleToken?: Type<any>): T {
    // Try to find the provider in the module scope first
    if (moduleToken && this.moduleProviders.has(moduleToken)) {
      const moduleMap = this.moduleProviders.get(moduleToken);
      if (moduleMap?.has(token)) {
        return moduleMap.get(token);
      }
    }
    
    // Fall back to the global scope
    if (this.providers.has(token)) {
      return this.providers.get(token);
    }

    // If token is a class (Type), instantiate it
    if (typeof token === 'function') {
      const instance = this.instantiate(token);
      this.providers.set(token, instance);
      return instance;
    }

    throw new Error(`Provider with token ${String(token)} not found!`);
  }

  /**
   * Create an instance of a class with its dependencies
   */
  private instantiate<T>(target: Type<T>): T {
    // Check constructor parameters
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
    const injectionMetadata = Reflect.getMetadata(INJECT_METADATA, target) || [];
    
    // Create the dependencies for this class
    const deps = paramTypes.map((paramType: Type, index: number) => {
      // Check if we have a custom injection token for this index
      const customInjection = injectionMetadata.find((meta: any) => meta.index === index);
      if (customInjection) {
        return this.get(customInjection.token);
      }
      
      // Otherwise use the parameter type
      return this.get(paramType);
    });
    
    return new target(...deps);
  }

  /**
   * Clear all providers (mainly for testing)
   */
  public clear(): void {
    this.providers.clear();
    this.moduleProviders.clear();
  }
}

// Export a singleton instance
export const DIContainer = Container.getInstance(); 