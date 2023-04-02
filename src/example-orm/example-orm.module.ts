/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module, Logger } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Person, User, UserEntitySchema } from "./entities/user.entity";
import { ExampleOrmController } from "./example-orm.controller";
import { ExampleOrmService } from "./example-orm.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntitySchema, Person])],
  providers: [Logger, ExampleOrmService],
  controllers: [ExampleOrmController],
})
export class ExampleOrmModule {}
