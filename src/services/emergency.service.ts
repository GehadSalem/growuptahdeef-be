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

    try {
      return await this.emergencyRepository.createFund({
        amount,
        type: EmergencyFundType.DEPOSIT,
        description,
        date: new Date(),
        user
      });
    } catch (error) {
      console.error('Error adding to emergency fund:', error);
      throw new Error('Failed to add to emergency fund');
    }
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
      user: { id: userId } as User
    });

    await this.fundRepository.save(withdrawal);

    return {
      withdrawal,
      newBalance: currentBalance - amount
    };
  }

  async getUserFunds(userId: string): Promise<EmergencyFund[]> {
    try {
      return await this.emergencyRepository.findUserFunds(userId);
    } catch (error) {
      console.error('Error fetching user funds:', error);
      throw new Error('Failed to get user funds');
    }
  }

  async calculateSuggestedAmount(userId: string): Promise<number> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    if (!user.monthlyIncome || user.monthlyIncome <= 0) {
      throw new Error('دخل المستخدم الشهري غير صالح');
    }

    return Number((user.monthlyIncome * 0.7).toFixed(2));
  }

  async getTotalEmergencyFund(userId: string): Promise<number> {
    try {
      const funds = await this.getUserFunds(userId);
      return funds.reduce((total: number, fund: EmergencyFund) => {
        return total + fund.amount;
      }, 0);
    } catch (error) {
      console.error('Error calculating total emergency fund:', error);
      throw new Error('حدث خطأ أثناء حساب إجمالي صندوق الطوارئ');
    }
  }

  async calculateCurrentBalance(userId: string): Promise<number> {
    const funds = await this.getUserFunds(userId);
    return funds.reduce((total, tx) => total + Number(tx.amount), 0);
  }
}
