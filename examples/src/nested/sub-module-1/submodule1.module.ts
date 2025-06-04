import { Module } from "elysia-nest";
import { SubModule1Controller } from "./submodule1.controller";
import { GrandSubModuleModule } from "./grand-sub-module/grandsubmodule.module";

@Module({
  prefix: '/sub-module-1',
  controllers: [SubModule1Controller],
  children: [GrandSubModuleModule],
})
export class SubModule1Module {} 