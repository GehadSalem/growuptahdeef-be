import { AppDataSource } from '../../src/dbConfig/data-source';

interface DashboardStats {
  habitsTracked: number;
  habitsImproved: number;
  currentStreak: number;
  weeklyProgress: number;
}

interface WeeklyProgress {
  weekStart: Date;
  habitsTracked: number[];
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
const connection = AppDataSource.manager;
    try {
      // Example queries - adjust based on your actual schema
      const [habitsTracked] = await connection.query(
        'SELECT COUNT(*) as count FROM user_habits WHERE user_id = ?',
        [userId]
      );
      
      const [habitsImproved] = await connection.query(
        `SELECT COUNT(*) as count FROM user_habits 
         WHERE user_id = ? AND improvement_percentage > 0`,
        [userId]
      );
      
      const [streak] = await connection.query(
        `SELECT MAX(streak) as currentStreak FROM habit_streaks 
         WHERE user_id = ?`,
        [userId]
      );
      
      return {
        habitsTracked: habitsTracked[0].count,
        habitsImproved: habitsImproved[0].count,
        currentStreak: streak[0].currentStreak || 0,
        weeklyProgress: 75 // This would come from a more complex query
      };
    } finally {
      connection.release();
    }
  }

  static async getWeeklyProgress(userId: number): Promise<WeeklyProgress> {
const connection = AppDataSource.manager;
    try {
      // Get the start of the current week (Sunday)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      // Query for occurrences per day this week
      const [occurrences] = await connection.query(
        `SELECT DAYOFWEEK(occurrence_date) as day, COUNT(*) as count 
         FROM habit_occurrences 
         WHERE user_id = ? AND occurrence_date >= ?
         GROUP BY DAYOFWEEK(occurrence_date)`,
        [userId, weekStart]
      );
      
      // Initialize array with 0 counts for each day (1=Sunday to 7=Saturday)
      const dailyCounts = [0, 0, 0, 0, 0, 0, 0];
      occurrences.forEach((row: any) => {
        dailyCounts[row.day - 1] = row.count;
      });
      
      return {
        weekStart,
        habitsTracked: [1, 2, 3, 4, 5, 6, 7], // This would come from actual data
        occurrences: dailyCounts
      };
    } finally {
      connection.release();
    }
  }

  static async getMonthlyReports(userId: number): Promise<MonthlyReport> {
const connection = AppDataSource.manager;
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const [totalOccurrences] = await connection.query(
        `SELECT COUNT(*) as count FROM habit_occurrences 
         WHERE user_id = ? AND MONTH(occurrence_date) = ? AND YEAR(occurrence_date) = ?`,
        [userId, month, year]
      );
      
      const [improvement] = await connection.query(
        `SELECT AVG(improvement_percentage) as avg_improvement 
         FROM user_habits WHERE user_id = ?`,
        [userId]
      );
      
      return {
        month,
        year,
        totalOccurrences: totalOccurrences[0].count,
        improvementPercentage: improvement[0].avg_improvement || 0
      };
    } finally {
      connection.release();
    }
  }
}

export default Stats;