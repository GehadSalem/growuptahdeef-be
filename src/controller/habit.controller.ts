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
            const habit = await this.habitService.createHabit(
                request.user.id,
                request.body
            );
            response.status(201).json(habit);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(400).json({ message: errorMessage });
        }
    };

    static getHabits = async (request: Request, response: Response): Promise<void> => {
        try {
            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const habits = await this.habitService.getUserHabits(request.user.id);
            response.json(habits);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(500).json({ message: errorMessage });
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
    
            await this.notificationService.sendNotification(
                request.user as User,
                "أحسنت!",
                `لقد أكملت عادة ${habit.name} بنجاح!`
            );
    
            response.json(habit);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(400).json({ message: errorMessage });
        }
    };
}

export default HabitController;