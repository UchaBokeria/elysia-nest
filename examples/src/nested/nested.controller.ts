import { Controller, Get } from "elysia-nest";

@Controller()
export class NestedController {
  @Get('/')
  getHello() {
    return 'first level nest';
  }
}
