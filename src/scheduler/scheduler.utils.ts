import { getScheduler } from './scheduler.container';
import { SCHEDULED_JOBS_METADATA, ScheduledJobType } from './scheduler.decorators';
import type { ScheduledJobMetadata } from './scheduler.decorators';
import type { TaskHandle } from './scheduler.interface';

/**
 * Register all scheduled jobs for a class instance
 */
export function registerScheduledJobs(instance: any): TaskHandle[] {
  const constructor = instance.constructor;
  const jobs = Reflect.getMetadata(SCHEDULED_JOBS_METADATA, constructor) || [];
  
  if (!jobs.length) {
    return [];
  }
  
  const scheduler = getScheduler();
  const taskHandles: TaskHandle[] = [];
  
  // Register each job
  for (const job of jobs) {
    const metadata = job as ScheduledJobMetadata;
    const methodName = metadata.methodName as string | symbol;
    const handler = instance[methodName].bind(instance);
    let taskHandle: TaskHandle;
    
    switch (metadata.type) {
      case ScheduledJobType.CRON:
        taskHandle = scheduler.scheduleCron(metadata.config, handler, metadata.options);
        break;
        
      case ScheduledJobType.INTERVAL:
        taskHandle = scheduler.scheduleInterval(metadata.config, handler, metadata.options);
        break;
        
      case ScheduledJobType.TIMEOUT:
        taskHandle = scheduler.scheduleTimeout(metadata.config, handler, metadata.options);
        break;
        
      case ScheduledJobType.DATE:
        taskHandle = scheduler.scheduleAt(metadata.config, handler, metadata.options);
        break;
        
      default:
        console.warn(`Unknown scheduled job type: ${metadata.type}`);
        continue;
    }
    
    console.log(`[Scheduler] Registered ${metadata.type} job: ${taskHandle.name}`);
    taskHandles.push(taskHandle);
  }
  
  return taskHandles;
} 