import 'reflect-metadata';

export const INJECTABLE_METADATA = Symbol('INJECTABLE_METADATA');

export interface Type<T = any> {
  new (...args: any[]): T;
}

export interface InjectableOptions {
  scope?: 'singleton' | 'transient';
  providedIn?: 'root' | Type<any> | null;
}

const defaultOptions: InjectableOptions = {
  scope: 'singleton',
  providedIn: 'root',
};

export function Injectable(options: InjectableOptions = defaultOptions): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(INJECTABLE_METADATA, { ...defaultOptions, ...options }, target);
    return target;
  };
}

// An array for keeping track of dependencies
export const INJECT_METADATA = Symbol('INJECT_METADATA');

export function Inject(token: any): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams = Reflect.getMetadata(INJECT_METADATA, target) || [];
    existingParams.push({ index: parameterIndex, token });
    Reflect.defineMetadata(INJECT_METADATA, existingParams, target);
  };
} 