/**
 * Represents a cron expression for scheduled tasks
 */
export interface CronExpression {
  /**
   * Convert to a string representation
   */
  toString(): string;
}

/**
 * Fixed cron expression
 */
export class FixedCronExpression implements CronExpression {
  constructor(private readonly expression: string) {}
  
  toString(): string {
    return this.expression;
  }
}

/**
 * Cron expression presets
 */
export class CronExpressions {
  /**
   * Every second
   */
  static EVERY_SECOND = new FixedCronExpression('* * * * * *');
  
  /**
   * Every 5 seconds
   */
  static EVERY_5_SECONDS = new FixedCronExpression('*/5 * * * * *');
  
  /**
   * Every 10 seconds
   */
  static EVERY_10_SECONDS = new FixedCronExpression('*/10 * * * * *');
  
  /**
   * Every 30 seconds
   */
  static EVERY_30_SECONDS = new FixedCronExpression('*/30 * * * * *');
  
  /**
   * Every minute
   */
  static EVERY_MINUTE = new FixedCronExpression('0 * * * * *');
  
  /**
   * Every 5 minutes
   */
  static EVERY_5_MINUTES = new FixedCronExpression('0 */5 * * * *');
  
  /**
   * Every 10 minutes
   */
  static EVERY_10_MINUTES = new FixedCronExpression('0 */10 * * * *');
  
  /**
   * Every 30 minutes
   */
  static EVERY_30_MINUTES = new FixedCronExpression('0 */30 * * * *');
  
  /**
   * Every hour
   */
  static EVERY_HOUR = new FixedCronExpression('0 0 * * * *');
  
  /**
   * Every day at midnight
   */
  static EVERY_DAY_AT_MIDNIGHT = new FixedCronExpression('0 0 0 * * *');
  
  /**
   * Every day at noon
   */
  static EVERY_DAY_AT_NOON = new FixedCronExpression('0 0 12 * * *');
  
  /**
   * Every Sunday
   */
  static EVERY_SUNDAY = new FixedCronExpression('0 0 0 * * 0');
  
  /**
   * Every Monday
   */
  static EVERY_MONDAY = new FixedCronExpression('0 0 0 * * 1');
  
  /**
   * Every first day of the month
   */
  static EVERY_1ST_DAY_OF_MONTH = new FixedCronExpression('0 0 0 1 * *');
}

/**
 * Validates if a string is a valid cron expression
 */
export function isValidCronExpression(expression: string): boolean {
  // Basic validation (could be more comprehensive)
  const segments = expression.split(' ');
  
  // Standard cron has 6 segments: second minute hour day month day-of-week
  if (segments.length !== 6) {
    return false;
  }
  
  return true;
} 