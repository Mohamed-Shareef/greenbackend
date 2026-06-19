import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("bank_accounts")
export class BankAccount {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  accountName!: string;

  @Column("varchar")
  accountNo!: string;

  @Column("varchar")
  bankName!: string;

  @Column("varchar", { nullable: true })
  ifsc!: string;

  @Column("varchar", { nullable: true })
  branch!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  openingBalance!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  currentBalance!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
