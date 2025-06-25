// src/controllers/BadHabitsController.ts
import { Request, Response } from 'express';
import { BadHabitService } from '../services/BadHabit.service';

const badHabitService = new BadHabitService();

export class BadHabitsController {
  static async getAllBadHabits(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId ) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const habits = await badHabitService.findAllByUserId(userId);
      res.json({ success: true, data: habits });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  static async createBadHabit(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const { name, description, severity } = req.body;
      const newHabit = await badHabitService.create(userId, { name, description, severity });
      res.status(201).json({ success: true, data: newHabit });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  static async updateBadHabit(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const { name, description } = req.body;

      const updatedHabit = await badHabitService.update(id, +userId, { name, description });
      res.json({ success: true, data: updatedHabit });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  static async deleteBadHabit(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      await badHabitService.delete(id, +userId);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  static async recordOccurrence(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const result = await badHabitService.recordOccurrence(id, userId);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }
}
