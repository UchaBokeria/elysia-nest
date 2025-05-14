/**
 * Class to manage lifecycle hooks across the application
 */
export declare class LifecycleManager {
    private providers;
    /**
     * Register a provider with lifecycle hooks
     */
    register(provider: any): void;
    /**
     * Trigger onModuleInit hooks for all registered providers
     */
    triggerOnModuleInit(): void;
    /**
     * Trigger onApplicationBootstrap hooks for all registered providers
     */
    triggerOnApplicationBootstrap(): void;
    /**
     * Trigger onModuleDestroy hooks for all registered providers
     */
    triggerOnModuleDestroy(): void;
    /**
     * Trigger beforeApplicationShutdown hooks for all registered providers
     */
    triggerBeforeApplicationShutdown(): void;
    /**
     * Trigger onApplicationShutdown hooks for all registered providers
     */
    triggerOnApplicationShutdown(): void;
}
/**
 * Get the global lifecycle manager instance
 */
export declare function getLifecycleManager(): LifecycleManager;
