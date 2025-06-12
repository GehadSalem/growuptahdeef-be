// src/entities/EmergencyFund.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User.entity';

// تعريف النوع (type) باستخدام enum
export enum EmergencyFundType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

@Entity()
export class EmergencyFund {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'date' })
  date!: Date;

  @Column()
  description!: string;

   @Column({ type: 'enum', enum: ['deposit', 'withdrawal'] })
  type: EmergencyFundType;

  @ManyToOne(() => User, user => user.emergencyFunds)
  user!: User;
}
