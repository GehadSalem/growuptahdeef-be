import { Expense } from '../entities/Expense.entity';
import { ExpenseRepository } from '../repositories/expense.repository';
import { UserRepository } from '../repositories/user.repository';

export class ExpenseService {
    private expenseRepository = new ExpenseRepository();
    private userRepository = new UserRepository();

    async createExpense(userId: string, expenseData: Partial<Expense>) {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new Error('User not found');

        const expense = await this.expenseRepository.create({
            ...expenseData,
            date: new Date(),
            user
        });

        return expense;
    }

    async getUserExpenses(userId: string) {
        return await this.expenseRepository.findByUserId(userId);
    }

    async generateMonthlyReport(userId: string, month: number, year: number) {
        const expenses = await this.expenseRepository.findByUserAndMonth(userId, month, year);

        const total = expenses.reduce((sum, exp) => {
            const amount = exp.amount ?? 0;
            return sum + amount;
        }, 0);

        const byCategory = expenses.reduce((acc: Record<string, number>, exp) => {
            const category = exp.category ?? 'Uncategorized';
            const amount = exp.amount ?? 0;
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {});

        return { total, byCategory, expenses };
    }
}
