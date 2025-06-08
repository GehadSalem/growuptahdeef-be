import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User.entity";
import { MajorGoal } from "./MajorGoal.entity";
import { InstallmentPayment } from "./Installment.entity";

@Entity()
export class CustomInstallmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.installmentPlans)
  user!: User;

  @Column()
  productName!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  totalCost!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  downPayment!: number;

  @Column('int')
  monthsCount!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  monthlyInstallment!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  interestRate!: number;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate!: Date | null;

  @Column({
    type: 'enum',
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  })
  status!: string;

   @ManyToOne(() => MajorGoal, goal => goal.linkedInstallments, { 
  nullable: true,
  eager: true // Optional: automatically loads the relation
})
linkedGoal?: MajorGoal;

  @OneToMany(() => InstallmentPayment, payment => payment.installmentPlan)
  payments!: InstallmentPayment[];

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
    static findOne: any;
}