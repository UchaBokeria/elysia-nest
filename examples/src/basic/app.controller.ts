import { Controller, Get } from 'elysia-nest';
import { AppService } from './app.service';

@Controller('ctrl')
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get('hello')
  getHello() {
    return this.appService.getHello();
  }
} 