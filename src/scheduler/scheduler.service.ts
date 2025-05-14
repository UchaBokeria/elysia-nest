import { Injectable } from '@/utils/core';
import type { 
  CronTaskOptions, 
  IScheduler, 
  IntervalTaskOptions, 
  TaskCallback, 
  TaskHandle,
  TimeoutTaskOptions
} from './scheduler.interface';
import type { CronExpression } from './cron.interface';
import { IntervalTask } from './interval.task';
import { TimeoutTask } from './timeout.task';
import { CronTask } from './cron.task';
import { isValidCronExpression } from './cron.interface';
import type { 
  OnModuleDestroy, 
  BeforeApplicationShutdown 
} from '@/interfaces/lifecycle.interface';

/**
 * Service for scheduling tasks
 */
@Injectable()
export class Scheduler implements IScheduler, OnModuleDestroy, BeforeApplicationShutdown {
  /**
   * Map of all active tasks
   */
  private readonly tasks: Map<string, TaskHandle> = new Map();
  
  /**
   * Schedule a task to run at a cron time
   */
  scheduleCron(
    cronExpression: string | CronExpression,
    callback: TaskCallback,
    options: CronTaskOptions = {}
  ): TaskHandle {
    if (typeof cronExpression === 'string' && !isValidCronExpression(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }
    
    const task = new CronTask(cronExpression, callback, options);
    const handle = task.getHandle();
    this.tasks.set(handle.id, handle);
    
    return handle;
  }
  
  /**
   * Schedule a task to run at fixed intervals
   */
  scheduleInterval(
    intervalMs: number,
    callback: TaskCallback,
    options: IntervalTaskOptions = {}
  ): TaskHandle {
    if (intervalMs <= 0) {
      throw new Error(`Invalid interval: ${intervalMs}ms`);
    }
    
    const task = new IntervalTask(intervalMs, callback, options);
    const handle = task.getHandle();
    this.tasks.set(handle.id, handle);
    
    return handle;
  }
  
  /**
   * Schedule a task to run once after a delay
   */
  scheduleTimeout(
    delayMs: number,
    callback: TaskCallback,
    options: TimeoutTaskOptions = {}
  ): TaskHandle {
    if (delayMs < 0) {
      throw new Error(`Invalid delay: ${delayMs}ms`);
    }
    
    const task = new TimeoutTask(delayMs, callback, options);
    const handle = task.getHandle();
    this.tasks.set(handle.id, handle);
    
    return handle;
  }
  
  /**
   * Schedule a task to run at a specific date
   */
  scheduleAt(
    date: Date,
    callback: TaskCallback,
    options: TimeoutTaskOptions = {}
  ): TaskHandle {
    const now = new Date();
    const delay = date.getTime() - now.getTime();
    
    if (delay < 0) {
      throw new Error(`Cannot schedule task in the past: ${date}`);
    }
    
    return this.scheduleTimeout(delay, callback, options);
  }
  
  /**
   * Cancel all scheduled tasks
   */
  cancelAllTasks(): void {
    for (const handle of this.tasks.values()) {
      handle.cancel();
    }
    
    this.tasks.clear();
  }
  
  /**
   * Get all active tasks
   */
  getTasks(): TaskHandle[] {
    return Array.from(this.tasks.values()).filter(handle => !handle.isCanceled());
  }
  
  /**
   * Lifecycle hook - called before the application shuts down
   */
  beforeApplicationShutdown(): void | Promise<void> {
    this.cancelAllTasks();
    console.log(`[Scheduler] Canceled ${this.tasks.size} tasks during application shutdown`);
  }
  
  /**
   * Lifecycle hook - called when the module is destroyed
   */
  onModuleDestroy(): void | Promise<void> {
    this.cancelAllTasks();
  }
  
  /**
   * Remove tasks that are canceled
   */
  private cleanupCanceledTasks(): void {
    for (const [id, handle] of this.tasks.entries()) {
      if (handle.isCanceled()) {
        this.tasks.delete(id);
      }
    }
  }
} 