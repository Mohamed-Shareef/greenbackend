import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersAndTenants1000000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tenants table
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "email" varchar UNIQUE NOT NULL,
        "phone" varchar,
        "address" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "password" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT 'cashier',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
        UNIQUE ("tenantId", "email")
      )
    `);

    // Add tenantId to existing root tables
    const rootTables = [
      "sales",
      "purchase_orders",
      "purchases",
      "purchase_returns",
      "sale_returns",
      "stock",
    ];

    for (const table of rootTables) {
      await queryRunner.query(`
        ALTER TABLE "${table}" ADD COLUMN "tenantId" uuid,
        ADD CONSTRAINT "fk_${table}_tenant"
          FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
      `);
    }

    // Indexes
    await queryRunner.query(`CREATE INDEX "idx_users_tenantId" ON "users"("tenantId")`);
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_sales_tenantId" ON "sales"("tenantId")`);
    await queryRunner.query(`CREATE INDEX "idx_purchases_tenantId" ON "purchases"("tenantId")`);
    await queryRunner.query(`CREATE INDEX "idx_stock_tenantId" ON "stock"("tenantId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_stock_tenantId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_purchases_tenantId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sales_tenantId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_tenantId"`);

    // Remove tenantId from root tables
    const rootTables = [
      "stock",
      "sale_returns",
      "purchase_returns",
      "purchases",
      "purchase_orders",
      "sales",
    ];

    for (const table of rootTables) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
          DROP CONSTRAINT IF EXISTS "fk_${table}_tenant",
          DROP COLUMN IF EXISTS "tenantId"
      `);
    }

    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants"`);
  }
}
