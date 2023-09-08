import { Module, Logger } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Person, UserEntitySchema } from "./entities/user.entity";
import { ExampleOrmController } from "./example-orm.controller";
import { ExampleOrmService } from "./example-orm.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntitySchema, Person])],
  providers: [Logger, ExampleOrmService],
  controllers: [ExampleOrmController],
})
export class ExampleOrmModule {}
