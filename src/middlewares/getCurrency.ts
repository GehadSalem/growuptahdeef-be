import axios from "axios";
import '../types/express';
import { Request, Response, NextFunction } from 'express';


export const getCurrency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    req.userCurrency = response.data.currency || 'USD';
    next();
  } catch (err) {
    if (err instanceof Error) {
      console.error('Currency detection failed:', err.message);
    } else {
      console.error('Currency detection failed:', err);
    }
    req.userCurrency = 'USD';
    next();
  }
};