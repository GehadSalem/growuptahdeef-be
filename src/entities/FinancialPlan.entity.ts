import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { User } from "../entities/User.entity";
import { Expense } from "../entities/Expense.entity";

@Entity()
export class FinancialPlan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("float")
  monthlyIncome: number;

  @Column("float", { default: 0 })
  emergencySavings: number;

  @Column("float", { default: 0 })
  totalExpenses: number;

  @Column("float", { default: 0 })
  remainingBalance: number;

  @ManyToOne(() => User, (user) => user.financialPlans, { onDelete: "CASCADE" })
  user: User;

  @OneToMany(() => Expense, (expense) => expense.plan)
  expenses: Expense[];

  @CreateDateColumn()
  createdAt: Date;
}
