export interface EventEmitter {
    emit(event: string, data?: any): void;
    on(event: string, callback: Function): void;
}
export declare function getEventEmitter(): EventEmitter;
