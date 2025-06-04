import { Provider } from '../di/provider.interface';
import { MiddlewareType } from '../interfaces/middleware.interface';
export interface RouteMetadata {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
    path: string;
    propertyKey: string;
}
export interface ModuleOptions {
    prefix?: string;
    imports?: any[];
    controllers?: any[];
    providers?: Provider[];
    middlewares?: MiddlewareType[];
    exports?: any[];
    children?: any[];
}
export interface ParamMetadata {
    index: number;
    type: string;
    data?: any;
}
export interface ExceptionFilterMetadata {
    filter: any;
    exception: any;
}
export interface InterceptorMetadata {
    interceptor: any;
}
