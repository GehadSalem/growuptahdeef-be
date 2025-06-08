import { Request, Response } from 'express';
import '../types/express';
import { DailyTaskService } from '../services/dailyTask.service';

class DailyTaskController {
  private static taskService = new DailyTaskService();

  static createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const task = await this.taskService.create(req.user.id, req.body);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  };

  static getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const tasks = await this.taskService.getAll(req.user.id);
      res.json(tasks);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  };

  static getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const task = await DailyTaskController.taskService.getById(req.params?.id);
        if (!task) {   // <-- Error points here if getById returns void
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};


  static updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await this.taskService.update(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  };

  static deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.taskService.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  };

  static markTaskComplete = async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await this.taskService.markAsComplete(req.params.id);
      res.json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  };
}

export default DailyTaskController;
