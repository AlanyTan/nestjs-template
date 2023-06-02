import { MigrationInterface, QueryRunner } from "typeorm";

export class creation1679883851035 implements MigrationInterface {
  name = "creation1679883851035";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "person" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "age" integer NOT NULL, CONSTRAINT "PK_5fdaf670315c4b7e70cce85daa3" PRIMARY KEY ("id"))`
    );
    //await queryRunner.query(`CREATE TABLE "name" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "first" character varying NOT NULL, "last" character varying NOT NULL, CONSTRAINT "PK_c49f64b685ea46b08143674c6d5" PRIMARY KEY ("uuid"))`);
    await queryRunner.query(
      `CREATE TABLE "user" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isActive" boolean NOT NULL, "notes" character varying(256) NOT NULL, "name_Uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name_Created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name_Updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name_First" character varying NOT NULL, "name_Last" character varying NOT NULL, CONSTRAINT "PK_fe2edb307408dc14f36380831c4" PRIMARY KEY ("uuid", "name_Uuid"))`
    );
  }

  public async down(/* queryRunner: QueryRunner */): Promise<void> {
    // down implementation is optional
  }
}
