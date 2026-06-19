import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SalesOrder } from "./SalesOrder";

@Entity("sales_order_items")
export class SalesOrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => SalesOrder, (so) => so.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "salesOrderId" })
  salesOrder!: SalesOrder;

  @Column("varchar")
  productName!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  quantity!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  unitPrice!: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  gstRate!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;
}
