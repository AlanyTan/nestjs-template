import { MigrationInterface, QueryRunner } from "typeorm";

export class changeTableNameUser1680395900991 implements MigrationInterface {
  name = "changeTableNameUser1680395900991";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user1" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isActive" boolean NOT NULL, "notes" character varying(256) NOT NULL, "name_Uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name_Created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name_Updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name_First" character varying(64) NOT NULL, "name_Last" character varying(64) NOT NULL, CONSTRAINT "PK_bb98cc9b40f70cbdf8b76665760" PRIMARY KEY ("uuid", "name_Uuid"))`
    );
    await queryRunner.query(
      `ALTER TABLE "name" ADD CONSTRAINT "PK_c49f64b685ea46b08143674c6d5" PRIMARY KEY ("uuid")`
    );
    await queryRunner.query(
      `ALTER TABLE "name" ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4()`
    );
    await queryRunner.query(
      `ALTER TABLE "name" ALTER COLUMN "created_at" SET DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "name" ALTER COLUMN "updated_at" SET DEFAULT now()`
    );
  }

  public async down(/* queryRunner: QueryRunner */): Promise<void> {
    throw Error("down is not supported. It must not be implemented.");
  }
}
