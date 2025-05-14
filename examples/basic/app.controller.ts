import { Controller, Get } from '../../src';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get('hello')
  getHello() {
    return this.appService.getHello();
  }
} 