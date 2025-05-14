import { INJECTABLE_METADATA } from '../decorators/constants';

/**
 * Injectable decorator for services and providers
 * Marks a class as available for dependency injection
 */
export function Injectable() {
  return function (target: any) {
    Reflect.defineMetadata(INJECTABLE_METADATA, true, target);
    return target;
  };
} 