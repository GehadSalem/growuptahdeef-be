
import { AppDataSource } from "../dbConfig/data-source";
import { Notification, NotificationStatus, NotificationType } from "../entities/Notification.entity";
import { User } from "../entities/User.entity";
import axios from "axios";

export class NotificationService {
  private notificationRepo = AppDataSource.getRepository(Notification);
  private userRepo = AppDataSource.getRepository(User);

  // إرسال إشعار عبر FCM
  async sendNotification(user: User, title: string, message: string) {
    if (!user.notificationToken) {
      console.warn("لا يوجد رمز إشعار للمستخدم");
      return;
    }

    try {
      await axios.post(
        "https://fcm.googleapis.com/fcm/send",
        {
          to: user.notificationToken,
          notification: {
            title,
            body: message,
            sound: "default",
          },
          priority: "high",
        },
        {
          headers: {
            Authorization: `key=${process.env.FCM_SERVER_KEY}`,
            "Content-Type": "application/json",
          }
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("فشل إرسال الإشعار:", message);
      throw new Error("فشل إرسال الإشعار");
    }
  }

  // إنشاء إشعار وحفظه بقاعدة البيانات (مع/بدون إرسال فعلي)
  async createNotification(
    userId: string,
    data: {
      title: string;
      message: string;
      type?: NotificationType;
      scheduledTime?: Date;
      relatedEntityId?: string;
      sendFCM?: boolean;
    }
  ) {
    const user = await this.userRepo.findOneByOrFail({ id: userId });

    const notification = this.notificationRepo.create({
      user,
      title: data.title,
      message: data.message,
      type: data.type || NotificationType.GENERAL,
      scheduledTime: data.scheduledTime || new Date(),
      status: NotificationStatus.SENT,
      isRead: false,
      relatedEntityId: data.relatedEntityId
    });

    await this.notificationRepo.save(notification);

    if (data.sendFCM !== false) {
      await this.sendNotification(user, data.title, data.message);
    }
  }

  // تحديث رمز الإشعارات للمستخدم
  async updateUserToken(userId: string, token: string) {
    await this.userRepo.update(userId, {
      notificationToken: token
    });
  }

  // تعليم إشعار كمقروء
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepo.findOneByOrFail({
      id: notificationId,
      user: { id: userId }
    });

    notification.isRead = true;
    notification.status = NotificationStatus.READ;
    await this.notificationRepo.save(notification);
  }

  // إرسال تذكير لعادات مثلاً
  async sendReminder(user: User, habitName: string) {
    await this.sendNotification(user, 'تذكير', `لا تنسَ تنفيذ عادة "${habitName}" اليوم!`);
  }
}
