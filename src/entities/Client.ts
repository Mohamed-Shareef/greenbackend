import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("clients")
export class Client {
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
  area!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  creditLimit!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
