// src/services/referral.service.ts
import { UserService } from './users.service';

export class ReferralService {
  private userService = new UserService();

  generateReferralCode(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async registerUser(name: string, email: string, password: string, referredByCode?: string) {
    const referralCode = this.generateReferralCode();
    const referredByUser = referredByCode ? await this.userService.findByReferralCode(referredByCode) : null;

    const newUser = await this.userService.createUser({
      name,
      email,
      password,
      referralCode,
      referredBy: referredByUser ? referredByUser.referralCode : undefined,
    });

    return newUser;
  }

  async getReferrals(referralCode: string) {
    return await this.userService.findReferrals(referralCode);
  }
}
