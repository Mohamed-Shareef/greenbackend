import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("suppliers")
export class Supplier {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  name!: string;

  @Column("varchar", { nullable: true })
  email!: string;

  @Column("varchar", { nullable: true })
  phone!: string;

  @Column("text", { nullable: true })
  address!: string;

  @Column("varchar", { nullable: true })
  gstin!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  balance!: number;

  @Column("varchar", { nullable: true })
  city!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  creditLimit!: number;

  @Column("boolean", { default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
