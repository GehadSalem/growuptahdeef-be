import { Request, Response } from 'express';
import '../types/express';
import { InstallmentPayment } from '../entities/Installment.entity';
import { CustomInstallmentPlan } from '../entities/CustomInstallmentPlan.entity';
import { AppDataSource } from '../dbConfig/data-source';
import { UserService } from '../services/users.service';
import { InstallmentService } from '../services/installment.service';
import { MajorGoalService } from '../services/majorGoal.service';

export class InstallmentController {
  private static service = new InstallmentService();
  private static userService = new UserService();

   static addInstallment = async (req: Request, res: Response) => {
    try {
      const { amount, paymentDate, status, paymentMethod, installmentPlanId } = req.body;

      // Validate input
      if (!amount || !paymentDate || !installmentPlanId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Verify installment plan exists
      const plan = await AppDataSource.getRepository(CustomInstallmentPlan).findOne({
        where: { id: installmentPlanId },
        relations: ['linkedGoal']
      });

      if (!plan) {
        return res.status(404).json({ message: 'Installment plan not found' });
      }

      // Create payment
      const payment = new InstallmentPayment();
      payment.amount = amount;
      payment.paymentDate = new Date(paymentDate);
      payment.status = status || 'pending';
      payment.paymentMethod = paymentMethod || 'bank_transfer';
      payment.installmentPlan = plan;

      // Save payment
      const savedPayment = await AppDataSource.getRepository(InstallmentPayment).save(payment);

      return res.status(201).json(savedPayment);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  static markInstallmentPaid = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information missing' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const installment = await this.service.markInstallmentPaid(req.params.id, user);
      if (!installment) {
        res.status(404).json({ message: 'Installment not found' });
        return;
      }

      // Update goal progress if this installment is part of a plan linked to a goal
      if (installment.installmentPlan?.linkedGoal) {
        await MajorGoalService.updateGoalProgress(installment.installmentPlan.linkedGoal.id);
      }

      res.json(installment);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  static getUserInstallments = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information missing' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const installments = await this.service.getUserInstallments(user);
      res.json(installments);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  static updateInstallment = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information missing' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const updated = await this.service.updateInstallment(req.params.id, req.body, user);
      if (!updated) {
        res.status(404).json({ message: 'Installment not found' });
        return;
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  static deleteInstallment = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information missing' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const success = await this.service.deleteInstallment(req.params.id, user);
      if (!success) {
        res.status(404).json({ message: 'Installment not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  static getInstallmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User information missing' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const installment = await this.service.getInstallmentById(req.params.id, user);
      if (!installment) {
        res.status(404).json({ message: 'Installment not found' });
        return;
      }

      res.json(installment);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
    static MajorGoalService: any;

}