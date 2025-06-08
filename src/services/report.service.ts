import { ExpenseService } from './expense.service';
import { MajorGoalService } from './majorGoal.service';
import { SavingsGoalService } from './savingsGoal.service';

export class ReportService {
    private expenseService = new ExpenseService();
    private majorGoalService = new MajorGoalService();
    private savingsGoalService = new SavingsGoalService();

    async generateFinancialReport(userId: string) {
        const monthlyExpenses = await this.expenseService.getUserExpenses(userId);
        const savingsGoals = await this.savingsGoalService.getUserSavingsGoals(userId);
        const majorGoals = await this.majorGoalService.getUserMajorGoals(userId);

        const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        const totalSavingsNeeded = savingsGoals.reduce(
            (sum, goal) => sum + (goal.targetAmount - goal.currentAmount),
            0
        );

        const emergencyFund = savingsGoals.find(g => g.isEmergencyFund);
        const emergencyFundAmount = emergencyFund?.currentAmount || 0;

        // Optional: filter out emergency fund from total savings if needed
        const totalSavingsExcludingEmergency = savingsGoals
            .filter(g => !g.isEmergencyFund)
            .reduce((sum, goal) => sum + (goal.targetAmount - goal.currentAmount), 0);

        return {
            totalExpenses,
            totalSavingsNeeded,
            emergencyFund: {
                saved: emergencyFund?.currentAmount || 0,
                target: emergencyFund?.targetAmount || 0,
                progress: emergencyFund
                    ? (emergencyFund.currentAmount / emergencyFund.targetAmount) * 100
                    : 0
            },
            majorGoals: majorGoals.map(goal => ({
                id: goal.id,
                name: goal.name,
                progress: goal.progress,
                status: goal.status
            }))
        };
    }
}
