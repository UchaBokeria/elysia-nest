# Dependency Injection System

This directory contains a custom dependency injection system inspired by NestJS. It allows for registration and resolution of providers in a modular way.

## Basic Usage

### Creating Injectable Services

```typescript
import { Injectable } from '@/utils/di';

@Injectable()
export class MyService {
  constructor() {
    // Initialize service
  }

  doSomething() {
    return 'Hello, world!';
  }
}
```

### Using Services in Controllers

```typescript
import { Controller, Get } from '@/utils/core';
import { MyService } from './my.service';

@Controller('/my-route')
export class MyController {
  constructor(private readonly myService: MyService) {
    // Services are automatically injected
  }

  @Get()
  handleRequest() {
    return this.myService.doSomething();
  }
}
```

### Registering Services in a Module

```typescript
import { Module } from '@/utils/core';
import { MyController } from './my.controller';
import { MyService } from './my.service';

@Module({
  controllers: [MyController],
  providers: [MyService]
})
export class MyModule {}
```

## Advanced Usage

### Custom Providers

The DI system supports several types of providers:

1. **Class Providers** - Automatically instantiate a class

```typescript
@Module({
  providers: [MyService]
})
```

2. **Value Providers** - Provide a static value

```typescript
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: { apiKey: 'my-api-key' }
    }
  ]
})
```

3. **Factory Providers** - Use a factory function to create the instance

```typescript
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useFactory: (config) => createDatabaseConnection(config),
      inject: ['CONFIG'] // Dependencies for the factory
    }
  ]
})
```

### Injecting Custom Providers

Use the `@Inject()` decorator to inject custom providers:

```typescript
import { Injectable, Inject } from '@/utils/di';

@Injectable()
export class MyService {
  constructor(
    @Inject('CONFIG') private readonly config: any,
    @Inject('DATABASE') private readonly db: any
  ) {}
}
```

### Module Imports and Exports

Modules can import other modules and re-export their providers:

```typescript
@Module({
  imports: [CommonModule],
  exports: [MyService]
})
export class MyModule {}
```

## Architecture

The DI system consists of several components:

- `injectable.decorator.ts` - Provides the `@Injectable()` and `@Inject()` decorators
- `container.ts` - Manages the instances of providers
- `provider.interfaces.ts` - Defines the types of providers
- `providers.ts` - Handles registration and resolution of providers

This architecture allows for easy extension and customization while providing a familiar API for developers familiar with NestJS. 