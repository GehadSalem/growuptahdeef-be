import { FindManyOptions, FindOneOptions, Repository, UpdateResult, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../src/dbConfig/data-source';
import { Habit } from '../entities/Habit.entity';

export class HabitRepository {
    private repository: Repository<Habit>;

    constructor() {
        this.repository = AppDataSource.getRepository(Habit);
    }

    // Basic CRUD operations
    async create(habitData: Partial<Habit>): Promise<Habit> {
        const habit = this.repository.create(habitData);
        return this.repository.save(habit);
    }

    async save(habit: Habit): Promise<Habit> {
        return this.repository.save(habit);
    }

    async find(options?: FindManyOptions<Habit>): Promise<Habit[]> {
        return this.repository.find(options);
    }

    async findOne(options: FindOneOptions<Habit>): Promise<Habit | null> {
        return this.repository.findOne(options);
    }

    // Specific find methods
    async findById(id: string): Promise<Habit | null> {
        return this.repository.findOne({ 
            where: { id },
            relations: ['user']
        });
    }

    async findByUserId(userId: string): Promise<Habit[]> {
        return this.repository.find({ 
            where: { user: { id: userId } },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }

    // Update operations - FIXED VERSION
    async update(id: string, updateData: Partial<Habit>): Promise<Habit> {
        await this.repository.update(id, updateData);
        const updated = await this.findById(id);
        if (!updated) throw new Error('Habit not found after update');
        return updated;
    }

    async updateByCriteria(
        criteria: FindOptionsWhere<Habit>, // Changed from FindManyOptions
        updateData: Partial<Habit>
    ): Promise<UpdateResult> {
        return this.repository.update(criteria, updateData);
    }

    // Business logic methods
    async markComplete(id: string): Promise<Habit> {
        return this.update(id, { 
            completed: true,
            lastCompletedAt: new Date()
        });
    }

    async resetDailyHabits(userId: string): Promise<void> {
        await this.updateByCriteria(
            { 
                user: { id: userId }, // Simplified where clause
                frequency: 'daily' 
            },
            { completed: false }
        );
    }

    // Delete operation
    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}