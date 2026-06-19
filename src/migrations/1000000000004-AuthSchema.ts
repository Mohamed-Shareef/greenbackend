import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthSchema1000000000004 implements MigrationInterface {
  name = "AuthSchema1000000000004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns to tenants
    await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "tenantCode" character varying`);
    await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "gstin" character varying`);
    await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "city" character varying`);
    await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "state" character varying`);
    await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "plan" character varying NOT NULL DEFAULT 'free'`);

    // Backfill tenantCode for existing rows (use short hash of id)
    await queryRunner.query(`
      UPDATE "tenants"
      SET "tenantCode" = UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 1, 3)) || UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 3))
      WHERE "tenantCode" IS NULL
    `);

    await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "tenantCode" SET NOT NULL`);

    // Add unique index if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE tablename = 'tenants' AND indexname = 'UQ_tenants_tenantCode'
        ) THEN
          CREATE UNIQUE INDEX "UQ_tenants_tenantCode" ON "tenants"("tenantCode");
        END IF;
      END $$
    `);

    // Add lastLogin to users
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_tenants_tenantCode"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "lastLogin"`);
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "tenantCode"`);
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "gstin"`);
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "city"`);
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "state"`);
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "plan"`);
  }
}
