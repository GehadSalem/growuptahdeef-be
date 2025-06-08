// src/entities/Habit.entity.ts
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
  name!: string; // Changed from 'name' to 'title' to match frontend

  @Column({ type: 'simple-json', nullable: true })
  frequency!: {
    type: 'daily' | 'weekly' | 'monthly';
    time?: string; // e.g. "08:00"
    days?: number[]; // [0, 2, 4] for weekly (0=Sunday)
    dayOfMonth?: number; // 1-31 for monthly
  } | null;

  @Column({ default: false })
  completed!: boolean;

  @Column({ type: 'time', nullable: true })
  reminderTime!: string | null;

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