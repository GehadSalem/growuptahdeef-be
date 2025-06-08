import { Request, Response } from 'express';
import { ExpenseService } from '../services/expense.service';

class ExpenseController {
    private static expenseService = new ExpenseService();

    static addExpense = async (request: Request, response: Response): Promise<void> => {
        try {
            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const expense = await this.expenseService.createExpense(request.user?.id, request.body);
            response.status(201).json(expense);
        } catch (error) {
            if (error instanceof Error) {
                response.status(400).json({ message: error.message });
            } else {
                response.status(400).json({ message: 'An unknown error occurred' });
            }
        }
    };

    static getExpenses = async (request: Request, response: Response): Promise<void> => {
        try {
            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const expenses = await this.expenseService.getUserExpenses(request.user?.id);
            response.json(expenses);
        } catch (error) {
            if (error instanceof Error) {
                response.status(500).json({ message: error.message });
            } else {
                response.status(500).json({ message: 'An unknown error occurred' });
            }
        }
    };

    static getMonthlyReport = async (request: Request, response: Response): Promise<void> => {
        try {
            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const report = await this.expenseService.generateMonthlyReport(
                request.user?.id,
                parseInt(request.params.month),
                parseInt(request.params.year)
            );
            response.json(report);
        } catch (error) {
            if (error instanceof Error) {
                response.status(400).json({ message: error.message });
            } else {
                response.status(400).json({ message: 'An unknown error occurred' });
            }
        }
    };
}

export default ExpenseController;