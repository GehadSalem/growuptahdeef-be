import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { User } from '../entities/User.entity';
import '../types/express';
import { HabitService } from '../services/habit.service';

class HabitController {
    private static habitService = new HabitService();
    private static notificationService = new NotificationService();

    static addHabit = async (request: Request, response: Response): Promise<void> => {
        try {
            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const { name, category, frequency } = request.body;
            
            const habit = await this.habitService.createHabit(
                request.user.id,
                { 
                    name, 
                    category,
                    frequency: {
                        type: frequency?.type || 'daily',
                        time: frequency?.time,
                        days: frequency?.days,
                        dayOfMonth: frequency?.dayOfMonth
                    }
                }
            );

            response.status(201).json(habit);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(400).json({ 
                message: 'Failed to create habit',
                details: errorMessage 
            });
        }
    };

    static getHabits = async (request: Request, response: Response): Promise<void> => {
    try {
        if (!request.user) {
            response.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const frequencyType = request.query.frequencyType as string;
        
        // التحقق من أن القيمة صالحة إذا وجدت
        if (frequencyType && !['daily', 'weekly', 'monthly'].includes(frequencyType)) {
            response.status(400).json({ message: 'Invalid frequency type' });
            return;
        }

        const habits = frequencyType 
            ? await this.habitService.getHabitsByFrequency(
                request.user.id, 
                frequencyType as 'daily' | 'weekly' | 'monthly'
              )
            : await this.habitService.getUserHabits(request.user.id);

        response.json(habits);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        response.status(500).json({ 
            message: 'Failed to fetch habits',
            details: errorMessage 
        });
    }
};

    static updateHabit = async (request: Request, response: Response): Promise<void> => {
        try {
            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const habitId = request.params.id;
            const { title, category, frequency } = request.body;

            if (!habitId) {
                response.status(400).json({ message: 'Invalid habit ID' });
                return;
            }

            const updatedHabit = await this.habitService.updateHabit(
                habitId,
                request.user.id,
                { 
                    title,
                    category,
                    frequency: frequency && {
                        type: frequency.type,
                        time: frequency.time,
                        days: frequency.days,
                        dayOfMonth: frequency.dayOfMonth
                    }
                }
            );

            response.json(updatedHabit);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(400).json({ 
                message: 'Failed to update habit',
                details: errorMessage 
            });
        }
    };

    
    static markHabitComplete = async (request: Request, response: Response): Promise<void> => {
    try {
        if (!request.user) {
            response.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const habitId = request.params.id;
        if (!habitId) {
            response.status(400).json({ message: 'Invalid habit ID' });
            return;
        }

        const habit = await this.habitService.markHabitComplete(habitId, request.user.id);

        // رسالة مختلفة حسب الحالة الجديدة
        const message = habit.completed 
            ? `لقد أكملت "${habit.name}" بنجاح!`
            : `لقد ألغيت إكمال "${habit.name}"`;

        await this.notificationService.sendNotification(
            request.user as User,
            habit.completed ? "أحسنت!" : "تم الإلغاء",
            message
        );

        response.json({
            success: true,
            data: habit,
            message
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        response.status(400).json({ 
            success: false,
            message: 'Failed to toggle habit completion',
            details: errorMessage 
        });
    }
};

    static deleteHabit = async (request: Request, response: Response): Promise<void> => {
        try {
            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const habitId = request.params.id;

            if (!habitId) {
                response.status(400).json({ message: 'Invalid habit ID' });
                return;
            }

            await this.habitService.deleteHabit(habitId, request.user.id);
            response.status(204).send();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(400).json({ 
                message: 'Failed to delete habit',
                details: errorMessage 
            });
        }
    };

    // New endpoint for resetting habits by frequency
    static resetHabitsByFrequency = async (request: Request, response: Response): Promise<void> => {
    try {
        if (!request.user) {
            response.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { frequencyType } = request.body;
        
        // التحقق من أن القيمة صالحة
        if (!frequencyType || !['daily', 'weekly', 'monthly'].includes(frequencyType)) {
            response.status(400).json({ message: 'Invalid frequency type' });
            return;
        }

        await this.habitService.resetHabitsByFrequency(
            request.user.id, 
            frequencyType as 'daily' | 'weekly' | 'monthly' // تأكيد النوع هنا
        );

        response.status(200).json({ 
            message: `Successfully reset ${frequencyType} habits` 
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        response.status(400).json({ 
            message: 'Failed to reset habits',
            details: errorMessage 
        });
    }
};
}

export default HabitController;