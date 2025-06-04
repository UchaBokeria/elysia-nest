import 'reflect-metadata';
import { ROUTE_METADATA, PARAMS_METADATA } from './constants';
import type { RouteMetadata, ParamMetadata } from './types';

// Helper to create HTTP method decorators
const createMappingDecorator = (method: RouteMetadata['method']) => 
  (path: string = ''): MethodDecorator => 
  (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const routes = Reflect.getOwnMetadata(ROUTE_METADATA, target.constructor) || [];
    routes.push({ method, path, propertyKey: propertyKey as string });
    Reflect.defineMetadata(ROUTE_METADATA, routes, target.constructor);
  };

export const Get = createMappingDecorator('GET');
export const Post = createMappingDecorator('POST');
export const Put = createMappingDecorator('PUT');
export const Delete = createMappingDecorator('DELETE');
export const Patch = createMappingDecorator('PATCH');
export const Options = createMappingDecorator('OPTIONS');
export const Head = createMappingDecorator('HEAD');

// Helper to create parameter decorators
const createParamDecorator = (type: string, data?: any) => 
  (): ParameterDecorator => 
  (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const params = Reflect.getOwnMetadata(PARAMS_METADATA, target.constructor, propertyKey as string) || [];
    params.push({ index: parameterIndex, type, data });
    // Sort by index to ensure parameters are processed in order
    params.sort((a: ParamMetadata, b: ParamMetadata) => a.index - b.index);
    Reflect.defineMetadata(PARAMS_METADATA, params, target.constructor, propertyKey as string);
  };

export const Body = createParamDecorator('body');
export const Param = (paramName: string) => createParamDecorator('param', paramName)();
export const Query = (queryName?: string) => createParamDecorator('query', queryName)(); // queryName optional for all queries
export const Req = createParamDecorator('request');
export const Res = createParamDecorator('response');
export const Ctx = createParamDecorator('context'); // For Elysia's full context
export const Headers = (headerName?: string) => createParamDecorator('headers', headerName)();
export const Ip = createParamDecorator('ip');
export const Session = createParamDecorator('session'); // Placeholder for session data
export const UploadedFile = createParamDecorator('file'); // Placeholder for single file
export const UploadedFiles = createParamDecorator('files'); // Placeholder for multiple files

// Decorator for the whole Elysia context object if needed directly
export const ElysiaContext = createParamDecorator('elysiaContext'); 