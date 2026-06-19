import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("payments_made")
export class PaymentMade {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  paymentNo!: string;

  @Column("varchar")
  supplierName!: string;

  @Column("date")
  date!: Date;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column("varchar", { default: "cash" })
  paymentMethod!: string;

  @Column("varchar", { nullable: true })
  reference!: string;

  @Column("text", { nullable: true })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
