import { Between, Repository } from 'typeorm';
import { AppDataSource } from '../../src/dbConfig/data-source';
import { Expense } from '../entities/Expense.entity';

export class ExpenseRepository {
    private repository: Repository<Expense>;

    constructor() {
        this.repository = AppDataSource.getRepository(Expense);
    }

    async create(expenseData: Partial<Expense>): Promise<Expense> {
        const expense = this.repository.create(expenseData);
        return this.repository.save(expense);
    }

    async findByUserId(userId: string): Promise<Expense[]> {
        return this.repository.find({ 
            where: { user: { id: userId } },
            relations: ['user'],
            order: { date: 'DESC' }
        });
    }

    async findByUserAndMonth(userId: string, month: number, year: number): Promise<Expense[]> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return this.repository.find({
            where: {
                user: { id: userId },
                date: Between(startDate, endDate)
            },
            relations: ['user']
        });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}