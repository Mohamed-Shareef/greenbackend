import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Delivery } from "./Delivery";

@Entity("delivery_items")
export class DeliveryItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Delivery, (d) => d.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "deliveryId" })
  delivery!: Delivery;

  @Column("varchar")
  productName!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  quantity!: number;

  @Column("varchar", { nullable: true, default: "Nos" })
  unit!: string;
}
