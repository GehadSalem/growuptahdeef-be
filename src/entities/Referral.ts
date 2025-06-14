
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User.entity";

@Entity()
export class Referral {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  referredEmail: string;

  @ManyToOne(() => User, (user) => user.referrals, { onDelete: "CASCADE" })
  referrer: User;

  @CreateDateColumn()
  createdAt: Date;
}
