import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAgencyERPTables1000000000003 implements MigrationInterface {
  name = "AddAgencyERPTables1000000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "suppliers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying,
        "phone" character varying,
        "address" text,
        "gstin" character varying,
        "balance" numeric(12,2) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_suppliers" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying,
        "phone" character varying,
        "address" text,
        "gstin" character varying,
        "balance" numeric(12,2) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clients" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "category" character varying,
        "hsn" character varying,
        "unit" character varying DEFAULT 'Nos',
        "gstRate" numeric(5,2) NOT NULL DEFAULT '0',
        "purchasePrice" numeric(12,2) NOT NULL DEFAULT '0',
        "salePrice" numeric(12,2) NOT NULL DEFAULT '0',
        "currentStock" numeric(12,2) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "estimates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "estimateNo" character varying NOT NULL,
        "clientName" character varying NOT NULL,
        "date" date NOT NULL,
        "validTill" date,
        "subtotal" numeric(12,2) NOT NULL DEFAULT '0',
        "gstAmount" numeric(12,2) NOT NULL DEFAULT '0',
        "total" numeric(12,2) NOT NULL DEFAULT '0',
        "status" character varying NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_estimates_estimateNo" UNIQUE ("estimateNo"),
        CONSTRAINT "PK_estimates" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "estimate_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "estimateId" uuid,
        "productName" character varying NOT NULL,
        "quantity" numeric(10,2) NOT NULL,
        "unitPrice" numeric(12,2) NOT NULL,
        "gstRate" numeric(5,2) NOT NULL DEFAULT '0',
        "amount" numeric(12,2) NOT NULL,
        CONSTRAINT "PK_estimate_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_estimate_items_estimate" FOREIGN KEY ("estimateId") REFERENCES "estimates"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sales_orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "soNumber" character varying NOT NULL,
        "clientName" character varying NOT NULL,
        "date" date NOT NULL,
        "deliveryDate" date,
        "subtotal" numeric(12,2) NOT NULL DEFAULT '0',
        "gstAmount" numeric(12,2) NOT NULL DEFAULT '0',
        "total" numeric(12,2) NOT NULL DEFAULT '0',
        "status" character varying NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_sales_orders_soNumber" UNIQUE ("soNumber"),
        CONSTRAINT "PK_sales_orders" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sales_order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "salesOrderId" uuid,
        "productName" character varying NOT NULL,
        "quantity" numeric(10,2) NOT NULL,
        "unitPrice" numeric(12,2) NOT NULL,
        "gstRate" numeric(5,2) NOT NULL DEFAULT '0',
        "amount" numeric(12,2) NOT NULL,
        CONSTRAINT "PK_sales_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sales_order_items_sales_order" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "deliveries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "deliveryNo" character varying NOT NULL,
        "clientName" character varying NOT NULL,
        "salesOrderNo" character varying,
        "date" date NOT NULL,
        "shippingAddress" text,
        "status" character varying NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_deliveries_deliveryNo" UNIQUE ("deliveryNo"),
        CONSTRAINT "PK_deliveries" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "delivery_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "deliveryId" uuid,
        "productName" character varying NOT NULL,
        "quantity" numeric(10,2) NOT NULL,
        "unit" character varying DEFAULT 'Nos',
        CONSTRAINT "PK_delivery_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_delivery_items_delivery" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments_made" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "paymentNo" character varying NOT NULL,
        "supplierName" character varying NOT NULL,
        "date" date NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "paymentMethod" character varying NOT NULL DEFAULT 'cash',
        "reference" character varying,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_payments_made_paymentNo" UNIQUE ("paymentNo"),
        CONSTRAINT "PK_payments_made" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cash_book" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "voucherNo" character varying NOT NULL,
        "date" date NOT NULL,
        "description" text NOT NULL,
        "type" character varying NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "category" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cash_book" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bank_accounts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "accountName" character varying NOT NULL,
        "accountNo" character varying NOT NULL,
        "bankName" character varying NOT NULL,
        "ifsc" character varying,
        "branch" character varying,
        "openingBalance" numeric(12,2) NOT NULL DEFAULT '0',
        "currentBalance" numeric(12,2) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bank_accounts" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "bank_accounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cash_book"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments_made"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "delivery_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deliveries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sales_order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sales_orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "estimate_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "estimates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "suppliers"`);
  }
}
