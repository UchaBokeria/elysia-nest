export interface Scheduler {
    addJob(name: string, cronExpression: string, callback: Function): void;
    removeJob(name: string): void;
}
export declare function getScheduler(): Scheduler;
