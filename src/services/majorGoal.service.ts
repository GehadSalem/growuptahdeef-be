import { AppDataSource } from "../dbConfig/data-source";
import { MajorGoal } from "../entities/MajorGoal.entity";
import { User } from "../entities/User.entity";

export class MajorGoalService {
  static getMajorGoalById(goalId: string) {
    throw new Error('Method not implemented.');
  }
  private majorGoalRepository = AppDataSource.getRepository(MajorGoal);

  async createMajorGoal(
    user: User,
    goalData: Partial<MajorGoal>
  ): Promise<MajorGoal> {
    try {
      const newGoal = this.majorGoalRepository.create({
        ...goalData,
        user,
      });

      const savedGoal = await this.majorGoalRepository.save(newGoal);

      // Recalculate user financial values
      await this.recalculateUserFinancials(user.id);

      return savedGoal;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getUserMajorGoals(userId: string): Promise<MajorGoal[]> {
    return await this.majorGoalRepository.find({
      where: { user: { id: userId } },
      relations: ["user"],
    });
  }

  async updateMajorGoal(
    goalId: string,
    updateData: Partial<MajorGoal>
  ): Promise<MajorGoal> {
    const goal = await this.majorGoalRepository.findOneBy({ id: goalId });
    if (!goal) throw new Error("Major goal not found");

    Object.assign(goal, updateData);
    return await this.majorGoalRepository.save(goal);
  }

  async deleteMajorGoal(goalId: string): Promise<void> {
    await this.majorGoalRepository.delete(goalId);
  }

  async updateProgress(goalId: string, progress: number): Promise<MajorGoal> {
    const goal = await this.majorGoalRepository.findOneBy({ id: goalId });
    if (!goal) throw new Error("Major goal not found");

    goal.progress = progress;
    if (progress >= 100) {
      goal.status = "completed";
    } else if (progress > 0) {
      goal.status = "in-progress";
    }

    return await this.majorGoalRepository.save(goal);
  }

  async recalculateUserFinancials(userId: string): Promise<void> {
    const goals = await this.getUserMajorGoals(userId);
    const now = new Date();

    let totalMonthlyRequired = 0;

    goals.forEach(goal => {
      if (!goal.targetDate) return;

      const endDate = new Date(goal.targetDate);
      const monthsRemaining = Math.max(
        1,
        (endDate.getFullYear() - now.getFullYear()) * 12 +
        (endDate.getMonth() - now.getMonth())
      );

      const amountRemaining = goal.estimatedCost - (goal.progress / 100 * goal.estimatedCost);
      const monthlyForGoal = amountRemaining / monthsRemaining;
      totalMonthlyRequired += monthlyForGoal;
    });

    // update
    await AppDataSource
      .getRepository(User)
      .update(userId, { monthlyCommitment: totalMonthlyRequired });
  }

  async getMajorGoalById(id: string): Promise<MajorGoal | null> {
    return await AppDataSource.getRepository(MajorGoal).findOne({
      where: { id },
      relations: ["user"],
    });
  }

  static async updateGoalProgress(goalId: string): Promise<void> {
    const goal = await MajorGoal.findOne({
      where: { id: goalId },
      relations: ["linkedInstallments", "linkedInstallments.payments"],
    });

    if (!goal) return;

    let totalPaid = 0;

    goal.linkedInstallments?.forEach((plan: { payments: any[] }) => {
      plan.payments?.forEach((payment) => {
        if (payment.status === "paid") {
          totalPaid += payment.amount;
        }
      });
    });

    const newProgress = (totalPaid / goal.estimatedCost) * 100;
    const newStatus =
      newProgress >= 100
        ? "completed"
        : newProgress > 0
        ? "in-progress"
        : "planned";

    await MajorGoal.update(goalId, {
      progress: Math.min(newProgress, 100),
      status: newStatus,
    });
  }
}
