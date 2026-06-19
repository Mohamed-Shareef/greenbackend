import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { PurchaseItem } from "./PurchaseItem";

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  billNo!: string;

  @Column("varchar")
  supplierName!: string;

  @Column("date")
  date!: Date;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  subtotal!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  gstAmount!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  amountPaid!: number;

  @Column("varchar", { default: "open" })
  status!: string;

  @Column("date", { nullable: true })
  dueDate!: Date;

  @Column("varchar", { nullable: true })
  poId!: string;

  @Column("varchar", { nullable: true })
  placeOfSupply!: string;

  @Column("varchar", { default: "intrastate" })
  gstType!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  cgst!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  sgst!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  igst!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  discount!: number;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true })
  items!: PurchaseItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
