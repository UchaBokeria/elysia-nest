import { ScheduledTaskBase } from './task.base';
import type { TaskCallback, TimeoutTaskOptions } from './scheduler.interface';

/**
 * Task that runs once after a delay
 */
export class TimeoutTask extends ScheduledTaskBase {
  /**
   * Node.js timeout handle
   */
  private timeoutId: NodeJS.Timeout | null = null;
  
  /**
   * Create a new timeout task
   */
  constructor(
    private readonly delayMs: number,
    callback: TaskCallback,
    private readonly options: TimeoutTaskOptions = {}
  ) {
    super(callback, options.name);
    this.start();
  }
  
  /**
   * Start the timeout task
   */
  private start(): void {
    // Execute immediately if specified
    if (this.options.executeOnInit) {
      this.executeCallback();
      this._canceled = true;
      return;
    }
    
    // Set up the timeout
    this.timeoutId = setTimeout(async () => {
      if (this._canceled) {
        return;
      }
      
      await this.executeCallback();
      this._canceled = true;
      this.timeoutId = null;
    }, this.delayMs);
  }
  
  /**
   * Cancel the timeout task
   */
  public cancel(): void {
    if (this._canceled) {
      return;
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    this._canceled = true;
  }
} 