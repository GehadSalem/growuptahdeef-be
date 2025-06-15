// src/entities/BadHabit.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity({ name: 'bad_habits' })
export class BadHabit {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', default: 3 })
  severity!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.badHabits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => HabitOccurrence, (occurrence) => occurrence.habit)
  occurrences!: HabitOccurrence[];
}

@Entity({ name: 'habit_occurrences' })
export class HabitOccurrence {
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => User, (user) => user.habitOccurrences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => BadHabit, (habit) => habit.occurrences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'habit_id' })
  habit!: BadHabit;

  @Column({ name: 'occurrence_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  occurrenceDate!: Date;
}
