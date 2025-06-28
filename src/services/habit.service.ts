import { Habit } from "../entities/Habit.entity";
import { HabitRepository } from "../repositories/habit.repository";
import { UserRepository } from "../repositories/user.repository"; // افترض وجود دالة لإرسال التذكيرات
import { NotificationService } from "./notification.service";
export class HabitService {
  private habitRepository = new HabitRepository();
  private userRepository = new UserRepository();
  private notificationService = new NotificationService();

  async createHabit(userId: string, habitData: Partial<Habit>): Promise<Habit> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    try {
      const data = await this.habitRepository.create({
        ...habitData,
        user,
        completed: false,
        createdAt: new Date(),
      });
      this.notificationService.sendReminder(
        user,
        habitData.name || "عادة جديدة"
      ); // إرسال تذكير للمستخدم
      return data;
    } catch (error) {
      console.error("Error creating habit:", error);
      throw new Error("حدث خطأ أثناء حفظ العادة");
    }
  }

  async getUserHabits(userId: string): Promise<Habit[]> {
    try {
      return await this.habitRepository.findByUserId(userId);
    } catch (error) {
      console.error("Error fetching habits:", error);
      throw new Error("حدث خطأ أثناء استرجاع العادات");
    }
  }
  async getHabitsByFrequency(
    userId: string,
    frequencyType: "daily" | "weekly" | "monthly"
  ): Promise<Habit[]> {
    try {
      return await this.habitRepository.findByFrequencyType(
        userId,
        frequencyType
      );
    } catch (error) {
      console.error("Error fetching habits by frequency:", error);
      throw new Error("حدث خطأ أثناء استرجاع العادات حسب التكرار");
    }
  }

  async markHabitComplete(habitId: string, userId: string): Promise<Habit> {
    try {
      const habit = await this.habitRepository.findOne({
        where: { id: habitId, user: { id: userId } },
      });

      if (!habit) {
        throw new Error("العادة غير موجودة");
      }

      return await this.habitRepository.markComplete(habitId, !habit.completed);
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      throw error instanceof Error
        ? error
        : new Error("حدث خطأ أثناء تحديث العادة");
    }
  }

  async updateHabit(
    habitId: string,
    userId: string,
    updateData: {
      title?: string;
      name?: string;
      category?: string;
      frequency?: {
        type: "daily" | "weekly" | "monthly";
        time?: string;
        days?: number[];
        dayOfMonth?: number;
      };
    }
  ): Promise<Habit> {
    try {
      const habit = await this.habitRepository.findOne({
        where: { id: habitId, user: { id: userId } },
      });

      if (!habit) {
        throw new Error("العادة غير موجودة");
      }

      if (updateData.name) habit.name = updateData.name; // إذا كانت الواجهة ترسل name بدلاً من title
      if (updateData.category) habit.category = updateData.category;

      if (updateData.frequency) {
        habit.frequency = {
          type: updateData.frequency.type,
          time: updateData.frequency.time || habit.frequency?.time,
          days: updateData.frequency.days || habit.frequency?.days,
          dayOfMonth:
            updateData.frequency.dayOfMonth || habit.frequency?.dayOfMonth,
        };
      }

      return await this.habitRepository.save(habit);
    } catch (error) {
      console.error("Error updating habit:", error);
      throw new Error("حدث خطأ أثناء تحديث العادة");
    }
  }

  async resetDailyHabits(userId: string): Promise<void> {
    try {
      await this.habitRepository.resetDailyHabits(userId);
    } catch (error) {
      console.error("Error resetting habits:", error);
      throw new Error("حدث خطأ أثناء إعادة تعيين العادات اليومية");
    }
  }

  async deleteHabit(habitId: string, userId: string): Promise<void> {
    try {
      const habit = await this.habitRepository.findOne({
        where: { id: habitId, user: { id: userId } },
      });

      if (!habit) {
        throw new Error("العادة غير موجودة");
      }

      await this.habitRepository.delete(habitId);
    } catch (error) {
      console.error("Error deleting habit:", error);
      throw new Error("حدث خطأ أثناء حذف العادة");
    }
  }

  async resetHabitsByFrequency(
    userId: string,
    frequencyType: "daily" | "weekly" | "monthly" // تغيير هنا
  ): Promise<void> {
    try {
      await this.habitRepository.resetHabitsByFrequency(userId, frequencyType);
    } catch (error) {
      console.error("Error resetting habits by frequency:", error);
      throw new Error("حدث خطأ أثناء إعادة تعيين العادات حسب التكرار");
    }
  }
}
