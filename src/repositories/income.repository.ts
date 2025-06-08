import { FindManyOptions, FindOneOptions, Repository, UpdateResult, FindOptionsWhere, Between } from 'typeorm';
import { AppDataSource } from '../../src/dbConfig/data-source';
import { Income } from '../entities/Income.entity';
import { User } from '../entities/User.entity';

export class IncomeRepository {
    private repository: Repository<Income>;

    constructor() {
        this.repository = AppDataSource.getRepository(Income);
    }

    // Basic CRUD operations
    async create(incomeData: Partial<Income>): Promise<Income> {
        const income = this.repository.create(incomeData);
        return this.repository.save(income);
    }

    async save(income: Income): Promise<Income> {
        return this.repository.save(income);
    }

    async find(options?: FindManyOptions<Income>): Promise<Income[]> {
        return this.repository.find(options);
    }

    async findOne(options: FindOneOptions<Income>): Promise<Income | null> {
        return this.repository.findOne(options);
    }

    // Specific find methods
    async findById(id: string): Promise<Income | null> {
        return this.repository.findOne({ 
            where: { id },
            relations: ['user']
        });
    }

    async findByUserId(userId: string): Promise<Income[]> {
        return this.repository.find({ 
            where: { user: { id: userId } },
            relations: ['user'],
            order: { date: 'DESC' } // Changed from incomeDate to date
        });
    }

    // Create with user
    async createForUser(user: User, incomeData: Omit<Partial<Income>, 'user'>): Promise<Income> {
        const income = this.repository.create({
            ...incomeData,
            user,
            date: incomeData.date || new Date()
        });
        return this.repository.save(income);
    }

    // Update operations
    async update(id: string, updateData: Partial<Income>): Promise<Income> {
        await this.repository.update(id, updateData);
        return this.findById(id) as Promise<Income>;
    }

    async updateByCriteria(
        criteria: FindOptionsWhere<Income>,
        updateData: Partial<Income>
    ): Promise<UpdateResult> {
        return this.repository.update(criteria, updateData);
    }

    // Time-based queries
    async findByMonth(userId: string, year: number, month: number): Promise<Income[]> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        
        return this.repository.find({
            where: {
                user: { id: userId },
                date: Between(startDate, endDate)
            },
            relations: ['user'],
            order: { date: 'DESC' }
        });
    }

    // Delete operation
    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }
}