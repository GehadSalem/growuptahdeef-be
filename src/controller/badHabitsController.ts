import { Request, Response } from 'express';
import BadHabit from '../models/badHabit'; 

export class BadHabitsController {
  static async getAllBadHabits(req: Request, res: Response) {
    try {
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: user not found or invalid user id',
        });
      }

      const habits = await BadHabit.findAllByUserId(req.user.id);
      res.json({
        success: true,
        data: habits,
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  static async createBadHabit(req: Request, res: Response) {
    try {
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: user not found or invalid user id',
        });
      }

      const { name, description } = req.body;
      const newHabit = await BadHabit.create(req.user.id, { name, description });

      res.status(201).json({
        success: true,
        data: newHabit,
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  static async updateBadHabit(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!req.user || typeof req.user.id !== 'number' || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request',
        });
      }

      const { name, description } = req.body;
      const updatedHabit = await BadHabit.update(id, req.user.id, { name, description });

      res.json({
        success: true,
        data: updatedHabit,
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  static async deleteBadHabit(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!req.user || typeof req.user.id !== 'number' || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request',
        });
      }

      await BadHabit.delete(id, req.user.id);
      res.json({
        success: true,
        message: 'Bad habit deleted successfully',
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  static async recordOccurrence(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!req.user || typeof req.user.id !== 'number' || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request',
        });
      }

      const result = await BadHabit.recordOccurrence(id, req.user.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}
