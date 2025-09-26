import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database";
import authRoutes from "./routes/auth";
import orderRoutes from "./routes/orders";
import serviceRoutes from "./routes/services";
import complaintRoutes from "./routes/complaints";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CORS_ORIGIN || "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "校园食堂代买餐系统 API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "校园食堂代买餐系统 API",
    version: "1.0.0",
  });
});

// API路由
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库连接
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`🌍 CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
