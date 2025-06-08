import { Habit } from '../entities/Habit.entity';
import { HabitRepository } from '../repositories/habit.repository';
import { UserRepository } from '../repositories/user.repository';

export class HabitService {
    private habitRepository = new HabitRepository();
    private userRepository = new UserRepository();

    async createHabit(userId: string, habitData: Partial<Habit>): Promise<Habit> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('المستخدم غير موجود');
        }

        try {
            return await this.habitRepository.create({
                ...habitData,
                user,
                completed: false,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error creating habit:', error);
            throw new Error('حدث خطأ أثناء حفظ العادة');
        }
    }

    async getUserHabits(userId: string): Promise<Habit[]> {
        try {
            return await this.habitRepository.findByUserId(userId);
        } catch (error) {
            console.error('Error fetching habits:', error);
            throw new Error('حدث خطأ أثناء استرجاع العادات');
        }
    }

    async markHabitComplete(habitId: string, userId: string): Promise<Habit> {
        try {
            const habit = await this.habitRepository.findOne({
                where: { id: habitId, user: { id: userId } }
            });

            if (!habit) {
                throw new Error('العادة غير موجودة');
            }

            if (habit.completed) {
                throw new Error('العادة مكتملة بالفعل');
            }

            return await this.habitRepository.markComplete(habitId);
        } catch (error) {
            console.error('Error completing habit:', error);
            throw error instanceof Error ? error : new Error('حدث خطأ أثناء تحديث العادة');
        }
    }

    async resetDailyHabits(userId: string): Promise<void> {
        try {
            await this.habitRepository.resetDailyHabits(userId);
        } catch (error) {
            console.error('Error resetting habits:', error);
            throw new Error('حدث خطأ أثناء إعادة تعيين العادات اليومية');
        }
    }

    async deleteHabit(habitId: string, userId: string): Promise<void> {
        try {
            const habit = await this.habitRepository.findOne({
                where: { id: habitId, user: { id: userId } }
            });

            if (!habit) {
                throw new Error('العادة غير موجودة');
            }

            await this.habitRepository.delete(habitId);
        } catch (error) {
            console.error('Error deleting habit:', error);
            throw new Error('حدث خطأ أثناء حذف العادة');
        }
    }
}