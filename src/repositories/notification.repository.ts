import { AppDataSource } from '../dbConfig/data-source';
import { Notification } from '../entities/Notification.entity';

export const NotificationRepository = AppDataSource.getRepository(Notification);
