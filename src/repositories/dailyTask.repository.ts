import { Repository } from 'typeorm';
import { AppDataSource } from '../dbConfig/data-source';
import { DailyTask } from '../entities/DailyTask.entity';

export class DailyTaskRepository {
    private repository: Repository<DailyTask>;

    constructor() {
        this.repository = AppDataSource.getRepository(DailyTask);
    }

    async create(dailyTaskData: Partial<DailyTask>): Promise<DailyTask> {
        const dailyTask = this.repository.create(dailyTaskData);
        return this.repository.save(dailyTask);
    }

    async findByUserId(userId: string): Promise<DailyTask[]> {
        return this.repository.find({ 
            where: { user: { id: userId } },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }

    async findById(id: string): Promise<DailyTask | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['user']
        });
    }

    async update(id: string, dailyTaskData: Partial<DailyTask>): Promise<DailyTask | null> {
        const dailyTask = await this.repository.findOneBy({ id });
        if (!dailyTask) return null;
        
        Object.assign(dailyTask, dailyTaskData);
        return this.repository.save(dailyTask);
    }

    async markAsComplete(id: string): Promise<DailyTask | null> {
        const dailyTask = await this.repository.findOneBy({ id });
        if (!dailyTask) return null;
        
        dailyTask.isCompleted = true;
        dailyTask.streak += 1;
        return this.repository.save(dailyTask);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
    
}
