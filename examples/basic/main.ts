import { Elysia } from 'elysia';
import { initializeApp } from '../../src';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await initializeApp(new Elysia(), AppModule);
  
  app.listen(3000);
  console.log(`Server is running on http://localhost:3000`);
}

bootstrap(); 