import { Between } from 'typeorm';
import { AppDataSource } from '../dbConfig/data-source';
import { Income } from '../entities/Income.entity';
import { User } from 'entities/User.entity';

export class IncomeService {
    private incomeRepository = AppDataSource.getRepository(Income);

    async createIncome(user: User, incomeData: Partial<Income>): Promise<Income> {
        if (!incomeData.amount || incomeData.amount <= 0) {
            throw new Error('Amount must be a positive number');
        }

        if (!incomeData.description || incomeData.description.trim() === '') {
            throw new Error('Income description is required');
        }

        const newIncome = this.incomeRepository.create({
            ...incomeData,
            user,
            date: incomeData.date || new Date()
        });
        return await this.incomeRepository.save(newIncome);
    }

    async getUserIncomes(userId: string): Promise<Income[]> {
        return await this.incomeRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { date: 'DESC' }
        });
    }

    async getMonthlyIncomes(userId: string, year: number, month: number): Promise<Income[]> {
        if (month < 1 || month > 12) {
            throw new Error('Month must be between 1 and 12');
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        
        return await this.incomeRepository.createQueryBuilder('income')
            .leftJoinAndSelect('income.user', 'user')
            .where('income.userId = :userId', { userId })
            .andWhere('income.date BETWEEN :startDate AND :endDate', { 
                startDate: startDate.toISOString(), 
                endDate: endDate.toISOString() 
            })
            .orderBy('income.date', 'DESC')
            .getMany();
    }

    async getYearlyIncomes(userId: string, year: number): Promise<Income[]> {
        const currentYear = new Date().getFullYear();
        if (year < 2000 || year > currentYear + 5) {
            throw new Error(`Year must be between 2000 and ${currentYear + 5}`);
        }

        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        
        return await this.incomeRepository.createQueryBuilder('income')
            .leftJoinAndSelect('income.user', 'user')
            .where('income.userId = :userId', { userId })
            .andWhere('income.date BETWEEN :startDate AND :endDate', { 
                startDate: startDate.toISOString(), 
                endDate: endDate.toISOString() 
            })
            .orderBy('income.date', 'DESC')
            .getMany();
    }

    async updateIncome(id: string, updateData: Partial<Income>): Promise<Income> {
        if (updateData.amount && updateData.amount <= 0) {
            throw new Error('Amount must be a positive number');
        }

        const income = await this.incomeRepository.findOneBy({ id });
        if (!income) {
            throw new Error('Income not found');
        }

        Object.assign(income, updateData);
        return await this.incomeRepository.save(income);
    }

    async deleteIncome(id: string): Promise<void> {
        const result = await this.incomeRepository.delete(id);
        if (result.affected === 0) {
            throw new Error('Income not found or could not be deleted');
        }
    }

    async getIncomeById(id: string): Promise<Income> {
        const income = await this.incomeRepository.findOne({ 
            where: { id },
            relations: ['user'] 
        });
        if (!income) {
            throw new Error('Income not found');
        }
        return income;
    }
}