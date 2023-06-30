import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { convertSchemaColumnOptionsToTableColumnOptions } from "../example-orm/entities/entity.base";
import { NameEntitySchema } from "../example-orm/entities/user.entity";

export class initial1679874297564 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableOptions =
      convertSchemaColumnOptionsToTableColumnOptions(NameEntitySchema);
    const newTable = new Table(tableOptions);

    await queryRunner.createTable(newTable, true);
  }

  public async down(/* queryRunner: QueryRunner */): Promise<void> {
    throw Error("down is not supported. It must not be implemented.");
  }
}
