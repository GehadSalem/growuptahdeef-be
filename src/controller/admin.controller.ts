// src/controllers/admin.controller.ts
import { Request, Response } from "express";
import * as AdminService from "../services/admin.service";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await AdminService.getAllUsers();
  res.json(users);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  await AdminService.deleteUser(id);
  res.status(204).send();
};

export const updateUserRole = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { role } = req.body;
  const updatedUser = await AdminService.updateUserRole(id, role);
  res.json(updatedUser);
};

export const getDashboardStats = async (_req: Request, res: Response) => {
  const stats = await AdminService.getStats();
  res.json(stats);
};
