import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { SaleReturn } from "./SaleReturn";

@Entity("sale_return_items")
export class SaleReturnItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  productName!: string;

  @Column("integer")
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @ManyToOne(() => SaleReturn, (sr) => sr.items, { onDelete: "CASCADE" })
  saleReturn!: SaleReturn;

  @CreateDateColumn()
  createdAt!: Date;
}
