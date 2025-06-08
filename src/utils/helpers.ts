import { DailyTask } from '../entities/DailyTask.entity';

/**
 * @param tasks قائمة بالمهام
 * @returns المهام التي يجب جدولتها اليوم
 */
export const getTodaysTasks = (tasks: DailyTask[]): DailyTask[] => {
  const today = new Date().getDay(); 
  const currentDate = new Date().getDate();
  
  return tasks.filter(task => {
    if (!task.isRecurring) return true;
    
    // التحقق من وجود frequency قبل استخدامها
    if (!task.frequency) return false;
    
    switch (task.frequency.interval) {
      case 'daily':
        return true;
      case 'weekly':
        return task.frequency.daysOfWeek?.includes(today) ?? false;
      case 'monthly':
        return task.frequency.dayOfMonth === currentDate;
      default:
        return false;
    }
  });
};