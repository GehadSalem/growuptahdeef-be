import { AppDataSource } from '../dbConfig/data-source';
import { User } from '../entities/User.entity';
import { SavingsGoal } from '../entities/SavingsGoal.entity';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    // ✅ مستخدمة في كل مكان
    private generateToken(userId: string): string {
        return jwt.sign(
            { id: userId },
            process.env.JWT_SECRET || "your-strong-secret",
            { expiresIn: "30d" }
        );
    }

    private generateReferralCode(length = 6): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    // ✅ الوظائف الجديدة للوحة التحكم
    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async updateUserStatus(id: string, isActive: boolean): Promise<void> {
        await this.userRepository.update(id, { isActive });
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['savingsGoals']
            });
            return user;
        } catch (error) {
            throw new Error('Failed to fetch user');
        }
    }

    // ✅ تسجيل مستخدم جديد
    async register(userData: {
        email: string;
        password: string;
        name: string;
        monthlyIncome: number;
        referredBy?: string;
    }): Promise<{ user: User; token: string }> {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { email: userData.email }
            });
            if (existingUser) throw new Error('البريد الإلكتروني مسجل بالفعل');

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const emergencyFundTarget = userData.monthlyIncome * 0.7;
            const referralCode = this.generateReferralCode();

            const newUser = this.userRepository.create({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                monthlyIncome: userData.monthlyIncome,
                referralCode,
                referredBy: userData.referredBy || undefined,
                savingsGoals: [{
                    goalName: "صندوق الطوارئ",
                    targetAmount: emergencyFundTarget,
                    currentAmount: 0,
                    isEmergencyFund: true,
                    status: "active"
                } as unknown as SavingsGoal]
            });

            await this.userRepository.save(newUser);
            const token = this.generateToken(newUser.id);
            return { user: newUser, token };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Registration failed');
        }
    }

    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        try {
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) throw new Error('المستخدم غير موجود');

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) throw new Error('كلمة المرور غير صحيحة');

            const token = this.generateToken(user.id);
            return { user, token };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Login failed');
        }
    }

    async updateMonthlyIncome(userId: string, newIncome: number): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['savingsGoals']
            });
            if (!user) throw new Error('المستخدم غير موجود');

            const emergencyFund = user.savingsGoals.find(g => g.isEmergencyFund);
            if (emergencyFund) {
                emergencyFund.targetAmount = newIncome * 0.7;
                await AppDataSource.getRepository(SavingsGoal).save(emergencyFund);
            }

            user.monthlyIncome = newIncome;
            return await this.userRepository.save(user);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to update income');
        }
    }

    async getFinancialOverview(userId: string): Promise<{
        monthlyIncome: number;
        emergencyFund: {
            target: number;
            saved: number;
            progress: number;
        };
        activeGoals: number;
    }> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['savingsGoals']
            });
            if (!user) throw new Error('المستخدم غير موجود');

            const emergencyFund = user.savingsGoals.find(g => g.isEmergencyFund);

            return {
                monthlyIncome: user.monthlyIncome,
                emergencyFund: {
                    target: emergencyFund?.targetAmount || 0,
                    saved: emergencyFund?.currentAmount || 0,
                    progress: emergencyFund ?
                        (emergencyFund.currentAmount / emergencyFund.targetAmount) * 100 : 0
                },
                activeGoals: user.savingsGoals.filter(g => !g.isEmergencyFund && g.status === 'active').length
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to get financial overview');
        }
    }

    // ✅ placeholder - لاحقًا لتحديد العادات الافتراضية للمستخدم
    async setupDefaultHabits(userId: string): Promise<void> {
        // ممكن تفعيلها لاحقًا
        return;
    }

    async createUser(data: Partial<User>): Promise<User> {
        const user = this.userRepository.create(data);
        return await this.userRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async findByReferralCode(code: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { referralCode: code } });
    }

    async findReferrals(referralCode: string): Promise<User[]> {
        return await this.userRepository.find({ where: { referredBy: referralCode } });
    }
}
