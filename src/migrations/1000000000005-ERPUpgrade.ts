import { MigrationInterface, QueryRunner } from "typeorm";

export class ERPUpgrade1000000000005 implements MigrationInterface {
  name = "ERPUpgrade1000000000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Clients
    await queryRunner.query(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "area" varchar`);
    await queryRunner.query(`ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "creditLimit" decimal(12,2) DEFAULT 0`);

    // Products
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand" varchar`);

    // Purchase Orders
    await queryRunner.query(`ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'pending'`);

    // Purchases (Bills)
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "subtotal" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "gstAmount" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "amountPaid" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'open'`);
    await queryRunner.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "dueDate" date`);

    // Purchase Items
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "gstRate" decimal(5,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "gstAmount" decimal(12,2) DEFAULT 0`);

    // Sales (GST Invoices)
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "subtotal" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "gstAmount" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "amountPaid" decimal(12,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'unpaid'`);
    await queryRunner.query(`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "dueDate" date`);

    // Sale Items
    await queryRunner.query(`ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "gstRate" decimal(5,2) DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "gstAmount" decimal(12,2) DEFAULT 0`);

    // Deliveries
    await queryRunner.query(`ALTER TABLE "deliveries" ADD COLUMN IF NOT EXISTS "driverName" varchar`);
    await queryRunner.query(`ALTER TABLE "deliveries" ADD COLUMN IF NOT EXISTS "vehicleNo" varchar`);

    // Estimates
    await queryRunner.query(`ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "soId" varchar`);

    // Stock Movement
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stock_movement" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "productName" varchar NOT NULL,
        "type" varchar NOT NULL,
        "qty" decimal(10,2) NOT NULL,
        "refType" varchar,
        "refNumber" varchar,
        "note" text,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL
      )
    `);

    // Bill Payment
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bill_payment" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "purchaseId" varchar NOT NULL,
        "date" date NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "paymentMode" varchar DEFAULT 'cash' NOT NULL,
        "reference" varchar,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL
      )
    `);

    // Invoice Payment
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoice_payment" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "saleId" varchar NOT NULL,
        "date" date NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "paymentMode" varchar DEFAULT 'cash' NOT NULL,
        "reference" varchar,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL
      )
    `);

    // Cash Account
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cash_account" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "name" varchar NOT NULL UNIQUE,
        "balance" decimal(12,2) DEFAULT 0 NOT NULL,
        "totalIn" decimal(12,2) DEFAULT 0 NOT NULL,
        "totalOut" decimal(12,2) DEFAULT 0 NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL
      )
    `);

    // Cash Transaction
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cash_transaction" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "cashAccountId" varchar NOT NULL,
        "type" varchar NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "category" varchar,
        "description" text,
        "refNumber" varchar,
        "txnDate" date NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL
      )
    `);

    // Bank Transaction
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bank_transaction" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "bankAccountId" varchar NOT NULL,
        "type" varchar NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "description" varchar,
        "chequeNumber" varchar,
        "isReconciled" boolean DEFAULT false NOT NULL,
        "txnDate" date NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "bank_transaction"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cash_transaction"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cash_account"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_payment"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bill_payment"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_movement"`);
    await queryRunner.query(`ALTER TABLE "estimates" DROP COLUMN IF EXISTS "soId"`);
    await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "vehicleNo"`);
    await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "driverName"`);
    await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "gstAmount"`);
    await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "gstRate"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "dueDate"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "amountPaid"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "gstAmount"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "subtotal"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN IF EXISTS "gstAmount"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN IF EXISTS "gstRate"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "dueDate"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "amountPaid"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "gstAmount"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN IF EXISTS "subtotal"`);
    await queryRunner.query(`ALTER TABLE "purchase_orders" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "brand"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "creditLimit"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "area"`);
  }
}
