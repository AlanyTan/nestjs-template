/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  EntitySchemaRelationOptions,
  EntitySchemaColumnOptions,
  EntitySchema,
} from "typeorm";
import { BaseColumnSchemaPart, BaseEntity } from "./entity.base";
// This is an example of simple entity.
// it is *not* recommended to use this approach due to the lack of control of how database columns are created
// please use the approach later in this file
@Entity("person")
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;
}

// This is an example of how to use the base columns to define an entity
// the uuid, created_at and updated_at columns are added to the entity by
// the extends of the interface spread operator in the Schema definition
/***
 * The interface for the Name entity which was extended from the BaseEntity
 * This means that the Name entity will have the uuid, created_at and updated_at columns
 * even though they are not explicitly defined in the interface
 */
export interface Name extends BaseEntity {
  first: string;
  last: string;
}
/***
 * The schema for the Name entity which was created using spreading the BaseColumnSchemaPart
 * This means that the Name entity will have the uuid, created_at and updated_at columns
 * even though they are not explicitly defined in the schema
 * Because Name interface is extended from the BaseEntity, so the Name entity is in sync with the NameEntitySchema
 * You can use the NameEntitySchema as a type in your code
 */
export const NameEntitySchema = new EntitySchema<Name>({
  name: "name",
  columns: {
    ...BaseColumnSchemaPart,
    first: {
      type: "varchar",
      length: 64,
    },
    last: {
      type: "varchar",
      length: 64,
    },
  },
});

/***
 * The interface for the User entity which was extended from the BaseEntity and Name
 * This means that the Name entity will have the uuid, created_at and updated_at columns along with the first and last columns
 * even though they are not explicitly defined in the interface.
 * the name property is mapped to the columns with "name_" prefix in the UserEntitySchema
 */
export interface User extends BaseEntity, Name {
  name: Name;
  isActive: boolean;
  notes: string;
}
/**
 * The schema for the User entity which was created using spreading the BaseColumnSchemaPart
 * and embeddeds the NameEntitySchema.
 * This means that the User entity will have the uuid, created_at and updated_at columns
 * along with the first and last columns. But also name_uuid, name_created_at and name_updated_at columns which are part of the Name definition
 * Please NOTE that the name_uuid, name_created_at and name_updated_at columns are part of user table,
 * but in the User interface, they are shown as name.uuid, name.createdAt and name.updatedAt
 * // This means for example, a User can have multiple Name (i.e. an English name and a Chinese name)
 * // while it is going to be the same user, the Names are two different entities
 */
export const UserEntitySchema = new EntitySchema<User>({
  name: "user1",
  columns: {
    ...BaseColumnSchemaPart,
    isActive: {
      type: "boolean",
    },
    notes: {
      type: "varchar",
      length: 256,
    },
  },
  embeddeds: {
    name: {
      schema: NameEntitySchema,
      prefix: "name_",
    },
  },
});
