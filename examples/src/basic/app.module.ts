import { Module } from 'elysia-nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  prefix: '/basic',
  controllers: [AppController],
  providers: [AppService],
})
export class BasicModule {} 