import { Module } from "elysia-nest";
import { GrandSubModuleController } from "./grandsubmodule.controller";

@Module({
  prefix: '/grand-sub-module',
  controllers: [GrandSubModuleController],
})
export class GrandSubModuleModule {} 