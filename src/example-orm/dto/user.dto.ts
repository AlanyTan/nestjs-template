import { OmitType } from "@nestjs/swagger";
import { Name } from "../entities/user.entity";

export class UserDto {
  uuid: string;
  name: Name;
  notes: string;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
}

export class CreateUserDto extends OmitType(UserDto, [
  "uuid",
  "created_at",
  "updated_at",
]) {}
