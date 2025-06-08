// src/types/express.d.ts
import { User } from '../entities/User.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userCurrency: string;
    }
  }
}