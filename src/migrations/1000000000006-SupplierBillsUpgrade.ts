import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierBillsUpgrade1000000000006 implements MigrationInterface {
  name = "SupplierBillsUpgrade1000000000006";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Suppliers
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "city" varchar`);
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "creditLimit" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true`);

    // Purchases (Bills) - new GST and PO fields
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "poId" varchar`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "placeOfSupply" varchar`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "gstType" varchar DEFAULT 'intrastate'`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "cgst" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "sgst" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "igst" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "discount" decimal(12,2) DEFAULT 0`);

    // Purchase Items - discount per line
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "discount" decimal(5,2) DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN IF EXISTS "discount"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "discount"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "igst"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "sgst"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "cgst"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "gstType"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "placeOfSupply"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "poId"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "isActive"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "creditLimit"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "city"`);
  }
}
