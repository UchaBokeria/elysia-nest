import { ROUTE_METADATA } from '../decorators/constants';
import type { RouteMetadata } from '../decorators/types';

// Method decorators using a common function to avoid repetition
function methodDecorator(method: RouteMetadata['method']) {
  return function (path: string = '') {
    return function (target: Object, propertyKey: string) {
      const routes = Reflect.getMetadata(ROUTE_METADATA, target.constructor) || [];
      routes.push({ method, path, propertyKey });
      Reflect.defineMetadata(ROUTE_METADATA, routes, target.constructor);
    };
  };
}

// HTTP method decorators
export const Get = methodDecorator('GET');
export const Post = methodDecorator('POST');
export const Put = methodDecorator('PUT');
export const Patch = methodDecorator('PATCH');
export const Delete = methodDecorator('DELETE'); 