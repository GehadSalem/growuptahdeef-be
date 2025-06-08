// src/entities/Habit.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity()
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  // Change this to match frontend structure
  @Column({ type: 'jsonb' })
  frequency!: {
    type: 'daily' | 'weekly' | 'monthly';
    time?: string;
    days?: number[];
    dayOfMonth?: number;
  };

  @Column({ default: false })
  completed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCompletedAt!: Date | null;

  @Column({ type: 'varchar', length: 50, default: 'other' })
  category!: string;

  @ManyToOne(() => User, (user) => user.habits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}