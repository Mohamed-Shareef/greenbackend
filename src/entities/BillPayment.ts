import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("bill_payment")
export class BillPayment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  purchaseId!: string;

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
