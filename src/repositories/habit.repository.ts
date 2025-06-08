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
        // Ensure frequency has proper structure
        const completeHabitData = {
            ...habitData,
            frequency: this.normalizeFrequency(habitData.frequency)
        };
        const habit = this.repository.create(completeHabitData);
        return this.repository.save(habit);
    }

    async save(habit: Habit): Promise<Habit> {
        // Normalize frequency before saving
        habit.frequency = this.normalizeFrequency(habit.frequency);
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
        // Normalize frequency if present in update
        if (updateData.frequency) {
            updateData.frequency = this.normalizeFrequency(updateData.frequency);
        }
        
        await this.repository.update(id, updateData);
        const updated = await this.findById(id);
        if (!updated) throw new Error('Habit not found after update');
        return updated;
    }

    async updateByCriteria(
        criteria: FindOptionsWhere<Habit>,
        updateData: Partial<Habit>
    ): Promise<UpdateResult> {
        // Normalize frequency if present in update
        if (updateData.frequency) {
            updateData.frequency = this.normalizeFrequency(updateData.frequency);
        }
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
                user: { id: userId },
                frequency: { type: 'daily' } as any // Type workaround for JSONB query
            },
            { completed: false }
        );
    }

    // Delete operation
    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    // Helper method to ensure frequency has proper structure
    private normalizeFrequency(frequency: any): Habit['frequency'] {
        if (!frequency) {
            return {
                type: 'daily',
                time: '09:00'
            };
        }

        // If coming from old DB structure (string)
        if (typeof frequency === 'string') {
            return {
                type: frequency as 'daily' | 'weekly' | 'monthly',
                time: '09:00'
            };
        }

        // Ensure complete structure
        return {
            type: frequency.type || 'daily',
            time: frequency.time || '09:00',
            ...(frequency.type === 'weekly' && { 
                days: frequency.days || [0] // Default to Sunday
            }),
            ...(frequency.type === 'monthly' && {
                dayOfMonth: frequency.dayOfMonth || 1 // Default to 1st of month
            })
        };
    }
}