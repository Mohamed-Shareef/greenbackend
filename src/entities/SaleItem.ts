import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Sale } from "./Sale";

@Entity("sale_items")
export class SaleItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  productName!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column("varchar", { nullable: true })
  hsn!: string;

  @Column("integer")
  quantity!: number;

  @Column("varchar", { default: "Pcs" })
  unit!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice!: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  discount!: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  gstRate!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  gstAmount!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: "CASCADE" })
  sale!: Sale;

  @CreateDateColumn()
  createdAt!: Date;
}
