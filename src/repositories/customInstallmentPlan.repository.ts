import { Repository } from 'typeorm';
import { AppDataSource } from '../dbConfig/data-source';
import { CustomInstallmentPlan } from '../entities/CustomInstallmentPlan.entity';
import { User } from '../entities/User.entity';

export class CustomInstallmentPlanRepository {
  private repository: Repository<CustomInstallmentPlan>;
    save: any;

  constructor() {
    this.repository = AppDataSource.getRepository(CustomInstallmentPlan);
  }

  async create(planData: Partial<CustomInstallmentPlan>): Promise<CustomInstallmentPlan> {
    const plan = this.repository.create(planData);
    return await this.repository.save(plan);
  }

  async findByUser(user: User): Promise<CustomInstallmentPlan[]> {
    return await this.repository.find({ where: { user } });
  }

  async findById(id: string, user: User): Promise<CustomInstallmentPlan | null> {
    return await this.repository.findOne({ where: { id, user } });
  }

  async update(
    id: string,
    updateData: Partial<CustomInstallmentPlan>,
    user: User
  ): Promise<CustomInstallmentPlan | null> {
    await this.repository.update({ id, user }, updateData);
    return this.findById(id, user);
  }

  async delete(id: string, user: User): Promise<boolean> {
    const result = await this.repository.delete({ id, user });
    return result.affected !== 0;
  }
}