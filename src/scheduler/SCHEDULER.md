# Task Scheduler System

This project implements a task scheduling system similar to NestJS's Scheduler module, allowing for scheduled task execution using various timing mechanisms.

## Key Features

- Cron-based scheduling for recurring tasks
- Interval-based scheduling for fixed time periods
- Timeout scheduling for delayed execution
- Date-based scheduling for specific future times
- Decorator-based task definition
- Automatic task cleanup on application shutdown

## Core Components

### Scheduler Service

The `Scheduler` class provides the core functionality for task scheduling:

- `scheduleCron(expression, callback, options)`: Schedule a task using a cron expression
- `scheduleInterval(milliseconds, callback, options)`: Schedule a task to run at fixed intervals
- `scheduleTimeout(delay, callback, options)`: Schedule a task to run once after a delay
- `scheduleAt(date, callback, options)`: Schedule a task to run at a specific date/time
- `cancelAllTasks()`: Cancel all scheduled tasks
- `getTasks()`: Get all active tasks

### Decorators

The scheduler system provides decorators for easier task definition:

- `@Cron(expression, options)`: Define a cron job
- `@Interval(milliseconds, options)`: Define an interval job
- `@Timeout(milliseconds, options)`: Define a timeout job
- `@ScheduleAt(date, options)`: Define a job at a specific date/time

## Usage Patterns

### Decorator-based Scheduling

You can use decorators for declarative task scheduling:

```typescript
import { Injectable } from '@/utils/core';
import { Cron, Interval, Timeout, ScheduleAt, CronExpressions } from '@/scheduler';

@Injectable()
export class TasksService {
  // Run every 10 seconds
  @Cron(CronExpressions.EVERY_10_SECONDS)
  async handleCron() {
    console.log('Running cron task every 10 seconds');
    // Do something...
  }
  
  // Run every 30 seconds
  @Interval(30000)
  async handleInterval() {
    console.log('Running interval task every 30 seconds');
    // Do something...
  }
  
  // Run once after 5 seconds
  @Timeout(5000)
  async handleTimeout() {
    console.log('Running timeout task after 5 seconds');
    // Do something...
  }
  
  // Run at a specific date/time
  @ScheduleAt(new Date('2023-12-31T23:59:59'))
  async handleNewYearsEve() {
    console.log('Happy New Year!');
    // Do something...
  }
}
```

### Programmatic Scheduling

You can also schedule tasks programmatically:

```typescript
import { Injectable } from '@/utils/core';
import { getScheduler, CronExpressions } from '@/scheduler';

@Injectable()
export class DynamicTasksService {
  startTasks() {
    const scheduler = getScheduler();
    
    // Schedule a cron job
    const cronTask = scheduler.scheduleCron(
      CronExpressions.EVERY_MINUTE,
      () => console.log('Minute passed!'),
      { name: 'minuteTask' }
    );
    
    // Schedule an interval
    const intervalTask = scheduler.scheduleInterval(
      5000,
      () => console.log('5 seconds passed!'),
      { name: 'fiveSecondTask' }
    );
    
    // Schedule a one-time task
    const timeoutTask = scheduler.scheduleTimeout(
      10000,
      () => console.log('10 seconds passed!'),
      { name: 'tenSecondTask' }
    );
    
    // Cancel a specific task after 30 seconds
    setTimeout(() => {
      intervalTask.cancel();
      console.log(`Canceled task: ${intervalTask.name}`);
    }, 30000);
  }
}
```

## Task Options

Each scheduling method accepts options:

- `name`: Custom name for the task
- `executeOnInit`: Whether to execute the task immediately (default: false)
- `timeout`: Optional timeout for task execution
- `timeZone`: Timezone for cron tasks
- `stopOnShutdown`: Whether to stop intervals on application shutdown
- `cancelOnShutdown`: Whether to cancel timeouts on application shutdown

## Integration with Lifecycle Hooks

The scheduler system integrates with the application lifecycle:

- Tasks are automatically registered when services are created
- All tasks are canceled when the application shuts down through lifecycle hooks
- Task handles can be stored and managed by services

## Examples

See the examples in `src/examples/scheduler` for demonstration of:

1. Basic scheduled tasks with different timing mechanisms
2. Dynamic task creation and management
3. Task cancellation and monitoring
4. Integration with events for event-triggered scheduling 