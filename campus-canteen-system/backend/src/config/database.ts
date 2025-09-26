import { DataSource } from "typeorm";
import { Complaint } from "../entities/Complaint";
import { News } from "../entities/News";
import { Order } from "../entities/Order";
import { RegistrationApplication } from "../entities/RegistrationApplication";
import { Service } from "../entities/Service";
import { StudentProfile } from "../entities/StudentProfile";
import { User } from "../entities/User";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "campus_canteen_system",
  charset: "utf8mb4",
  synchronize: false, // 表已手动创建，关闭自动同步
  logging: process.env.NODE_ENV === "development",
  entities: [User, StudentProfile, Order, Service, Complaint, News, RegistrationApplication],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection established successfully");
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
    throw error;
  }
};
