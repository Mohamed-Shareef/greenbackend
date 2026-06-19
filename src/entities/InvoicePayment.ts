import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("invoice_payment")
export class InvoicePayment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  saleId!: string;

  @Column("date")
  date!: Date;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column("varchar", { default: "cash" })
  paymentMode!: string;

  @Column("varchar", { nullable: true })
  reference!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
