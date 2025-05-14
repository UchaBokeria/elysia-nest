import { CronJob } from 'cron';
import { ScheduledTaskBase } from './task.base';
import type { CronTaskOptions, TaskCallback } from './scheduler.interface';
import type { CronExpression } from './cron.interface';

/**
 * Task that runs on a cron schedule
 */
export class CronTask extends ScheduledTaskBase {
  /**
   * Cron job instance
   */
  private cronJob: CronJob | null = null;
  
  /**
   * Create a new cron task
   */
  constructor(
    private readonly cronExpression: string | CronExpression,
    callback: TaskCallback,
    private readonly options: CronTaskOptions = {}
  ) {
    super(callback, options.name);
    this.start();
  }
  
  /**
   * Start the cron task
   */
  private start(): void {
    const expression = typeof this.cronExpression === 'string' 
      ? this.cronExpression 
      : this.cronExpression.toString();
    
    this.cronJob = new CronJob(
      expression,
      async () => {
        if (this._canceled) {
          this.cancel();
          return;
        }
        
        await this.executeCallback();
      },
      null, // onComplete
      true, // start
      this.options.timeZone // timeZone
    );
    
    // Execute immediately if specified
    if (this.options.executeOnInit) {
      this.executeCallback();
    }
  }
  
  /**
   * Cancel the cron task
   */
  public cancel(): void {
    if (this._canceled) {
      return;
    }
    
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    
    this._canceled = true;
  }
} 