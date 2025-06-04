# Elysia-Nest

A NestJS-like framework for Bun using Elysia.

## Features

- **Modular Architecture**: Organize your code into modules
- **Dependency Injection**: Built-in IoC container
- **Decorators**: Use decorators to define routes, controllers, and more
- **Lifecycle Hooks**: Implement lifecycle hooks for your modules and providers
- **Guards**: Protect your routes with guards
- **Interceptors**: Transform requests and responses
- **Pipes**: Validate and transform data
- **Exception Filters**: Handle exceptions gracefully
- **Event System**: Publish and subscribe to events
- **Scheduler**: Schedule tasks and jobs

## Installation

```bash
# Using npm
npm install elysia-nest

# Using bun
bun add elysia-nest
```

## Quick Start

```typescript
// main.ts
import { Elysia } from 'elysia';
import { Bootstrap } from 'elysia-nest';
import { AppModule } from './app.module';

async function main() {
  const app = await Bootstrap(new Elysia(), AppModule);
  
  app.listen(3000);
  console.log(`Server is running on http://localhost:3000`);
}

main();
```

```typescript
// app.module.ts
import { Module } from 'elysia-nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```typescript
// app.controller.ts
import { Controller, Get } from 'elysia-nest';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get('hello')
  getHello() {
    return this.appService.getHello();
  }
}
```

```typescript
// app.service.ts
import { Injectable } from 'elysia-nest';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Hello World!' };
  }
}
```

## Core Concepts

### Modules

Modules are the building blocks of your application. They encapsulate related components like controllers, services, and other providers.

```typescript
@Module({
  imports: [OtherModule],
  controllers: [MyController],
  providers: [MyService],
  exports: [MyService],
})
export class MyModule {}
```

### Controllers

Controllers handle incoming requests and return responses to the client.

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### Providers

Providers are classes that can be injected into other components. Services are a common type of provider.

```typescript
@Injectable()
export class UsersService {
  private users = [];
  
  findAll() {
    return this.users;
  }
  
  findOne(id: string) {
    return this.users.find(user => user.id === id);
  }
  
  create(user) {
    this.users.push(user);
    return user;
  }
}
```

### Lifecycle Hooks

Implement lifecycle hooks to run code at specific points in your application's lifecycle.

```typescript
@Injectable()
export class AppService implements OnModuleInit, OnApplicationBootstrap {
  async onModuleInit() {
    console.log('Module initialized');
  }
  
  async onApplicationBootstrap() {
    console.log('Application bootstrapped');
  }
}
```
## Examples

The `examples` directory currently contains a basic "hello world" application to help you get started:

- **`examples/basic`**: Demonstrates a minimal setup with a single module, controller, and service, exposing a `GET /api/hello` endpoint. This example showcases the fundamental project structure and how components are wired together.

You can run this example by navigating to its directory, installing dependencies with `bun install`, and running `bun run dev`.

More detailed examples showcasing features like CRUD operations, authentication with Guards, usage of Interceptors, event-based communication, and scheduled tasks would be valuable additions to this project and may be added in the future.

## License

MIT 
