import { type Type } from './injectable.decorator';

/**
 * Basic interface for all providers
 */
export interface Provider<T = any> {
  provide: Type<T> | string | symbol;
  useValue?: T;
  useClass?: Type<T>;
  useFactory?: (...args: any[]) => T;
  inject?: Array<Type<any> | string | symbol>;
}

/**
 * Class provider - will instantiate the class when requested
 */
export interface ClassProvider<T = any> {
  provide: Type<T> | string | symbol;
  useClass: Type<T>;
}

/**
 * Value provider - returns a static value
 */
export interface ValueProvider<T = any> {
  provide: Type<T> | string | symbol;
  useValue: T;
}

/**
 * Factory provider - uses a factory function to create an instance
 */
export interface FactoryProvider<T = any> {
  provide: Type<T> | string | symbol;
  useFactory: (...args: any[]) => T;
  inject?: Array<Type<any> | string | symbol>;
}

/**
 * Union type for all provider types
 */
export type ProviderItem<T = any> = Type<T> | ClassProvider<T> | ValueProvider<T> | FactoryProvider<T>; 