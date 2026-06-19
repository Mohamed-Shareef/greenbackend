import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Estimate } from "./Estimate";

@Entity("estimate_items")
export class EstimateItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Estimate, (e) => e.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "estimateId" })
  estimate!: Estimate;

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
