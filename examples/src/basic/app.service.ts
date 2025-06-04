import { Injectable } from 'elysia-nest';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Hello World!' };
  }
} 