import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const adminController = new AdminController();

// 所有管理员路由都需要认证
router.use(authenticateToken);

// 仪表板
router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/logs", adminController.getSystemLogs);

// 用户管理
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserDetail);
router.put("/users/:id/freeze", adminController.toggleUserFreeze);
router.put("/users/:id/admin", adminController.toggleUserAdmin);
router.delete("/users/:id", adminController.deleteUser);

// 注册申请管理
router.get("/registration-applications", adminController.getRegistrationApplications);
router.post("/registration-applications/:id/review", adminController.reviewRegistrationApplication);

export default router;
