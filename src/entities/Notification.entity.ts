import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User.entity";

export enum NotificationType {
  DAILY_HABIT = 'DAILY_HABIT',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  SAVING_GOAL = 'SAVING_GOAL',
  GENERAL = 'GENERAL'
}

export enum NotificationStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  READ = 'READ',
  FAILED = 'FAILED'
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.notifications)
  user!: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL
  })
  type!: NotificationType;

  @Column()
  title!: string;

  @Column()
  message!: string;

  @Column({ type: 'timestamp' })
  scheduledTime!: Date;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.SCHEDULED
  })
  status!: NotificationStatus;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ type: 'varchar', nullable: true })
  relatedEntityId?: string; // For linking to habits, payments, etc.

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}