import { InstallmentPayment } from '../entities/Installment.entity';
import { User } from '../entities/User.entity';
import { InstallmentRepository } from '../repositories/installment.repository';

export class InstallmentService {
  private repository: InstallmentRepository;

  constructor() {
    this.repository = new InstallmentRepository();
  }

  async createInstallment(InstallmentPayment: InstallmentPayment): Promise<InstallmentPayment> {
    return this.repository.create(InstallmentPayment);
  }

  async getUserInstallments(user: User): Promise<InstallmentPayment[]> {
    return this.repository.findByUser(user);
  }

  async getInstallmentById(id: string, user: User): Promise<InstallmentPayment | null> {
    return this.repository.findById(id, user);
  }

  async updateInstallment(
    id: string,
    updateData: Partial<InstallmentPayment>,
    user: User
  ): Promise<InstallmentPayment | null> {
    return this.repository.update(id, updateData, user);
  }

  async deleteInstallment(id: string, user: User): Promise<boolean> {
    return this.repository.delete(id, user);
  }

  async getInstallmentsByDateRange(
    user: User,
    startDate: Date,
    endDate: Date
  ): Promise<InstallmentPayment[]> {
    return this.repository.findByDateRange(user, startDate, endDate);
  }

  async getInstallmentsByStatus(user: User, status: string): Promise<InstallmentPayment[]> {
    return this.repository.findByStatus(user, status);
  }

  async markInstallmentPaid(id: string, user: User): Promise<InstallmentPayment | null> {
    return this.repository.markAsPaid(id, user);
  }
}