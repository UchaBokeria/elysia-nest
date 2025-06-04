import { Controller, Get } from "elysia-nest";

@Controller()
export class SubModule1Controller {
  @Get('')
  getHello() {
    return 'second level nest module 1';
  }
}