import { Repository } from 'typeorm';
import { AppDataSource } from '../dbConfig/data-source';
import { User } from '../entities/User.entity';
import { SavingsGoal } from '../entities/SavingsGoal.entity';

export class SavingsGoalRepository {
    private repository: Repository<SavingsGoal>;

    constructor() {
        this.repository = AppDataSource.getRepository(SavingsGoal);
    }

    async create(user: User, goalData: Partial<SavingsGoal>): Promise<SavingsGoal> {
        const goal = this.repository.create({
            ...goalData,
            user
        });
        return this.repository.save(goal);
    }

    async findByUserId(userId: string): Promise<SavingsGoal[]> {
        return this.repository.find({ 
            where: { user: { id: userId } },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }

    async findById(id: string): Promise<SavingsGoal | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['user']
        });
    }

    async update(id: string, goalData: Partial<SavingsGoal>): Promise<SavingsGoal | null> {
        const goal = await this.repository.findOneBy({ id });
        if (!goal) return null;
        
        Object.assign(goal, goalData);
        return this.repository.save(goal);
    }

    async addToGoal(id: string, amount: number): Promise<SavingsGoal | null> {
    const goal = await this.repository.findOneBy({ id });
    if (!goal) return null;

    // Ensure both values are treated as numbers
    const current = typeof goal.currentAmount === 'string' 
        ? parseFloat(goal.currentAmount) 
        : goal.currentAmount;
    
    const amountToAdd = typeof amount === 'string' 
        ? parseFloat(amount) 
        : amount;

    // Perform the addition with proper decimal handling
    const newAmount = current + amountToAdd;
    goal.currentAmount = parseFloat(newAmount.toFixed(2));
    
    // Update status if target is reached
    if (goal.currentAmount >= goal.targetAmount) {
        goal.status = 'completed';
    }
    
    return this.repository.save(goal);
}

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async getCompletedGoals(userId: string): Promise<SavingsGoal[]> {
        return this.repository.find({
            where: { 
                user: { id: userId },
                status: 'completed'
            },
            order: { targetDate: 'ASC' }
        });
    }
}