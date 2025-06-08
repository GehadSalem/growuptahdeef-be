import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import '../types/express';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    // Skip auth for public routes (register/login)
    const publicRoutes = ['/api/auth/register', '/api/auth/login'];
    if (publicRoutes.includes(req.path)) {
        return next(); // Skip authentication
    }

    try {
        
        const { authorization } = req.headers;
        console.log('Authentication started');
        console.log('Received headers:', req.headers);
        console.log('Auth header:', { authorization });

        if (!authorization) {
            return res.status(400).json({ 
                message: 'Authorization header is required' 
            });
        }

        const [prefix, token] = authorization.split('__');
        
        if (!prefix || !token) {
            return res.status(400).json({ 
                message: 'Invalid authorization format.' 
            });
        }

        if (prefix !== process.env.TOKEN_PREFIX) {
            return res.status(400).json({ 
                message: 'Invalid token prefix' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as unknown as { id: string, iat: string };
        
        if (!decoded?.id) {
            return res.status(400).json({ 
                message: 'Invalid token payload' 
            });
        }

        const userRepository = new UserRepository();
        const user = await userRepository.findById(decoded?.id);
        
        if (!user) {
            return res.status(401).json({ 
                message: 'User not found' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ 
                message: 'Token expired, please login again' 
            });
        }
        
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ 
                message: 'Invalid authentication token' 
            });
        }

        console.error('Authentication error:', error);
        return res.status(500).json({ 
            message: 'Authentication failed' 
        });
    }
};