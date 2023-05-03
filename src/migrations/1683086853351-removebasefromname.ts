import { MigrationInterface, QueryRunner } from "typeorm";

export class Removebasefromname1683086853351 implements MigrationInterface {
  name = "Removebasefromname1683086853351";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "name" ALTER COLUMN "deleted_at" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "name" ALTER COLUMN "deleted_at" SET NOT NULL`
    );
  }
}
