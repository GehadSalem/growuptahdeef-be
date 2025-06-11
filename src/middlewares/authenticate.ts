import tokenBlacklist from '../utils/tokenBlacklist';

// استخراج token من الهيدر Authorization
import { Request, Response, NextFunction } from 'express';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token && tokenBlacklist.has(token)) {
        return res.status(401).json({ message: 'Token has been invalidated' });
    }

    next();
};

export default authenticate;
