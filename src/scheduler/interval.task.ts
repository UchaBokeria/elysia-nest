import { ScheduledTaskBase } from './task.base';
import type { IntervalTaskOptions, TaskCallback } from './scheduler.interface';

/**
 * Task that runs at regular intervals
 */
export class IntervalTask extends ScheduledTaskBase {
  /**
   * Node.js interval handle
   */
  private intervalId: NodeJS.Timeout | null = null;
  
  /**
   * Create a new interval task
   */
  constructor(
    private readonly intervalMs: number,
    callback: TaskCallback,
    private readonly options: IntervalTaskOptions = {}
  ) {
    super(callback, options.name);
    this.start();
  }
  
  /**
   * Start the interval task
   */
  private start(): void {
    // Execute immediately if specified
    if (this.options.executeOnInit) {
      this.executeCallback();
    }
    
    // Set up the interval
    this.intervalId = setInterval(async () => {
      if (this._canceled) {
        this.cancel();
        return;
      }
      
      await this.executeCallback();
    }, this.intervalMs);
  }
  
  /**
   * Cancel the interval task
   */
  public cancel(): void {
    if (this._canceled) {
      return;
    }
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this._canceled = true;
  }
} 