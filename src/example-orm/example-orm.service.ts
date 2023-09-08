// we will not implement multi tenant by schema yet, but the referece is here: https://thomasvds.com/schema-based-multitenancy-with-nest-js-type-orm-and-postgres-sql/
import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserEntitySchema } from "./entities/user.entity";

@Injectable()
export class ExampleOrmService {
  constructor(
    // Here, you will see a slight difference than most online tutorials.
    // the InjectRepository decorator uses the EntitySchema instead of the Entity class.
    // and the Repository definition is using Repository<User> which is the interface for the User entity
    // this is because we prefer to use the more eleborate EntitySchema + Interface approach to define Entity
    // instead of the Entity class approach
    @InjectRepository(UserEntitySchema)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(uuid: string): Promise<User | null> {
    try {
      const foundUser = await this.usersRepository.findOneByOrFail({
        uuid: uuid,
      });
      return foundUser;
    } catch (error) {
      throw new HttpException("User not found", 204);
    }
  }

  async create(user: User): Promise<User> {
    const savedUser = await this.usersRepository.save(user);
    return savedUser;
  }

  async delete(uuid: string): Promise<void> {
    const user = await this.findOne(uuid);
    if (user !== null) {
      await this.usersRepository.delete({
        uuid: uuid,
        name: { uuid: user.uuid },
      });
    } else {
      throw new HttpException("User not found", 204);
    }
  }
}
