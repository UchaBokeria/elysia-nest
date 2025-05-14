/**
 * Context for guards
 */
export interface GuardContext {
  request: any;
  path: string;
  method: string;
}

/**
 * Interface for guards
 */
export interface CanActivate {
  /**
   * Method to determine if a request should proceed
   * @param context The request context
   */
  canActivate(context: GuardContext): Promise<boolean> | boolean;
} 