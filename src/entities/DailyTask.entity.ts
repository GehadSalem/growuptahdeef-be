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

export enum TaskPriority {
  HIGH = 'high',
  LOW = 'low',
  MEDIUM = 'medium'
}

@Entity()
export class DailyTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

 @Column({ default: false }) 
  isCompleted!: boolean;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Column({ type: 'date', nullable: true })
  dueDate!: Date;


  @Column({nullable: true})
  categoty: string

  @ManyToOne(() => User, user => user.dailyTasks)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
