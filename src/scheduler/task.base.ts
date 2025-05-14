import { v4 as uuidv4 } from 'uuid';
import type { ScheduledTask, TaskCallback, TaskHandle } from './scheduler.interface';

/**
 * Base implementation for scheduled tasks
 */
export abstract class ScheduledTaskBase implements ScheduledTask {
  /**
   * Unique task identifier
   */
  public readonly id: string;
  
  /**
   * Task name
   */
  public readonly name: string;
  
  /**
   * Whether the task is canceled
   */
  protected _canceled: boolean = false;
  
  /**
   * Create a new scheduled task
   */
  constructor(
    protected readonly callback: TaskCallback,
    name?: string
  ) {
    this.id = uuidv4();
    this.name = name || `task-${this.id.substring(0, 8)}`;
  }
  
  /**
   * Cancel the task
   */
  public abstract cancel(): void;
  
  /**
   * Check if the task is canceled
   */
  public isCanceled(): boolean {
    return this._canceled;
  }
  
  /**
   * Get task handle
   */
  public getHandle(): TaskHandle {
    return {
      id: this.id,
      name: this.name,
      cancel: this.cancel.bind(this),
      isCanceled: this.isCanceled.bind(this)
    };
  }
  
  /**
   * Execute the task callback safely
   */
  protected async executeCallback(): Promise<void> {
    if (this._canceled) {
      return;
    }
    
    try {
      await Promise.resolve(this.callback());
    } catch (error) {
      console.error(`Error executing task ${this.name}:`, error);
    }
  }
} 