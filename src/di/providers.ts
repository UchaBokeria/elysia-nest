import { INJECTABLE_METADATA } from '../decorators/constants';

// Type for dependency injection providers
export type ProviderItem = any;

// Store for providers
const providers = new Map<any, Map<any, any>>();

/**
 * Register providers with a module
 */
export function registerProviders(providerItems: ProviderItem[], moduleRef: any): void {
  if (!providers.has(moduleRef)) {
    providers.set(moduleRef, new Map());
  }

  const moduleProviders = providers.get(moduleRef)!;
  
  for (const provider of providerItems) {
    // If it's a class (has prototype) and not already registered
    if (typeof provider === 'function' && !moduleProviders.has(provider)) {
      const instance = new provider();
      moduleProviders.set(provider, instance);
    }
  }
}

/**
 * Resolve a provider from a module
 */
export function resolveProvider(providerItem: ProviderItem, moduleRef: any): any {
  const moduleProviders = providers.get(moduleRef);
  if (!moduleProviders) {
    return null;
  }

  // If it's a class provider, check if we have an instance
  if (typeof providerItem === 'function') {
    const instance = moduleProviders.get(providerItem);
    if (instance) {
      return instance;
    }

    // If we don't have an instance yet, create one
    const newInstance = new providerItem();
    moduleProviders.set(providerItem, newInstance);
    return newInstance;
  }

  return null;
} 