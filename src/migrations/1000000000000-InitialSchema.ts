import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1000000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Sales table
    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "invoiceNo" varchar UNIQUE NOT NULL,
        "customerName" varchar NOT NULL,
        "date" date NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sale items table
    await queryRunner.query(`
      CREATE TABLE "sale_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "productName" varchar NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(10,2) NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "saleId" uuid NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE
      )
    `);

    // Purchase orders table
    await queryRunner.query(`
      CREATE TABLE "purchase_orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "poNumber" varchar UNIQUE NOT NULL,
        "supplierName" varchar NOT NULL,
        "date" date NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "productName" varchar NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(10,2) NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "purchaseOrderId" uuid NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE
      )
    `);

    // Purchases table
    await queryRunner.query(`
      CREATE TABLE "purchases" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "billNo" varchar UNIQUE NOT NULL,
        "supplierName" varchar NOT NULL,
        "date" date NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Purchase items table
    await queryRunner.query(`
      CREATE TABLE "purchase_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "productName" varchar NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(10,2) NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "purchaseId" uuid NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE
      )
    `);

    // Purchase returns table
    await queryRunner.query(`
      CREATE TABLE "purchase_returns" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "returnNo" varchar UNIQUE NOT NULL,
        "supplierName" varchar NOT NULL,
        "date" date NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "reason" varchar NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Purchase return items table
    await queryRunner.query(`
      CREATE TABLE "purchase_return_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "productName" varchar NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(10,2) NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "purchaseReturnId" uuid NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("purchaseReturnId") REFERENCES "purchase_returns"("id") ON DELETE CASCADE
      )
    `);

    // Sale returns table
    await queryRunner.query(`
      CREATE TABLE "sale_returns" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "returnNo" varchar UNIQUE NOT NULL,
        "customerName" varchar NOT NULL,
        "date" date NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "reason" varchar NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sale return items table
    await queryRunner.query(`
      CREATE TABLE "sale_return_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "productName" varchar NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(10,2) NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "saleReturnId" uuid NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("saleReturnId") REFERENCES "sale_returns"("id") ON DELETE CASCADE
      )
    `);

    // Stock table
    await queryRunner.query(`
      CREATE TABLE "stock" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "itemName" varchar NOT NULL,
        "category" varchar NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(10,2) NOT NULL,
        "totalValue" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`CREATE INDEX "idx_sales_invoiceNo" ON "sales"("invoiceNo")`);
    await queryRunner.query(`CREATE INDEX "idx_sales_date" ON "sales"("date")`);
    await queryRunner.query(`CREATE INDEX "idx_purchase_orders_poNumber" ON "purchase_orders"("poNumber")`);
    await queryRunner.query(`CREATE INDEX "idx_purchases_billNo" ON "purchases"("billNo")`);
    await queryRunner.query(`CREATE INDEX "idx_stock_category" ON "stock"("category")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_stock_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_purchases_billNo"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_purchase_orders_poNumber"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sales_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sales_invoiceNo"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "stock"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sale_return_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sale_returns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_return_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_returns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchases"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sale_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sales"`);
  }
}
