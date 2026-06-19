import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("bank_transaction")
export class BankTransaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  bankAccountId!: string;

  @Column("varchar")
  type!: string; // credit | debit

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column("varchar", { nullable: true })
  description!: string;

  @Column("varchar", { nullable: true })
  chequeNumber!: string;

  @Column("boolean", { default: false })
  isReconciled!: boolean;

  @Column("date")
  txnDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
