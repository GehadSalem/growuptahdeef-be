import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import tokenBlacklist from '../utils/tokenBlacklist';

class AuthController {
    private static authService = new AuthService();

    static register = async (request: Request, response: Response): Promise<void> => {
        try {
            const { user, token } = await this.authService.register(request.body);
            response.status(201).json({ user, token });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(400).json({ message: errorMessage });
        }
    };

    static login = async (request: Request, response: Response): Promise<void> => {
        try {
            const { user, token } = await this.authService.login(
                request.body.email, 
                request.body.password
            );
            response.json({ user, token });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(401).json({ message: errorMessage });
        }
    };

static logout = (req: Request, res: Response): void => {
    const { authorization } = req.headers;

    if (!authorization) {
        res.status(400).json({ message: 'No authorization header' });
        return;
    }

    const parts = authorization.split('__');
    const token = parts[1];

    if (!token) {
        res.status(400).json({ message: 'Invalid token format' });
        return;
    }
    //remove the token from headder
    tokenBlacklist.add(token);
    res.status(200).json({ message: 'Logout successful' });
};

    static googleAuth = async (request: Request, response: Response): Promise<void> => {
        try {
            const { idToken } = request.body;
            if (!idToken || typeof idToken !== 'string') {
                throw new Error('Valid ID token is required');
            }
            
            const { user, token } = await this.authService.verifyGoogleToken(idToken);
            response.json({ user, token });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
            response.status(401).json({ message: errorMessage });
        }
    };
}

export default AuthController;