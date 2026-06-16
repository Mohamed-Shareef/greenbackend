import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { PurchaseReturnItem } from "./PurchaseReturnItem";

@Entity("purchase_returns")
export class PurchaseReturn {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  returnNo!: string;

  @Column("varchar")
  supplierName!: string;

  @Column("date")
  date!: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;

  @Column("varchar")
  reason!: string;

  @OneToMany(() => PurchaseReturnItem, (item) => item.purchaseReturn, {
    cascade: true,
  })
  items!: PurchaseReturnItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
