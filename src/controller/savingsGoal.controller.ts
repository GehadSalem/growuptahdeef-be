import { Request, Response } from 'express';
import '../types/express';
import { UserService } from '../services/users.service';
import { SavingsGoalService } from '../services/savingsGoal.service';

class SavingsGoalController {
    private static savingsGoalService = new SavingsGoalService();
    private static userService = new UserService();

   static createSavingsGoal = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user?.id) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            
            const user = await this.userService.getUserById(req.user.id);
            
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // We've confirmed user exists, so we can safely pass it
            const newGoal = await this.savingsGoalService.createSavingsGoal(user, req.body);
            res.status(201).json(newGoal);
        } catch (error) {
            res.status(500).json({ 
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    static getUserSavingsGoals = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(400).json({ message: 'User information is missing in the request' });
                return;
            }

            const goals = await this.savingsGoalService.getUserSavingsGoals(req.user.id);
            res.json(goals);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
static getSavingsGoalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const goalId = req.params.id;

        // Optional: check if user is authenticated (depends on your auth logic)
        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const goal = await this.savingsGoalService.getSavingsGoalById(goalId);

        if (!goal) {
            res.status(404).json({ message: 'Savings goal not found' });
            return;
        }

        // Optional: ensure the goal belongs to the requesting user (security check)
        if (goal.user.id !== req.user.id) {
            res.status(403).json({ message: 'Forbidden: Access denied' });
            return;
        }

        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

    static updateSavingsGoal = async (req: Request, res: Response): Promise<void> => {
        try {
            const updatedGoal = await this.savingsGoalService.updateSavingsGoal(req.params.id, req.body);
            res.json(updatedGoal);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    static deleteSavingsGoal = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.savingsGoalService.deleteSavingsGoal(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    static addToSavingsGoal = async (req: Request, res: Response): Promise<void> => {
        try {
            const { amount } = req.body;
            const updatedGoal = await this.savingsGoalService.addToSavingsGoal(req.params.id, amount);
            res.json(updatedGoal);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
}

export default SavingsGoalController;