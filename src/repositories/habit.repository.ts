import { FindManyOptions, FindOneOptions, Repository, UpdateResult, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../src/dbConfig/data-source';
import { Habit } from '../entities/Habit.entity';

export class HabitRepository {
    resetDailyHabits(userId: string) {
        throw new Error('Method not implemented.');
    }
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

    // Update operations
    async update(id: string, updateData: Partial<Habit>): Promise<Habit> {
        await this.repository.update(id, updateData);
        const updated = await this.findById(id);
        if (!updated) throw new Error('Habit not found after update');
        return updated;
    }

    async updateByCriteria(
        criteria: FindOptionsWhere<Habit>,
        updateData: Partial<Habit>
    ): Promise<UpdateResult> {
        return this.repository.update(criteria, updateData);
    }

    // Business logic methods
   async markComplete(id: string, completed: boolean): Promise<Habit> {
    await this.repository.update(id, { 
        completed,
        lastCompletedAt: completed ? new Date() : null
    });
    const updated = await this.findById(id);
    if (!updated) throw new Error('Habit not found after update');
    return updated;
}

    async resetHabitsByFrequency(
    userId: string, 
    frequencyType: 'daily' | 'weekly' | 'monthly' // تغيير هنا
): Promise<void> {
    await this.repository
        .createQueryBuilder()
        .update(Habit)
        .set({ completed: false })
        .where('user_id = :userId', { userId })
        .andWhere('frequency->>\'type\' = :frequencyType', { frequencyType })
        .execute();
}

    // New method to find habits by frequency type
    async findByFrequencyType(userId: string, frequencyType: string): Promise<Habit[]> {
        return this.repository
            .createQueryBuilder('habit')
            .where('habit.user_id = :userId', { userId })
            .andWhere('habit.frequency->>\'type\' = :frequencyType', { frequencyType })
            .getMany();
    }

    // Delete operation
    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    // New method to update frequency object
    async updateFrequency(id: string, frequency: {
        type: 'daily' | 'weekly' | 'monthly';
        time?: string;
        days?: number[];
        dayOfMonth?: number;
    }): Promise<Habit> {
        return this.update(id, { frequency });
    }
}