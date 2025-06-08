import { Request, Response } from "express";
import '../types/express';
import { UserService } from "../services/users.service";

class UserController {
    private static userService = new UserService();

    static register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user, token } = await this.userService.register(req.body);
            await this.userService.setupDefaultHabits(user.id);
            res.status(201).json({ user, token });
        } catch (error) {
            res.status(400).json({ 
                message: error instanceof Error ? error.message : 'Registration failed' 
            });
        }
    };

    static login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            const { user, token } = await this.userService.login(email, password);
            res.json({ user, token });
        } catch (error) {
            res.status(401).json({ 
                message: error instanceof Error ? error.message : 'Login failed' 
            });
        }
    };

    static updateIncome = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user?.id) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const user = await this.userService.updateMonthlyIncome(
                req.user.id, 
                req.body.monthlyIncome
            );
            res.json(user);
        } catch (error) {
            res.status(500).json({ 
                message: error instanceof Error ? error.message : 'Income update failed' 
            });
        }
    };

    static getFinancialOverview = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user?.id) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const overview = await this.userService.getFinancialOverview(req.user.id);
            res.json(overview);
        } catch (error) {
            res.status(500).json({ 
                message: error instanceof Error ? error.message : 'Failed to get financial overview' 
            });
        }
    };

    // Admin Endpoints
    static getAllUsers = async (_: Request, res: Response): Promise<void> => {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ 
                message: error instanceof Error ? error.message : 'Failed to get users' 
            });
        }
    };

    static getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.userService.getUserById(req.params.id);
            
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            
            res.json(user);
        } catch (error) {
            res.status(500).json({ 
                message: error instanceof Error ? error.message : 'Failed to get user' 
            });
        }
    };

    static updateUserStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.params.id || typeof req.body.isActive !== 'boolean') {
                res.status(400).json({ message: 'Invalid request parameters' });
                return;
            }

            await this.userService.updateUserStatus(
                req.params.id, 
                req.body.isActive
            );
            res.json({ message: 'User status updated successfully' });
        } catch (error) {
            res.status(500).json({ 
                message: error instanceof Error ? error.message : 'Failed to update user status' 
            });
        }
    };
}

export default UserController;