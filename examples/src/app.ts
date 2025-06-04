import { Bootstrap, Module } from "elysia-nest";
import { BasicModule } from "./basic/app.module";
import { NestedModule } from "./nested/nested.module";

@Module({
  prefix: '/app',
  children: [BasicModule, NestedModule],
})
export class AppModule {} 

export const appEntryPoint = async () => {
    const elysiaApp = await Bootstrap(AppModule);
    
    // adding custom handlers to elysia app
    elysiaApp.get('/custom', () => 'I\'m handled by custom handler');

    console.log('all routes', elysiaApp.routes)
    return elysiaApp;
};
