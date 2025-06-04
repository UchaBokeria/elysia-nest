import { Controller, Get } from "elysia-nest";

@Controller()
export class SubModule2Controller {
  @Get('/')
  getHello() {
    return 'second level nest module 2';
  }
}