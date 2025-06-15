import { Request, Response } from 'express';
import Stats from '../models/stats';

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

export class DashboardStatsController {
  static async getDashboardStats(req: Request, res: Response) {
    try {
      if (!req.user || typeof req.user.id === 'undefined') {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not found'
        });
      }

      const userId = Number(req.user.id);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const stats: DashboardStats = await Stats.getDashboardStats(userId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  static async getWeeklyStats(req: Request, res: Response) {
    try {
      if (!req.user || typeof req.user.id === 'undefined') {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not found'
        });
      }

      const userId = Number(req.user.id);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const weeklyData: WeeklyProgress = await Stats.getWeeklyProgress(userId);
      res.json({
        success: true,
        data: weeklyData
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  static async getMonthlyStats(req: Request, res: Response) {
    try {
      if (!req.user || typeof req.user.id === 'undefined') {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not found'
        });
      }

      const userId = Number(req.user.id);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const monthlyData: MonthlyReport = await Stats.getMonthlyReports(userId);
      res.json({
        success: true,
        data: monthlyData
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}
