import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User.entity';
import { FinancialPlan } from './FinancialPlan.entity';

@Entity()
export class Expense {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Column()
    category!: string;

    @Column()
    description!: string;

    @Column({ type: 'date' })
    date!: Date;

    @ManyToOne(() => FinancialPlan, (plan) => plan.expenses, { onDelete: "CASCADE" })
    plan: FinancialPlan;


    @ManyToOne(() => User, user => user.expenses)
    user!: User;
}