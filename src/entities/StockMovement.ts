import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("stock_movement")
export class StockMovement {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  productName!: string;

  @Column("varchar")
  type!: string; // in | out | adjust

  @Column("decimal", { precision: 10, scale: 2 })
  qty!: number;

  @Column("varchar", { nullable: true })
  refType!: string;

  @Column("varchar", { nullable: true })
  refNumber!: string;

  @Column("text", { nullable: true })
  note!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
