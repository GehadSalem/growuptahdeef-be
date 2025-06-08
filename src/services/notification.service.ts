import axios from 'axios';
import { User } from '../entities/User.entity';

export class NotificationService {
    markAsRead: any;
    updateUserToken: any;
    async sendNotification(user: User, title: string, message: string) {
        if (!user.notificationToken) {
            console.warn('لا يوجد رمز إشعار للمستخدم');
            return;
        }

        try {
            await axios.post('https://fcm.googleapis.com/fcm/send', {
                to: user.notificationToken,
                notification: { 
                    title, 
                    body: message,
                    sound: 'default'
                },
                priority: 'high'
            }, {
                headers: {
                    'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('فشل إرسال الإشعار:', error.message);
            } else {
                console.error('فشل إرسال الإشعار:', error);
            }
            throw new Error('فشل إرسال الإشعار');
        }
    }

    async sendReminder(user: User, habitName: string) {
        await this.sendNotification(
            user,
            'تذكير',
            `لا تنسى تنفيذ عادة ${habitName} اليوم!`
        );
    }
}