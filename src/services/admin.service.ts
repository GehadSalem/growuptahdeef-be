import { AppDataSource } from "../../src/dbConfig/data-source"; 
import { User, UserRole } from "../entities/User.entity";
import { Referral } from "../entities/Referral";
import { Payment } from "../entities/Payment.entity";

export const getAllUsers = async () => {
  const userRepo = AppDataSource.getRepository(User);
  return await userRepo.find({
    select: ["id", "name", "email", "role", "createdAt"],
  });
};

export const deleteUser = async (id: string) => {
  const userRepo = AppDataSource.getRepository(User);
  return await userRepo.delete(id);
};

export const updateUserRole = async (id: string, role: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error("User not found");

  user.role = role as UserRole;
  return await userRepo.save(user);
};

export const getStats = async () => {
  const userRepo = AppDataSource.getRepository(User);
  const referralRepo = AppDataSource.getRepository(Referral);
  const paymentRepo = AppDataSource.getRepository(Payment);

  const totalUsers = await userRepo.count();
  const totalSubscribers = await userRepo.count({ where: { subscribed: true } });
  const totalReferrals = await referralRepo.count();

  const totalEarningsResult = await paymentRepo
    .createQueryBuilder("payment")
    .select("SUM(payment.amount)", "sum")
    .getRawOne();

  const totalEarnings = parseFloat(totalEarningsResult.sum) || 0;

  return {
    totalUsers,
    totalSubscribers,
    totalReferrals,
    totalEarnings,
  };
};
