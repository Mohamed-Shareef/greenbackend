import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrderItem } from "./OrderItem";

@Entity("purchase_orders")
export class PurchaseOrder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  poNumber!: string;

  @Column("varchar")
  supplierName!: string;

  @Column("date")
  date!: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;

  @Column("varchar", { default: "pending" })
  status!: string;

  @OneToMany(() => OrderItem, (item) => item.purchaseOrder, {
    cascade: true,
  })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
