import { Request, Response } from "express";
import { FinancialPlanService } from "../services/financialPlan.service";

const service = new FinancialPlanService();

export const createOrUpdatePlan = async (req: Request, res: Response) => {
  const { monthlyIncome } = req.body;
  const userId = req.user!.id;

  const plan = await service.createOrUpdatePlan(userId, monthlyIncome);
  res.json(plan);
};

export const addExpense = async (req: Request, res: Response) => {
  const { amount, description } = req.body;
  const userId = req.user!.id;

  const result = await service.addExpense(userId, amount, description);
  res.json(result);
};

export const getPlan = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const plan = await service.getPlan(userId);
  res.json(plan);
};
