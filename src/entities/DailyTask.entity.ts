import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User.entity';

export enum HabitType {
  READING = 'READING',
  EXERCISE = 'EXERCISE',
  MEDITATION = 'MEDITATION',
  FINANCIAL = 'FINANCIAL',
  OTHER = 'OTHER'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

@Entity()
export class DailyTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => User, user => user.dailyTasks)
  user!: User;

  @Column({
    type: 'enum',
    enum: HabitType,
    default: HabitType.OTHER
  })
  habitType!: HabitType;

  @Column({ default: false })
  isRecurring!: boolean;

  @Column('json', { nullable: true })
  frequency?: {
    interval: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; 
    dayOfMonth?: number;  
  };

  @Column({ type: 'time' })
  reminderTime!: string; 

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status!: TaskStatus;

  @Column({ default: false }) 
  isCompleted!: boolean;

  @Column({ default: 0 })
  streak!: number;

  @Column({ type: 'date' })
  dueDate!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentAmount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetAmount?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
