import { Module } from "elysia-nest";
import { NestedController } from "./nested.controller";
import { SubModule1Module } from "./sub-module-1/submodule1.module";
import { SubModule2Module } from "./sub-module-2/submodule2.module";

@Module({
  prefix: '/nested',
  controllers: [NestedController],
  children: [SubModule1Module, SubModule2Module],
})
export class NestedModule {} 