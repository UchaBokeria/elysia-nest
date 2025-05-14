export interface RouteMetadata {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
    path: string;
    propertyKey: string;
}
export interface ModuleOptions {
    imports?: any[];
    controllers?: any[];
    providers?: any[];
    middlewares?: any[];
    exports?: any[];
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
