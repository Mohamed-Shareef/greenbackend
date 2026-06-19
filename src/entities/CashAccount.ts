import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("cash_account")
export class CashAccount {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  name!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  balance!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  totalIn!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  totalOut!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
