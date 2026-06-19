import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { SalesOrderItem } from "./SalesOrderItem";

@Entity("sales_orders")
export class SalesOrder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  soNumber!: string;

  @Column("varchar")
  clientName!: string;

  @Column("date")
  date!: Date;

  @Column("date", { nullable: true })
  deliveryDate!: Date;

  @OneToMany(() => SalesOrderItem, (item) => item.salesOrder, { cascade: true })
  items!: SalesOrderItem[];

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  subtotal!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  gstAmount!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column("varchar", { default: "pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
