import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { NameEntitySchema } from "../example-orm/entities/user.entity";
import { convertSchemaColumnOptionsToTableColumnOptions } from "../utils";

export class initial1679874297564 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableOptions =
      convertSchemaColumnOptionsToTableColumnOptions(NameEntitySchema);
    const newTable = new Table(tableOptions);

    // console.log("NameEntitySchema.options: " + JSON.stringify(NameEntitySchema.options))
    await queryRunner.createTable(newTable, true);
  }

  public async down(/* queryRunner: QueryRunner */): Promise<void> {
    throw Error("down is not supported. It must not be implemented.");
  }
}
