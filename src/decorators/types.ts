import { Provider } from '../di/provider.interface'; // Import Provider type
import { MiddlewareType } from '../interfaces/middleware.interface'; // Import MiddlewareType

// Route metadata
export interface RouteMetadata {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
  path: string;
  propertyKey: string;
}

// Module options
export interface ModuleOptions {
  prefix?: string;
  imports?: any[];
  controllers?: any[];
  providers?: Provider[]; // Use the new Provider type
  middlewares?: MiddlewareType[]; // Use the new MiddlewareType
  exports?: any[];
  children?: any[];
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