// src/services/BadHabitService.ts
import { AppDataSource } from "../dbConfig/data-source";
import { BadHabit, HabitOccurrence } from "../entities/BadHabit.entity";
import { User } from "../entities/User.entity";

export class BadHabitService {
  private habitRepo = AppDataSource.getRepository(BadHabit);
  private occurrenceRepo = AppDataSource.getRepository(HabitOccurrence);

  async findAllByUserId(userId: string): Promise<BadHabit[]> {
    return await this.habitRepo.find({
      where: { user: { id: userId.toString() } },
      relations: ["occurrences"],
      order: { updatedAt: "DESC" },
    });
  }

  async create(
    userId: string,
    data: { name: string; alternativeAction: string; dayCount?: number }
  ): Promise<BadHabit> {
    const habit = this.habitRepo.create({
      name: data.name,
      alternativeAction: data.alternativeAction || " ",
      dayCount: data.dayCount, // Default severity
      user: { id: userId.toString() },
    });
    const savedHabit = await this.habitRepo.save(habit);
    return savedHabit;
  }

  async update(
    habitId: number,
    userId: number,
    data: { name?: string; description?: string }
  ): Promise<BadHabit | null> {
    const habit = await this.habitRepo.findOne({
      where: { id: habitId.toString(), user: { id: userId.toString() } },
    });
    if (!habit) return null;

    Object.assign(habit, data);
    habit.updatedAt = new Date();
    return await this.habitRepo.save(habit);
  }

  async delete(habitId: number, userId: number): Promise<void> {
    await this.habitRepo.delete({
      id: habitId.toString(),
      user: { id: userId.toString() },
    });
  }

  async recordOccurrence(
    habitId: number,
    userId: string
  ): Promise<BadHabit | null> {
    const habit = await this.habitRepo.findOne({
      where: { id: habitId.toString(), user: { id: userId.toString() } },
    });
    if (!habit) return null;

    const occurrence = this.occurrenceRepo.create({
      habit: { id: habitId.toString() },
      user: { id: userId.toString() },
    });
    await this.occurrenceRepo.save(occurrence);

    return await this.habitRepo.findOne({
      where: { id: habitId.toString() },
      relations: ["occurrences"],
    });
  }
}
