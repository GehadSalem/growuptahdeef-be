// ✅ emergency.service.ts
import { EmergencyFund, EmergencyFundType } from '../entities/EmergencyFund.entity';
import { EmergencyRepository } from '../repositories/emergency.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppDataSource } from '../dbConfig/data-source';
import { User } from '../entities/User.entity';

export class EmergencyService {
  private emergencyRepository: EmergencyRepository;
  private userRepository: UserRepository;
  private fundRepository = AppDataSource.getRepository(EmergencyFund);

  constructor(
    emergencyRepository?: EmergencyRepository,
    userRepository?: UserRepository
  ) {
    this.emergencyRepository = emergencyRepository || new EmergencyRepository();
    this.userRepository = userRepository || new UserRepository();
  }

  async addToFund(
    userId: string,
    amount: number,
    description: string
  ): Promise<EmergencyFund> {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await this.emergencyRepository.createFund({
      amount,
      type: EmergencyFundType.DEPOSIT,
      description,
      date: new Date(),
      user
    });
  }

  async withdrawFromFund(
    userId: string,
    amount: number,
    description?: string
  ): Promise<{ withdrawal: EmergencyFund; newBalance: number }> {
    const currentBalance = await this.calculateCurrentBalance(userId);

    if (amount > currentBalance) {
      throw new Error('الرصيد غير كافٍ في صندوق الطوارئ.');
    }

    const withdrawal = this.fundRepository.create({
      amount: -amount,
      type: EmergencyFundType.WITHDRAWAL,
      description: description || 'سحب من صندوق الطوارئ',
      date: new Date(),
      user: { id: userId } as User,
    });

    await this.fundRepository.save(withdrawal);

    return {
      withdrawal,
      newBalance: currentBalance - amount
    };
  }

  async getUserFunds(userId: string): Promise<EmergencyFund[]> {
    return await this.emergencyRepository.findUserFunds(userId);
  }

  async calculateSuggestedAmount(userId: string): Promise<number> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('المستخدم غير موجود');
    if (!user.monthlyIncome || user.monthlyIncome <= 0) {
      throw new Error('دخل المستخدم الشهري غير صالح');
    }
    return Number((user.monthlyIncome * 0.7).toFixed(2));
  }

  async getTotalEmergencyFund(userId: string): Promise<number> {
    const funds = await this.getUserFunds(userId);
    return funds.reduce((total: number, fund: EmergencyFund) => total + fund.amount, 0);
  }

  async calculateCurrentBalance(userId: string): Promise<number> {
    const funds = await this.getUserFunds(userId);
    return funds.reduce((total, tx) => total + Number(tx.amount), 0);
  }
}

