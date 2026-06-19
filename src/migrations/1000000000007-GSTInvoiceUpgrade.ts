import { MigrationInterface, QueryRunner } from "typeorm";

export class GSTInvoiceUpgrade1000000000007 implements MigrationInterface {
  name = "GSTInvoiceUpgrade1000000000007";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Sales (Invoices) - GST and metadata fields
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "gstType" varchar DEFAULT 'intrastate'`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "placeOfSupply" varchar`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "notes" text`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "terms" text`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "discount" decimal(5,2) DEFAULT 0`);

    // Sale Items - HSN, description, unit, and per-item discount
    await queryRunner.query(`ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "description" text`);
    await queryRunner.query(`ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "hsn" varchar`);
    await queryRunner.query(`ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "unit" varchar DEFAULT 'Pcs'`);
    await queryRunner.query(`ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "discount" decimal(5,2) DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "discount"`);
    await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "unit"`);
    await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "hsn"`);
    await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "description"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "discount"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "terms"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "notes"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "placeOfSupply"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "gstType"`);
  }
}
