import { Request, Response } from 'express';
import { Income } from '../entities/Income.entity';
import { AppDataSource } from '../dbConfig/data-source';
import '../types/express';
import { Between } from 'typeorm';
import { UserService } from '../services/users.service';

export class IncomeController {
  private static incomeRepository = AppDataSource.getRepository(Income);
  private static userService = new UserService();

  static addIncome = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(400).json({ message: 'User information is missing.' });
      return;
    }

    // Validate request body
    const { amount, description, incomeDate } = req.body;
    if (!amount || !description || !incomeDate) {
      res.status(400).json({ message: 'Amount, description, and date are required.' });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ message: 'Amount must be positive.' });
      return;
    }

    const user = await this.userService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const newIncome = this.incomeRepository.create({
      amount,
      description,
      date: new Date(incomeDate),
      user
    });
    
    await this.incomeRepository.save(newIncome);
    res.status(201).json(newIncome);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};

  static getUserIncomes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(400).json({ message: 'User information is missing.' });
      return;
    }

    const incomes = await this.incomeRepository.find({
      where: { user: { id: req.user.id } }
    });

    res.json(incomes);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};

  static updateIncome = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(400).json({ message: 'User information is missing.' });
      return;
    }

    const income = await this.incomeRepository.findOne({
      where: { id: req.params.id, user: { id: req.user.id } }
    });

    if (!income) {
      res.status(404).json({ message: 'Income not found or access denied.' });
      return;
    }

    // Validate and extract only allowed fields
    const { amount, date, description } = req.body;

    // Validate amount if provided
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({ message: 'Amount must be a positive number.' });
        return;
      }
      income.amount = amount;
    }

    // Validate date if provided
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ message: 'Invalid date format.' });
        return;
      }
      income.date = parsedDate;
    }

    // Update description if provided
    if (description !== undefined) {
      income.description = description;
    }

    const updatedIncome = await this.incomeRepository.save(income);
    res.json(updatedIncome);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};

  static deleteIncome = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(400).json({ message: 'User information is missing.' });
      return;
    }

    const result = await this.incomeRepository.delete({
      id: req.params.id,
      user: { id: req.user.id }
    });

    if (result.affected === 0) {
      res.status(404).json({ message: 'Income not found or access denied.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};

  static getIncomeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const incomeId = req.params.id;

      if (!req.user) {
        res.status(400).json({ message: 'User information is missing in the request.' });
        return;
      }

      const income = await this.incomeRepository.findOne({ 
        where: { id: incomeId },
        relations: ['user']
      });

      if (!income) {
        res.status(404).json({ message: 'Income not found.' });
        return;
      }

      // Optional: ensure the income belongs to the current user
      if (income.user.id !== req.user.id) {
        res.status(403).json({ message: 'Access denied to this income record.' });
        return;
      }

      res.json(income);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  };

  static getIncomesByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(400).json({ message: 'User information is missing.' });
      return;
    }

    const { year, month } = req.params;
    const yearNum = parseInt(year);
    const monthNum = month ? parseInt(month) : undefined;

    // Basic validation
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum)) {
      res.status(400).json({ message: 'Year must be a valid number' });
      return;
    }

    if (yearNum < 2000 || yearNum > currentYear + 1) {
      res.status(400).json({ message: `Year must be between 2000 and ${currentYear + 1}` });
      return;
    }

    if (month && (isNaN(monthNum!) || monthNum! < 1 || monthNum! > 12)) {
      res.status(400).json({ message: 'Month must be between 1 and 12' });
      return;
    }

    // Set date range
    const startDate = monthNum !== undefined
      ? new Date(yearNum, monthNum - 1, 1) // First day of month
      : new Date(yearNum, 0, 1); // First day of year

    const endDate = monthNum !== undefined
      ? new Date(yearNum, monthNum, 0, 23, 59, 59) // Last day of month
      : new Date(yearNum, 11, 31, 23, 59, 59); // Last day of year

    const incomes = await this.incomeRepository.find({
      where: {
        user: { id: req.user.id },
        date: Between(startDate, endDate)
      },
      order: { date: 'DESC' }
    });

    res.json({
      data: incomes,
      meta: {
        year: yearNum,
        month: monthNum || null,
        count: incomes.length
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};


}