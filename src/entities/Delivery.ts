import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { DeliveryItem } from "./DeliveryItem";

@Entity("deliveries")
export class Delivery {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  deliveryNo!: string;

  @Column("varchar")
  clientName!: string;

  @Column("varchar", { nullable: true })
  salesOrderNo!: string;

  @Column("date")
  date!: Date;

  @Column("text", { nullable: true })
  shippingAddress!: string;

  @OneToMany(() => DeliveryItem, (item) => item.delivery, { cascade: true })
  items!: DeliveryItem[];

  @Column("varchar", { nullable: true })
  driverName!: string;

  @Column("varchar", { nullable: true })
  vehicleNo!: string;

  @Column("varchar", { default: "pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
