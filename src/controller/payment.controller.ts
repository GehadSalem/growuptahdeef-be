// src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../dbConfig/data-source';
import { Payment } from '../entities/Payment.entity';
import { User } from '../entities/User.entity';

export const getAllPayments = async (_: Request, res: Response) => {
  const paymentRepo = AppDataSource.getRepository(Payment);
  const payments = await paymentRepo.find({ relations: ['user'] });
  res.json(payments);
};

export const getPaymentById = async (req: Request, res: Response) => {
  const paymentRepo = AppDataSource.getRepository(Payment);
  const payment = await paymentRepo.findOne({
    where: { id: parseInt(req.params.id) },
    relations: ['user'],
  });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
};

export const createPayment = async (req: Request, res: Response) => {
  const { userId, amount, currency, status } = req.body;
  const paymentRepo = AppDataSource.getRepository(Payment);
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const payment = paymentRepo.create({ user, amount, currency, status });
  await paymentRepo.save(payment);
  res.status(201).json(payment);
};
