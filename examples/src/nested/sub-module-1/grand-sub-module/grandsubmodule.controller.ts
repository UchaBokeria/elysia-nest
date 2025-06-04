import { Controller, Get } from "elysia-nest";

@Controller()
export class GrandSubModuleController {
  @Get()
  getHello() {
    return 'grand sub module';
  }
}