import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { CustomInstallmentPlan } from "./CustomInstallmentPlan.entity";
@Entity()
export class InstallmentPayment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CustomInstallmentPlan, plan => plan.payments)
  installmentPlan!: CustomInstallmentPlan;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  amount!: number;

  @Column({ type: 'date', nullable: true })
  paymentDate!: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'late', 'missed'],
    default: 'pending',
    nullable: true
  })
  status!: string;

  @Column({
    type: 'enum',
    enum: ['credit_card', 'bank_transfer', 'cash', 'other'],
    default: 'bank_transfer',
    nullable: true
  })
  paymentMethod!: string;

  @Column({ default: false,nullable: true })
  isOnTime!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}