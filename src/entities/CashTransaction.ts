import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("cash_transaction")
export class CashTransaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  cashAccountId!: string;

  @Column("varchar")
  type!: string; // in | out

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column("varchar", { nullable: true })
  category!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column("varchar", { nullable: true })
  refNumber!: string;

  @Column("date")
  txnDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
