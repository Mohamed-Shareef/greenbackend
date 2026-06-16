import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { PurchaseReturn } from "./PurchaseReturn";

@Entity("purchase_return_items")
export class PurchaseReturnItem {
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

  @ManyToOne(() => PurchaseReturn, (pr) => pr.items, { onDelete: "CASCADE" })
  purchaseReturn!: PurchaseReturn;

  @CreateDateColumn()
  createdAt!: Date;
}
