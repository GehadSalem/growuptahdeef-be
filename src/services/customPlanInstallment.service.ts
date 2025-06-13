import { CustomInstallmentPlan } from '../entities/CustomInstallmentPlan.entity';
import { MajorGoal } from '../entities/MajorGoal.entity';
import { User } from '../entities/User.entity';
import { CustomInstallmentPlanRepository } from '../repositories/customInstallmentPlan.repository';

export class CustomInstallmentPlanService {
  private repository: CustomInstallmentPlanRepository;
    getPlansForGoal: any;

  constructor() {
    this.repository = new CustomInstallmentPlanRepository();
  }

  async createPlan(planData: any, user: User): Promise<CustomInstallmentPlan> {
  const plan = new CustomInstallmentPlan();
  Object.assign(plan, planData);
  plan.user = user;

  // Handle linked goal if provided
  if (planData.linkedGoalId) {
    plan.linkedGoal = await MajorGoal.findOne({ 
      where: { id: planData.linkedGoalId } 
    });
  }

  // Save and return with relations
  return this.repository.save(plan, { 
    relations: ['linkedGoal'] // This loads the relationship
  });
}

  async getUserPlans(user: User): Promise<CustomInstallmentPlan[]> {
    return await this.repository.findByUser(user);
  }

  async getPlanById(id: string, user: User): Promise<CustomInstallmentPlan | null> {
    return await this.repository.findById(id, user);
  }

  async updatePlan(
    id: string,
    updateData: Partial<CustomInstallmentPlan>,
    user: User
  ): Promise<CustomInstallmentPlan | null> {
    // Get existing plan first
    const existingPlan = await this.repository.findById(id, user);
    if (!existingPlan) {
      return null;
    }

    // Prepare the updated data
    const updatedPlan = {
      ...existingPlan,
      ...updateData
    };

    // Recalculate monthly installment if totalCost or monthsCount changes
    if (updateData.totalAmount !== undefined || updateData.monthlyAmount !== undefined) {
      const newTotalAmount = updateData.totalAmount ?? existingPlan.totalAmount;
      const newMonthlyAmount = updateData.monthlyAmount ?? existingPlan.monthlyAmount;
      
      if (newTotalAmount <= 0 || newMonthlyAmount <= 0) {
        throw new Error('totalAmount and monthsCount must be positive numbers');
      }

      updatedPlan.monthlyInstallment = newTotalAmount / newMonthlyAmount;
    }

    return await this.repository.update(id, updatedPlan, user);
  }

  async deletePlan(id: string, user: User): Promise<boolean> {
    return await this.repository.delete(id, user);
  }
  
}