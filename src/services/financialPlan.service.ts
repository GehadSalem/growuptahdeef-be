// services/financialPlan.service.ts
import { AppDataSource } from "../dbConfig/data-source";
import { FinancialPlan } from "../entities/FinancialPlan";
import { Expense } from "../entities/Expense.entity";

export class FinancialPlanService {
  private planRepo = AppDataSource.getRepository(FinancialPlan);
  private expenseRepo = AppDataSource.getRepository(Expense);

  async createOrUpdatePlan(userId: string, monthlyIncome: number) {
    const emergencySavings = +(monthlyIncome * 0.1).toFixed(2);
    const totalExpenses = 0;
    const remainingBalance = +(monthlyIncome - emergencySavings).toFixed(2);

    const existing = await this.planRepo.findOne({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });

    if (existing) {
      existing.monthlyIncome = monthlyIncome;
      existing.emergencySavings = emergencySavings;
      existing.remainingBalance = remainingBalance;
      return this.planRepo.save(existing);
    }

    const plan = this.planRepo.create({
      monthlyIncome,
      emergencySavings,
      totalExpenses,
      remainingBalance,
      user: { id: userId },
    });

    return this.planRepo.save(plan);
  }

  async addExpense(userId: string, amount: number, description: string) {
    const plan = await this.planRepo.findOne({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });

    if (!plan) throw new Error("No financial plan found");

    const expense = this.expenseRepo.create({
      amount,
      description,
      plan,
      user: { id: userId },
    });

    plan.totalExpenses += amount;
    plan.remainingBalance -= amount;

    await this.planRepo.save(plan);
    await this.expenseRepo.save(expense);
    return { plan, expense };
  }

  async getPlan(userId: string) {
    return this.planRepo.findOne({
      where: { user: { id: userId } },
      relations: ["expenses"],
      order: { createdAt: "DESC" },
    });
  }
}
