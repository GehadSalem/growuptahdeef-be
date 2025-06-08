import { Request, Response } from 'express';
import '../types/express';
import { MajorGoalService } from '../services/majorGoal.service';
import { UserService } from '../services/users.service';

class MajorGoalController {
  private static majorGoalService = new MajorGoalService();
  private static userService = new UserService();

  static createMajorGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information is missing in the request.' });
        return;
      }
      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }
      const newGoal = await this.majorGoalService.createMajorGoal(user, req.body);
      res.status(201).json(newGoal);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };

  static getUserMajorGoals = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information is missing in the request.' });
        return;
      }
      const goals = await this.majorGoalService.getUserMajorGoals(req.user.id);
      res.json(goals);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };

  static updateMajorGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedGoal = await this.majorGoalService.updateMajorGoal(req.params.id, req.body);
      res.json(updatedGoal);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };

  static deleteMajorGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.majorGoalService.deleteMajorGoal(req.params.id);
      res.status(204).send();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };

  static updateProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { progress } = req.body;
      const updatedGoal = await this.majorGoalService.updateProgress(req.params.id, progress);
      res.json(updatedGoal);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };
  static getMajorGoalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const goalId = req.params.id;

    if (!req.user) {
      res.status(400).json({ message: 'User information is missing in the request.' });
      return;
    }

    const goal = await this.MajorGoalService.getMajorGoalById(goalId);

    if (!goal) {
      res.status(404).json({ message: 'Major goal not found.' });
      return;
    }

    // Optional: ensure the goal belongs to the current user
    if (goal?.user.id !== req.user.id) {
      res.status(403).json({ message: 'Access denied to this goal.' });
      return;
    }

    res.json(goal);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};
  static MajorGoalService: any;

}

export default MajorGoalController;
