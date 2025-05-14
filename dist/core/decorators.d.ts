import 'reflect-metadata';
import { Elysia } from 'elysia';
import type { RouteMetadata, ModuleOptions } from '../decorators/types';
export interface ControllerMetadata {
    prefix: string;
    routes: RouteMetadata[];
}
export declare function Controller(prefix?: string): (constructor: Function) => void;
export declare function Module(options: ModuleOptions): () => (app: Elysia) => Elysia<"", {
    decorator: {};
    store: {};
    derive: {};
    resolve: {};
}, {
    typebox: import("@sinclair/typebox").TModule<{}>;
    error: {};
}, {
    schema: {};
    macro: {};
    macroFn: {};
    parser: {};
}, {}, {
    derive: {};
    resolve: {};
    schema: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
}>;
export declare function Factory(ModuleClass: any): (app: Elysia) => Elysia;
export declare function initializeApp<T extends Elysia>(app: T, moduleClass: any): Promise<T>;
