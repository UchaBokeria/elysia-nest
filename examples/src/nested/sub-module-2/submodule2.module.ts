import { Module } from "elysia-nest";
import { SubModule2Controller } from "./submodule2.controller";

@Module({
  prefix: '/sub-module-2',
  controllers: [SubModule2Controller],
})
export class SubModule2Module {} 