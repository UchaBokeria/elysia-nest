export type ProviderItem = any;
/**
 * Register providers with a module
 */
export declare function registerProviders(providerItems: ProviderItem[], moduleRef: any): void;
/**
 * Resolve a provider from a module
 */
export declare function resolveProvider(providerItem: ProviderItem, moduleRef: any): any;
