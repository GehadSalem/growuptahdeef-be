// src/controllers/referral.controller.ts
import { Request, Response } from 'express';
import { ReferralService } from '../services/referral.service';

const referralService = new ReferralService();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, referredBy } = req.body;
    const user = await referralService.registerUser(name, email, password, referredBy);
    res.status(201).json({ message: 'User registered successfully', referralCode: user.referralCode });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const getReferrals = async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.params;
    const referrals = await referralService.getReferrals(referralCode);
    res.status(200).json(referrals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve referrals' });
  }
};
