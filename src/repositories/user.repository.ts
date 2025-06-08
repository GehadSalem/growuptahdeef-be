
import { AppDataSource } from '../dbConfig/data-source';
import { User } from '../entities/User.entity';
import { Repository } from 'typeorm';


export class UserRepository {
    
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }
    async findOne() {
        throw new Error('Method not implemented.');
    }
    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({ where: { id } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        await this.repository.update(id, updateData);
        return this.findById(id) as Promise<User>;
    }

    async updateMonthlyIncome(id: string, income: number): Promise<User> {
        return this.update(id, { monthlyIncome: income });
    }

    async updateNotificationToken(id: string, token: string): Promise<User> {
        return this.update(id, { notificationToken: token });
    }
}