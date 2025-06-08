import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { CustomInstallmentPlan } from "./CustomInstallmentPlan.entity";
@Entity()
export class InstallmentPayment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CustomInstallmentPlan, plan => plan.payments)
  installmentPlan!: CustomInstallmentPlan;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'date' })
  paymentDate!: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'late', 'missed'],
    default: 'pending'
  })
  status!: string;

  @Column({
    type: 'enum',
    enum: ['credit_card', 'bank_transfer', 'cash', 'other'],
    default: 'bank_transfer'
  })
  paymentMethod!: string;

  @Column({ default: false })
  isOnTime!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}