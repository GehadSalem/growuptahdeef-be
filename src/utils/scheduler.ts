import { DailyTask } from '../entities/DailyTask.entity';

/**
 * وظيفة لجدولة المهام اليومية
 * @param tasks قائمة بالمهام اليومية
 * @param notifyCallback دالة الاستدعاء للإشعارات
 */
export const createDailyTaskScheduler = (tasks: DailyTask[], notifyCallback: (task: DailyTask) => void) => {
  // جدولة كل مهمة بناءً على وقت التذكير
  tasks.forEach(task => {
    const now = new Date();
    const reminderTime = new Date(task.reminderTime);
    
    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        notifyCallback(task);
        
        // إذا كانت المهمة متكررة، نعيد جدولتها لليوم التالي
        if (task.isRecurring && task.frequency && task.frequency.interval === 'daily') {
          const nextDay = new Date(reminderTime);
          nextDay.setDate(nextDay.getDate() + 1);
          task.reminderTime = nextDay.toISOString();
          createDailyTaskScheduler([task], notifyCallback);
        }
      }, delay);
    }
  });
};