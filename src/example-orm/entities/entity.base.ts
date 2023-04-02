/* eslint-disable @typescript-eslint/no-unused-vars */
// The following is the recommended approach to create entities
// starting from these base columns, which are uuids, created_at and updated_at
//  Instead of defining Entities, we will define interface and schema for each entity separately,
//  this way, it allows us to have finer grain control of the data type of both the database columns and the entity class
// The BaseColumnSchemaPart do not need to exist in the database as a table, they are just collection of standard columns that should be included in all tables

import {
  AfterInsert,
  AfterLoad,
  AfterRemove,
  AfterUpdate,
  EntitySchemaColumnOptions,
} from "typeorm";

/***
 *  The interface for the BaseColumnSchemaPart.
 *  This interface allows us to extend other interfaces and maintain compability with the base columns
 */
export class BaseEntity {
  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  @AfterRemove()
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
}

/***
 *  The schema for the BaseColumnSchemaPart:
 *  This columns should be added to all entities/tables using the spread operator
 */
export const BaseColumnSchemaPart = {
  uuid: {
    type: "uuid",
    primary: true,
    generated: "uuid",
  } as EntitySchemaColumnOptions,
  createdAt: {
    name: "created_at",
    type: "timestamp with time zone",
    createDate: true,
  } as EntitySchemaColumnOptions,
  updatedAt: {
    name: "updated_at",
    type: "timestamp with time zone",
    updateDate: true,
  } as EntitySchemaColumnOptions,
};
