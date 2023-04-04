import { EntitySchema } from "typeorm";
import { BaseColumnSchemaPart } from "example-orm/entities/entity.base";
import { convertSchemaColumnOptionsToTableColumnOptions } from "./entity.base";

describe("BaseEntity should be defined", () => {
  it("BaseColumnSchemaPart should be defined", () => {
    expect(BaseColumnSchemaPart).toBeDefined();
  });
});

describe("convertSchemaColumnOptionsToTableColumnOptions", () => {
  it("from a Entity defined with BaseColumnSchemaParts", () => {
    const testSchema = new EntitySchema({
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
    const expectedTableOptions =
      '{"name":"name","columns":[{"type":"uuid","primary":true,"generated":"uuid","name":"uuid"},{"name":"created_at","type":"timestamp with time zone","createDate":true},{"name":"updated_at","type":"timestamp with time zone","updateDate":true},{"name":"deleted_at","type":"timestamp with time zone","nullable":true,"deleteDate":true},{"type":"varchar","length":64,"name":"first"},{"type":"varchar","length":64,"name":"last"}]}';
    expect(
      JSON.stringify(convertSchemaColumnOptionsToTableColumnOptions(testSchema))
    ).toEqual(expectedTableOptions);
  });
});
