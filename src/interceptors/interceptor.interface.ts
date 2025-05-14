/**
 * Interface for request interceptors
 */
export interface Interceptor {
  /**
   * Method to intercept incoming requests
   * @param context The request context
   */
  intercept(context: any): Promise<boolean | void> | boolean | void;
}

/**
 * Interface for response interceptors
 */
export interface ResponseInterceptor {
  /**
   * Method to intercept outgoing responses
   * @param context The response context
   */
  interceptAfter(context: any): Promise<any> | any;
} 