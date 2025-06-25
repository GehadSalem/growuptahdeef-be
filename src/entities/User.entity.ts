import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { randomBytes } from 'crypto';

import { Expense } from './Expense.entity';
import { Habit } from './Habit.entity';
import { EmergencyFund } from './EmergencyFund.entity';
import { MajorGoal } from './MajorGoal.entity';
import { DailyTask } from './DailyTask.entity';
import { SavingsGoal } from './SavingsGoal.entity';
import { Notification } from './Notification.entity';
import { CustomInstallmentPlan } from './CustomInstallmentPlan.entity';
import { Referral } from './Referral.entity';
import { FinancialPlan } from './FinancialPlan.entity';
import { BadHabit, HabitOccurrence } from './BadHabit.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  notificationToken?: string;

  @Column({ type: 'float', default: 0 })
  monthlyIncome!: number;

  @Column({ nullable: true })
  firebaseUid?: string;

  @Column({ default: 'email' })
  authProvider!: 'email' | 'google';

  @Column({ nullable: false })
  referralCode!: string;

  @Column({ nullable: true })
  referredBy?: string;

  @Column({ default: false })
  subscribed!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  monthlyCommitment: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses!: Expense[];

  @OneToMany(() => Habit, (habit) => habit.user)
  habits!: Habit[];

  @OneToMany(() => MajorGoal, (majorGoal) => majorGoal.user)
  majorGoals!: MajorGoal[];

  @OneToMany(() => SavingsGoal, (savingsGoal) => savingsGoal.user)
  savingsGoals!: SavingsGoal[];

  @OneToMany(() => EmergencyFund, fund => fund.user)
emergencyFunds!: EmergencyFund[];

  @OneToMany(() => DailyTask, (task) => task.user)
  dailyTasks!: DailyTask[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => CustomInstallmentPlan, (plan) => plan.user)
  installmentPlans!: CustomInstallmentPlan[];

  @OneToMany(() => Referral, (referral) => referral.referrer)
  referrals!: Referral[];

  @OneToMany(() => FinancialPlan, (plan) => plan.user)
  financialPlans!: FinancialPlan[];

  @OneToMany(() => BadHabit, habit => habit.user)
badHabits: BadHabit[];

@OneToMany(() => HabitOccurrence, (occurrence) => occurrence.user)
habitOccurrences!: HabitOccurrence[];

  // @BeforeInsert()
  // generateReferralCode() {
  //   if (!this.referralCode) {
  //     this.referralCode = randomBytes(4).toString('hex');
  //   }
  // }
}
