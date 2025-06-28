import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User.entity";
import { MajorGoal } from "./MajorGoal.entity";
import { InstallmentPayment } from "./Installment.entity";

@Entity()
export class CustomInstallmentPlan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.installmentPlans, {
    onDelete: "CASCADE",
  })
  user!: User;
  @Column()
  name!: string;

  @Column("decimal", { precision: 12, scale: 2, nullable: true })
  totalAmount!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0, nullable: true })
  downPayment!: number;

  @Column("int", { nullable: true })
  monthlyAmount!: number;
  
  @Column({ type: "varchar", length: 50, nullable: true })
  type?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  recurrence?: string;

  @Column("decimal", { precision: 12, scale: 2, nullable: true })
  monthlyInstallment!: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0, nullable: true })
  interestRate!: number;

  @Column({ type: "date", nullable: true })
  startDate!: Date;

  @Column({ type: "date", nullable: true })
  dueDate!: Date | null;

  @Column({
    type: "enum",
    enum: ["active", "completed", "paused", "cancelled"],
    default: "active",
    nullable: true,
  })
  status!: string;

  @ManyToOne(() => MajorGoal, (goal) => goal.linkedInstallments, {
    nullable: true,
    eager: true, // Optional: automatically loads the relation
  })
  linkedGoal?: MajorGoal;

  @OneToMany(() => InstallmentPayment, (payment) => payment.installmentPlan)
  payments!: InstallmentPayment[];

  @Column({ type: "text", nullable: true })
  notes!: string | null;
}
