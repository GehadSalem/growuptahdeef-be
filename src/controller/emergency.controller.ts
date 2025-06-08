import { Request, Response } from 'express';
import '../types/express';
import { EmergencyService } from '../services/emergency.service';

class EmergencyController {
    private static emergencyService = new EmergencyService();

    static addToEmergencyFund = async (request: Request, response: Response): Promise<void> => {
        try {
            const amount = Number(request.body.amount);
            if (isNaN(amount)) {
                response.status(400).json({ message: 'Amount must be a valid number' });
                return;
            }

            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const emergencyFund = await this.emergencyService.addToFund(
                request.user?.id,
                amount,
                request.body.description
            );
            response.status(201).json(emergencyFund);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(400).json({ message: errorMessage });
        }
    };

    static getEmergencyFunds = async (request: Request, response: Response): Promise<void> => {
        try {
            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const funds = await this.emergencyService.getUserFunds(request.user?.id);
            response.json(funds);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(500).json({ message: errorMessage });
        }
    };

    static calculateEmergencyFund = async (request: Request, response: Response): Promise<void> => {
        try {
            if (!request.user) {
                response.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const suggestedAmount = await this.emergencyService.calculateSuggestedAmount(
                request.user?.id
            );
            response.json({ suggestedAmount });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            response.status(400).json({ message: errorMessage });
        }
    };
}

export default EmergencyController;