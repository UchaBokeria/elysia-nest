import type { 
  OnModuleInit, 
  OnApplicationBootstrap,
  OnModuleDestroy, 
  BeforeApplicationShutdown,
  OnApplicationShutdown
} from '../interfaces/lifecycle.interface';

/**
 * Class to manage lifecycle hooks across the application
 */
export class LifecycleManager {
  private providers: any[] = [];

  /**
   * Register a provider with lifecycle hooks
   */
  register(provider: any) {
    if (provider) {
      this.providers.push(provider);
    }
  }

  /**
   * Trigger onModuleInit hooks for all registered providers
   */
  triggerOnModuleInit() {
    for (const provider of this.providers) {
      if (typeof provider === 'object' && (provider as OnModuleInit).onModuleInit) {
        (provider as OnModuleInit).onModuleInit();
      }
    }
  }

  /**
   * Trigger onApplicationBootstrap hooks for all registered providers
   */
  triggerOnApplicationBootstrap() {
    for (const provider of this.providers) {
      if (typeof provider === 'object' && (provider as OnApplicationBootstrap).onApplicationBootstrap) {
        (provider as OnApplicationBootstrap).onApplicationBootstrap();
      }
    }
  }

  /**
   * Trigger onModuleDestroy hooks for all registered providers
   */
  triggerOnModuleDestroy() {
    for (const provider of this.providers) {
      if (typeof provider === 'object' && (provider as OnModuleDestroy).onModuleDestroy) {
        (provider as OnModuleDestroy).onModuleDestroy();
      }
    }
  }

  /**
   * Trigger beforeApplicationShutdown hooks for all registered providers
   */
  triggerBeforeApplicationShutdown() {
    for (const provider of this.providers) {
      if (typeof provider === 'object' && (provider as BeforeApplicationShutdown).beforeApplicationShutdown) {
        (provider as BeforeApplicationShutdown).beforeApplicationShutdown();
      }
    }
  }

  /**
   * Trigger onApplicationShutdown hooks for all registered providers
   */
  triggerOnApplicationShutdown() {
    for (const provider of this.providers) {
      if (typeof provider === 'object' && (provider as OnApplicationShutdown).onApplicationShutdown) {
        (provider as OnApplicationShutdown).onApplicationShutdown();
      }
    }
  }
}

// Global lifecycle manager instance
let lifecycleManager: LifecycleManager | null = null;

/**
 * Get the global lifecycle manager instance
 */
export function getLifecycleManager(): LifecycleManager {
  if (!lifecycleManager) {
    lifecycleManager = new LifecycleManager();
  }
  return lifecycleManager;
} 