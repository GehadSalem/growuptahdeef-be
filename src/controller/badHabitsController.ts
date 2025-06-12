import { Request, Response } from 'express';
import BadHabit from '../models/badHabit';

export const listBadHabits = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user.id !== 'number') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found or invalid user id'
      });
    }
    const habits = await BadHabit.find(req.user.id);
    res.json({
      success: true,
      data: habits
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Other controller methods would be similarly updated...
// Just change the Mongoose calls to MySQL calls