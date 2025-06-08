import { Request, Response } from 'express';
import { User } from '../entities/User.entity';
import '../types/express';
import { NotificationService } from '../services/notification.service';

class NotificationController {
  private static notificationService = new NotificationService();

  static updateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ message: "Token is required" });
        return;
      }

      const user = req.user as User;
      await this.notificationService.updateUserToken(user.id, token);

      res.json({ message: "تم تحديث رمز الإشعارات بنجاح" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ message });
    }
  };

  static testNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.notificationService.sendNotification(
        req.user as User,
        "اختبار إشعار",
        "هذا إشعار تجريبي من التطبيق"
      );
      res.json({ message: "تم إرسال الإشعار التجريبي" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ message });
    }
  };

  static markNotificationRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { notificationId } = req.body;
      const user = req.user as User;
      if (!notificationId) {
        res.status(400).json({ message: "Notification ID is required" });
        return;
      }

      await this.notificationService.markAsRead(user.id, notificationId);
      res.json({ message: "تم تعليم الإشعار كمقروء" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ message });
    }
  };
}

export default NotificationController;
