import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany,
} from "typeorm";
import { User } from "./User";

@Entity("tenants")
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  tenantCode!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar", nullable: true })
  phone!: string;

  @Column({ type: "varchar", nullable: true })
  gstin!: string;

  @Column({ type: "varchar", nullable: true })
  address!: string;

  @Column({ type: "varchar", nullable: true })
  city!: string;

  @Column({ type: "varchar", nullable: true })
  state!: string;

  @Column({ type: "varchar", default: "free" })
  plan!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users!: User[];
}
