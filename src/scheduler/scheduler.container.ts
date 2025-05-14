import { Scheduler } from './scheduler.service';
import { getLifecycleManager } from '@/utils/lifecycle-container';

/**
 * Singleton container for the scheduler
 */
class SchedulerContainer {
  private static instance: SchedulerContainer;
  private readonly scheduler: Scheduler;
  
  private constructor() {
    this.scheduler = new Scheduler();
    
    // Register with lifecycle manager for shutdown hooks
    getLifecycleManager().register(this.scheduler);
  }
  
  /**
   * Get the singleton instance
   */
  static getInstance(): SchedulerContainer {
    if (!SchedulerContainer.instance) {
      SchedulerContainer.instance = new SchedulerContainer();
    }
    return SchedulerContainer.instance;
  }
  
  /**
   * Get the scheduler
   */
  getScheduler(): Scheduler {
    return this.scheduler;
  }
}

/**
 * Get the global scheduler instance
 */
export function getScheduler(): Scheduler {
  return SchedulerContainer.getInstance().getScheduler();
} 