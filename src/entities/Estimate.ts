import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { EstimateItem } from "./EstimateItem";

@Entity("estimates")
export class Estimate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  estimateNo!: string;

  @Column("varchar")
  clientName!: string;

  @Column("date")
  date!: Date;

  @Column("date", { nullable: true })
  validTill!: Date;

  @OneToMany(() => EstimateItem, (item) => item.estimate, { cascade: true })
  items!: EstimateItem[];

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  subtotal!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  gstAmount!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column("varchar", { nullable: true })
  soId!: string;

  @Column("varchar", { default: "draft" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
