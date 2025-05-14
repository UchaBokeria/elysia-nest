import { Injectable } from '../../src';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Hello World!' };
  }
} 