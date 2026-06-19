import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { SaleItem } from "./SaleItem";

@Entity("sales")
export class Sale {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  invoiceNo!: string;

  @Column("varchar")
  customerName!: string;

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

  @Column("varchar", { default: "unpaid" })
  status!: string;

  @Column("date", { nullable: true })
  dueDate!: Date;

  @Column("varchar", { nullable: true })
  gstType!: string;

  @Column("varchar", { nullable: true })
  placeOfSupply!: string;

  @Column("text", { nullable: true })
  notes!: string;

  @Column("text", { nullable: true })
  terms!: string;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  discount!: number;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items!: SaleItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
