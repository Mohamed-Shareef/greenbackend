import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  name!: string;

  @Column("varchar", { nullable: true })
  category!: string;

  @Column("varchar", { nullable: true })
  brand!: string;

  @Column("varchar", { nullable: true })
  hsn!: string;

  @Column("varchar", { nullable: true, default: "Nos" })
  unit!: string;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  gstRate!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  purchasePrice!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  salePrice!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  currentStock!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
