import { Request, Response } from 'express';
import '../types/express';
import { CustomInstallmentPlanService } from '../services/customPlanInstallment.service';
import { CustomInstallmentPlan } from '../entities/CustomInstallmentPlan.entity';
import { MajorGoal } from '../entities/MajorGoal.entity';
import { AppDataSource } from '../dbConfig/data-source';
import { UserService } from '../services/users.service';

export class CustomInstallmentPlanController {
  private static service = new CustomInstallmentPlanService();
  private static userService = new UserService();

  static addPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productName, totalCost, downPayment, monthsCount, interestRate, linkedGoalId } = req.body;

      // Basic validation
      if (!productName || !totalCost || !monthsCount) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      // Create new plan
      const plan = new CustomInstallmentPlan();
      plan.productName = productName;
      plan.totalCost = totalCost;
      plan.downPayment = downPayment || 0;
      plan.monthsCount = monthsCount;
      plan.interestRate = interestRate || 0;
      
      // Calculate monthly installment
      plan.monthlyInstallment = this.calculateMonthlyPayment(
        totalCost - (downPayment || 0),
        interestRate || 0,
        monthsCount
      );

      // Link to goal if provided
      if (linkedGoalId) {
        const goal = await AppDataSource.getRepository(MajorGoal).findOneBy({ id: linkedGoalId });
        if (!goal) {
          res.status(404).json({ message: 'Linked goal not found' });
          return;
        }
        plan.linkedGoal = goal;
      }

      // Save to database
      const savedPlan = await AppDataSource.getRepository(CustomInstallmentPlan).save(plan);
      
      res.status(201).json(savedPlan);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };

  private static calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    months: number
  ): number {
    if (annualRate === 0) return principal / months;
    
    const monthlyRate = annualRate / 100 / 12;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  }


  static getPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information is missing.' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      const plans = await this.service.getUserPlans(user);
      res.json(plans);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };

  static getPlanById = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information is missing.' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      const plan = await this.service.getPlanById(req.params.id, user);
      if (!plan) {
        res.status(404).json({ message: 'Plan not found.' });
        return;
      }

      res.json(plan);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };

  static updatePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information is missing.' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      const updatedPlan = await this.service.updatePlan(req.params.id, req.body, user);
      if (!updatedPlan) {
        res.status(404).json({ message: 'Plan not found.' });
        return;
      }

      res.json(updatedPlan);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };

  static deletePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information is missing.' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      const success = await this.service.deletePlan(req.params.id, user);
      if (!success) {
        res.status(404).json({ message: 'Plan not found.' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };
  // Add this new method to get plans for a specific goal
static getPlansForGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(400).json({ message: 'User information is missing.' });
      return;
    }

    const user = await this.userService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const goalId = req.params.goalId;
      const goal = await this.MajorGoalService.getMajorGoalById(goalId);
      
      if (!goal || goal.user.id !== user.id) {
        res.status(404).json({ message: 'Goal not found or access denied.' });
        return;
      }

      const plans = await this.service.getPlansForGoal(goalId);
      res.json(plans);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};
    static MajorGoalService: any;
}