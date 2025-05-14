// Route metadata
export interface RouteMetadata {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
  path: string;
  propertyKey: string;
}

// Module options
export interface ModuleOptions {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
  middlewares?: any[];
  exports?: any[];
}

// Parameter decorator metadata
export interface ParamMetadata {
  index: number;
  type: string;
  data?: any;
}

// ExceptionFilter metadata
export interface ExceptionFilterMetadata {
  filter: any;
  exception: any;
}

// Interceptor metadata
export interface InterceptorMetadata {
  interceptor: any;
} 