import { MigrationInterface, QueryRunner } from "typeorm";

export class addDeletedAt1680582091865 implements MigrationInterface {
  name = "addDeletedAt1680582091865";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user1" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(
      `ALTER TABLE "user1" ADD "name_Deleted_at" TIMESTAMP WITH TIME ZONE`
    );
    await queryRunner.query(`ALTER TABLE "user1" DROP COLUMN "notes"`);
    await queryRunner.query(`ALTER TABLE "user1" ADD "notes" text`);
  }

  public async down(/* queryRunner: QueryRunner */): Promise<void> {
    // down implementation is optional
  }
}
