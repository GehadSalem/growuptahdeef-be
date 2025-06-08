import AuthController from '../controller/auth.controller';
import { CustomInstallmentPlanController } from '../controller/customPlanInstallment.controller';
import DailyTaskController from '../controller/dailyTask.controller';
import EmergencyController from '../controller/emergency.controller';
import ExpenseController from '../controller/expense.controller';
import HabitController from '../controller/habit.controller';
import { IncomeController } from '../controller/income.controller';
import { InstallmentController } from '../controller/installment.controller';
import MajorGoalController from '../controller/majorGoals.controller';
import NotificationController from '../controller/notification.controller';
import { getReferrals } from '../controller/referral.controller';
import SavingsGoalController from '../controller/savingsGoal.controller';
import UserController from '../controller/user.controller';
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { getCurrency } from '../middlewares/getCurrency';
import protectedRouter from '../utils/protectedRouter';

const publicRouter = Router();

/* ---------------------- Public Routes ---------------------- */

// Currency route
publicRouter.get('/currency', getCurrency, (req: Request, res: Response) => {
  res.json({ currency: (req as any).userCurrency });
});

// Authentication
publicRouter.post('/register', asyncHandler(AuthController.register));
publicRouter.post('/login', asyncHandler(AuthController.login));
publicRouter.post('/google', asyncHandler(AuthController.googleAuth)); // Google auth route

/* ---------------------- Protected Routes ---------------------- */

// All routes below this require authentication middleware
protectedRouter.use(asyncHandler(authenticate));

//users
protectedRouter.get('/users', asyncHandler(UserController.getAllUsers));

// Expenses
protectedRouter.post('/expenses', asyncHandler(ExpenseController.addExpense));
protectedRouter.get('/expenses', asyncHandler(ExpenseController.getExpenses));
protectedRouter.get('/expenses/:month/:year', asyncHandler(ExpenseController.getMonthlyReport));

// Habits
protectedRouter.post('/habits', asyncHandler(HabitController.addHabit));
protectedRouter.get('/habits', asyncHandler(HabitController.getHabits));
protectedRouter.patch('/habits/:id', asyncHandler(HabitController.markHabitComplete));

// Emergency
protectedRouter.post('/emergency', asyncHandler(EmergencyController.addToEmergencyFund));
protectedRouter.get('/emergency', asyncHandler(EmergencyController.getEmergencyFunds));

// Notifications
protectedRouter.get('/notification', asyncHandler(NotificationController.testNotification));
protectedRouter.patch('/notification/:id', asyncHandler(NotificationController.markNotificationRead));
protectedRouter.delete('/notification/:id', asyncHandler(NotificationController.testNotification)); 

// Daily Tasks
protectedRouter.post('/dailyTask', asyncHandler(DailyTaskController.createTask));
protectedRouter.get('/dailyTask', asyncHandler(DailyTaskController.getTasks));
protectedRouter.get('/dailyTask/:id', asyncHandler(DailyTaskController.getTaskById));
protectedRouter.patch('/dailyTask/:id', asyncHandler(DailyTaskController.updateTask));
protectedRouter.patch('/dailyTask/:id/complete', asyncHandler(DailyTaskController.markTaskComplete));
protectedRouter.delete('/dailyTask/:id', asyncHandler(DailyTaskController.deleteTask));

// Savings Goals
protectedRouter.post('/savingsGoals', asyncHandler(SavingsGoalController.createSavingsGoal));
protectedRouter.get('/savingsGoals', asyncHandler(SavingsGoalController.getUserSavingsGoals));
protectedRouter.get('/savingsGoals/:id', asyncHandler(SavingsGoalController.getSavingsGoalById));
protectedRouter.put('/savingsGoals/:id', asyncHandler(SavingsGoalController.updateSavingsGoal));
protectedRouter.delete('/savingsGoals/:id', asyncHandler(SavingsGoalController.deleteSavingsGoal));
protectedRouter.post('/savingsGoals/:id', asyncHandler(SavingsGoalController.addToSavingsGoal));

// Major Goals
protectedRouter.post('/majorGoals', asyncHandler(MajorGoalController.createMajorGoal));
protectedRouter.get('/majorGoals', asyncHandler(MajorGoalController.getUserMajorGoals));
protectedRouter.get('/majorGoals/:id', asyncHandler(MajorGoalController.getMajorGoalById));
protectedRouter.put('/majorGoals/:id', asyncHandler(MajorGoalController.updateMajorGoal));
protectedRouter.delete('/majorGoals/:id', asyncHandler(MajorGoalController.deleteMajorGoal));
protectedRouter.patch('/majorGoals/:id', asyncHandler(MajorGoalController.updateProgress)); // بدون slash زائدة

// Incomes
protectedRouter.post('/incomes', asyncHandler(IncomeController.addIncome));
protectedRouter.get('/incomes', asyncHandler(IncomeController.getUserIncomes));
protectedRouter.get('/incomes/:year/:month', asyncHandler(IncomeController.getIncomesByDate));
protectedRouter.get('/incomes/:id', asyncHandler(IncomeController.getIncomeById));
protectedRouter.put('/incomes/:id', asyncHandler(IncomeController.updateIncome));
protectedRouter.delete('/incomes/:id', asyncHandler(IncomeController.deleteIncome));

// Installments
protectedRouter.post('/installments', asyncHandler(InstallmentController.addInstallment));
protectedRouter.get('/installments', asyncHandler(InstallmentController.getUserInstallments));
protectedRouter.get('/installments/:id', asyncHandler(InstallmentController.getInstallmentById));
protectedRouter.patch('/installments/:id/pay', asyncHandler(InstallmentController.markInstallmentPaid));
protectedRouter.put('/installments/:id', asyncHandler(InstallmentController.updateInstallment));
protectedRouter.delete('/installments/:id', asyncHandler(InstallmentController.deleteInstallment));

// Custom Installment Plans
protectedRouter.post('/custom-installment-plans', asyncHandler(CustomInstallmentPlanController.addPlan));
protectedRouter.get('/custom-installment-plans', asyncHandler(CustomInstallmentPlanController.getPlans));
protectedRouter.get('/custom-installment-plans/:id', asyncHandler(CustomInstallmentPlanController.getPlanById));
protectedRouter.put('/custom-installment-plans/:id', asyncHandler(CustomInstallmentPlanController.updatePlan));
protectedRouter.delete('/custom-installment-plans/:id', asyncHandler(CustomInstallmentPlanController.deletePlan));

// Referral system (view users referred by the logged-in user)
protectedRouter.get('/referrals', asyncHandler(getReferrals));

export { publicRouter, protectedRouter };