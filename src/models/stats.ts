import { AppDataSource } from '../dbConfig/data-source';
import { HabitOccurrence } from '../entities/BadHabit.entity';
import { BadHabit } from '../entities/BadHabit.entity';

interface DashboardStats {
  habitsTracked: number;
  habitsImproved: number;
  currentStreak: number;
  weeklyProgress: number;
}

interface WeeklyProgress {
  weekStart: Date;
  habitsTracked: number[]; // optional placeholder
  occurrences: number[];
}

interface MonthlyReport {
  month: number;
  year: number;
  totalOccurrences: number;
  improvementPercentage: number;
}

class Stats {
  static async getDashboardStats(userId: number): Promise<DashboardStats> {
    const habitRepo = AppDataSource.getRepository(BadHabit);
    const occurrenceRepo = AppDataSource.getRepository(HabitOccurrence);

    const habits = await habitRepo.find({ where: { user: { id: userId.toString() } } });
    const habitsImproved = habits.filter((habit) => (habit as any).improvementPercentage > 0);

    const streak = 0; // لسه مش معروف منين بتجيب الستريك - لو في جدول خاص بيه عرفه هنا

    return {
      habitsTracked: habits.length,
      habitsImproved: habitsImproved.length,
      currentStreak: streak,
      weeklyProgress: 75, // هنحسبه في الدالة اللي بعدها
    };
  }

  static async getWeeklyProgress(userId: number): Promise<WeeklyProgress> {
    const occurrenceRepo = AppDataSource.getRepository(HabitOccurrence);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const occurrences = await occurrenceRepo
      .createQueryBuilder('occurrence')
      .select('DAYOFWEEK(occurrence.occurrenceDate)', 'day')
      .addSelect('COUNT(*)', 'count')
      .where('occurrence.user = :userId', { userId })
      .andWhere('occurrence.occurrenceDate >= :weekStart', { weekStart })
      .groupBy('day')
      .getRawMany();

    const dailyCounts = [0, 0, 0, 0, 0, 0, 0];
    occurrences.forEach((row: any) => {
      dailyCounts[row.day - 1] = parseInt(row.count);
    });

    return {
      weekStart,
      habitsTracked: [], // لو محتاج تجيبهم كبيانات ممكن تضيفها
      occurrences: dailyCounts,
    };
  }

  static async getMonthlyReports(userId: number): Promise<MonthlyReport> {
    const occurrenceRepo = AppDataSource.getRepository(HabitOccurrence);
    const habitRepo = AppDataSource.getRepository(BadHabit);

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const occurrences = await occurrenceRepo
      .createQueryBuilder('occurrence')
      .where('occurrence.user = :userId', { userId })
      .andWhere('MONTH(occurrence.occurrenceDate) = :month', { month })
      .andWhere('YEAR(occurrence.occurrenceDate) = :year', { year })
      .getCount();

    const habits = await habitRepo.find({ where: { user: { id: userId.toString() } } });
    const totalImprovement = habits.reduce((sum, h) => sum + ((h as any).improvementPercentage || 0), 0);
    const avgImprovement = habits.length ? totalImprovement / habits.length : 0;

    return {
      month,
      year,
      totalOccurrences: occurrences,
      improvementPercentage: avgImprovement,
    };
  }
}

export default Stats;
