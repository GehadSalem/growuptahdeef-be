import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.entity";

@Entity()
export class SavingsGoal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.id)
  user!: User;

  @Column()
  goalName!: string;

  @Column('text')
  description!: string;

  @Column()
  targetAmount!: number;

  @Column()
  currentAmount!: number;

  @Column({ type: 'date' })
  targetDate!: Date;

  @Column({ default: 'active' })
  status!: 'active' | 'completed' | 'paused';

  @Column({ default: false })
  isEmergencyFund!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
