import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { SaleReturnItem } from "./SaleReturnItem";

@Entity("sale_returns")
export class SaleReturn {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  returnNo!: string;

  @Column("varchar")
  customerName!: string;

  @Column("date")
  date!: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;

  @Column("varchar")
  reason!: string;

  @OneToMany(() => SaleReturnItem, (item) => item.saleReturn, {
    cascade: true,
  })
  items!: SaleReturnItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
