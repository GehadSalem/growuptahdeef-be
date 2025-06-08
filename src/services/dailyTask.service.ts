

import { DailyTaskRepository } from '../repositories/dailyTask.repository';
import { DailyTask } from '../entities/DailyTask.entity';

export class DailyTaskService {
  private dailyTaskRepo: DailyTaskRepository;

  constructor(dailyTaskRepo?: DailyTaskRepository) {
    this.dailyTaskRepo = dailyTaskRepo || new DailyTaskRepository();
  }

  async create(userId: string, data: Partial<DailyTask>) {
    return await this.dailyTaskRepo.create({
      ...data,
      user: { id: userId } as any,
    });
  }

  async getAll(userId: string) {
    return await this.dailyTaskRepo.findByUserId(userId);
  }

  async getById(id: string) {
    return await this.dailyTaskRepo.findById(id);
  }

  async update(id: string, data: Partial<DailyTask>) {
    return await this.dailyTaskRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    await this.dailyTaskRepo.delete(id);
    return true;
  }

  async markAsComplete(id: string) {
    return await this.dailyTaskRepo.markAsComplete(id);
  }
}
