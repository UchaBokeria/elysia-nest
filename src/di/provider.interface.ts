import { Type } from './injectable.decorator';
import { Scope, ScopeOptions } from './scope-options.interface';

export type ProviderToken = Type<any> | string | symbol;

export interface BaseProvider extends ScopeOptions {
  provide: ProviderToken;
}

export interface TypeProvider extends Type<any> {}

export interface ValueProvider extends BaseProvider {
  useValue: any;
}

export interface ClassProvider extends BaseProvider {
  useClass: Type<any>;
}

export interface FactoryProvider<T = any> extends BaseProvider {
  useFactory: (...args: any[]) => T | Promise<T>;
  inject?: Array<ProviderToken | { token: ProviderToken; optional?: boolean }>;
}

export interface ExistingProvider extends BaseProvider {
  useExisting: ProviderToken;
}

export type Provider =
  | TypeProvider
  | ValueProvider
  | ClassProvider
  | FactoryProvider
  | ExistingProvider;

// Type guard to check if a provider is a TypeProvider (just a class)
export function isTypeProvider(provider: Provider): provider is TypeProvider {
  return typeof provider === 'function';
}

// Type guard to check if a provider is a CustomProvider (object with 'provide' key)
export function isCustomProvider(provider: Provider): provider is ValueProvider | ClassProvider | FactoryProvider | ExistingProvider {
  return typeof provider === 'object' && provider !== null && 'provide' in provider;
}

// Type guard for FactoryProvider
export function isFactoryProvider(provider: Provider): provider is FactoryProvider {
  return isCustomProvider(provider) && 'useFactory' in provider;
}

// Type guard for ValueProvider
export function isValueProvider(provider: Provider): provider is ValueProvider {
  return isCustomProvider(provider) && 'useValue' in provider;
}

// Type guard for ClassProvider
export function isClassProvider(provider: Provider): provider is ClassProvider {
  return isCustomProvider(provider) && 'useClass' in provider;
}

// Type guard for ExistingProvider
export function isExistingProvider(provider: Provider): provider is ExistingProvider {
  return isCustomProvider(provider) && 'useExisting' in provider;
} 