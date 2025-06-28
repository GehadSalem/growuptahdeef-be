import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../dbConfig/data-source';
import { User } from '../entities/User.entity';
import { InstallmentPayment } from '../entities/Installment.entity';
import { CustomInstallmentPlan } from '../entities/CustomInstallmentPlan.entity';

export class InstallmentRepository {
  private repository: Repository<InstallmentPayment>;

  constructor() {
    this.repository = AppDataSource.getRepository(InstallmentPayment);
  }

  async create(installmentPayment: InstallmentPayment): Promise<InstallmentPayment> {
    return this.repository.save(installmentPayment);
  }

  async findByUser(user: User): Promise<InstallmentPayment[]> {
    return this.repository.find({ 
      where: { 
        installmentPlanId: { user: { id: user.id } } 
      },
      relations: ['installmentPlanId'] 
    });
  }

  async findById(id: string, user: User): Promise<InstallmentPayment | null> {
    return this.repository.findOne({ 
      where: { 
        id, 
        installmentPlanId: { user: { id: user.id } }
      },
      relations: ['installmentPlanId'] 
    });
  }

  async update(
    id: string, 
    updateData: Partial<InstallmentPayment>, 
    user: User
  ): Promise<InstallmentPayment | null> {
    const existing = await this.findById(id, user);
    if (!existing) return null;

    await this.repository.update(
      { id }, 
      updateData
    );
    return this.findById(id, user);
  }

  async delete(id: string, user: User): Promise<boolean> {
    const existing = await this.findById(id, user);
    if (!existing) return false;

    const result = await this.repository.delete({ id });
    return result.affected !== 0;
  }

  async findByDateRange(user: User, startDate: Date, endDate: Date): Promise<InstallmentPayment[]> {
    return this.repository.find({
      where: {
        installmentPlanId: { user: { id: user.id } },
        paymentDate: Between(startDate, endDate)
      },
      relations: ['installmentPlanId'] 
    });
  }

  async findByStatus(user: User, status: string): Promise<InstallmentPayment[]> {
    return this.repository.find({ 
      where: { 
        installmentPlanId: { user: { id: user.id } },
        status 
      },
      relations: ['installmentPlanId'] 
    });
  }

  async markAsPaid(id: string, user: User): Promise<InstallmentPayment | null> {
    const existing = await this.findById(id, user);
    if (!existing) return null;

    await this.repository.update(
      { id },
      { 
        status: 'paid', 
        paymentDate: new Date() 
      }
    );
    return this.findById(id, user);
  }
}
