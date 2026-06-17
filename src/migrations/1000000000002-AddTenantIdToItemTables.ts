import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantIdToItemTables1000000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const itemTables = [
      "sale_items",
      "order_items",
      "purchase_items",
      "purchase_return_items",
      "sale_return_items",
    ];

    for (const table of itemTables) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
          ADD COLUMN "tenantId" uuid,
          ADD CONSTRAINT "fk_${table}_tenant"
            FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
      `);

      await queryRunner.query(`
        CREATE INDEX "idx_${table}_tenantId" ON "${table}"("tenantId")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const itemTables = [
      "sale_return_items",
      "purchase_return_items",
      "purchase_items",
      "order_items",
      "sale_items",
    ];

    for (const table of itemTables) {
      await queryRunner.query(`DROP INDEX IF EXISTS "idx_${table}_tenantId"`);
      await queryRunner.query(`
        ALTER TABLE "${table}"
          DROP CONSTRAINT IF EXISTS "fk_${table}_tenant",
          DROP COLUMN IF EXISTS "tenantId"
      `);
    }
  }
}
