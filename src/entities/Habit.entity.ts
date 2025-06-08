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
  name!: string;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
  })
  frequency!: string; // Keep as string enum to match your DB

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