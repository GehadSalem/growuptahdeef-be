import { Request, Response } from 'express';
import '../types/express';
import { EmergencyService } from '../services/emergency.service';
import { EmergencyFundType } from '../entities/EmergencyFund.entity';

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

    const funds = await this.emergencyService.getUserFunds(request.user.id);

    const totalAmount = funds.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

response.json({
  transactions: funds,
  totalAmount,
});

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

    static withdrawFromEmergencyFund = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const amount = Number(req.body.amount);
    const description = req.body.description;

    if (isNaN(amount) || amount <= 0) {
      res.status(400).json({ message: 'المبلغ غير صالح' });
      return;
    }

    const result = await this.emergencyService.withdrawFromFund(
      req.user.id,
      amount,
      description
    );

    res.status(200).json({
      message: 'تم السحب بنجاح',
      ...result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};



}

export default EmergencyController;