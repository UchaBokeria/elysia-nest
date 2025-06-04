import 'reflect-metadata';
import { Elysia } from 'elysia';
import type { RouteMetadata, ModuleOptions } from '../decorators/types';
export interface ControllerMetadata {
    prefix: string;
    routes: RouteMetadata[];
}
export declare function Controller(prefix?: string): (constructor: Function) => void;
export declare const Module: (options: ModuleOptions) => any;
export declare function Bootstrap(rootModule: any): Promise<Elysia>;
