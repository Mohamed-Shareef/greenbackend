import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("cash_book")
export class CashBook {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  voucherNo!: string;

  @Column("date")
  date!: Date;

  @Column("text")
  description!: string;

  @Column("varchar")
  type!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column("varchar", { nullable: true })
  category!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
