/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module, Logger } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { ExampleOrmController } from "./example_orm.controller";
import { ExampleOrmService } from "./example_orm.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [Logger, ExampleOrmService],
  controllers: [ExampleOrmController],
})
export class ExampleOrmModule {}
