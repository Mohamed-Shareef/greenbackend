import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Purchase } from "./Purchase";

@Entity("purchase_items")
export class PurchaseItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  productName!: string;

  @Column("integer")
  quantity!: number;

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

  @ManyToOne(() => Purchase, (purchase) => purchase.items, {
    onDelete: "CASCADE",
  })
  purchase!: Purchase;

  @CreateDateColumn()
  createdAt!: Date;
}
