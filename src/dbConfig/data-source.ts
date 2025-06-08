import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import path from "path";
import { User } from "../entities/User.entity";
import { Habit } from "../entities/Habit.entity";
import { SavingsGoal } from "../entities/SavingsGoal.entity";
import { MajorGoal } from "../entities/MajorGoal.entity";
import { Notification } from "../entities/Notification.entity";
import { InstallmentPayment } from "../entities/Installment.entity";
import { Income } from "../entities/Income.entity";
import { Expense } from "../entities/Expense.entity";
import { EmergencyFund } from "../entities/EmergencyFund.entity";
import { CustomInstallmentPlan } from "../entities/CustomInstallmentPlan.entity";
import { DailyTask } from "../entities/DailyTask.entity";

// Entity imports


dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "growup_db",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
  
  // Both ways of defining entities work - choose one:
  // Option 1: Direct reference to entity classes
  entities: [
    User,
    Habit,
    SavingsGoal,
    MajorGoal,
    Notification,
    InstallmentPayment,
    Income,
    Expense,
    EmergencyFund,
    CustomInstallmentPlan,
    DailyTask
  ],
  
  // Option 2: File path pattern (comment out the above and uncomment below if preferred)
  // entities: [path.join(__dirname, "entities/*.entity.{js,ts}")],
  
  migrations: [path.join(__dirname, "migrations/*.{js,ts}")],
  subscribers: [],
  
  // SSL configuration (for production)
  ssl: process.env.DB_SSL === "true" ? {
    rejectUnauthorized: false
  } : false,
  
  // Extra connection options
  extra: {
    connectionLimit: 10,
    connectTimeout: 30000
  },
  
  // Debugging
  logger: "advanced-console",
  maxQueryExecutionTime: 1000
});

// Optional: Add connection test function
export async function testConnection() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully!");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}