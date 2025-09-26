import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();
const orderController = new OrderController();

// 公开路由（需要认证）
router.get("/", authenticateToken, orderController.getOrders);
router.get("/search", authenticateToken, orderController.searchOrders);
router.get("/my", authenticateToken, orderController.getUserOrders);
router.get("/my/stats", authenticateToken, orderController.getUserOrderStats);
router.get("/:id", authenticateToken, orderController.getOrderById);
router.get("/:id/history", authenticateToken, orderController.getOrderStatusHistory);

// 订单操作路由（需要认证）
router.post("/", authenticateToken, orderController.createOrder);
router.put("/:id", authenticateToken, orderController.updateOrder);
router.post("/:id/accept", authenticateToken, orderController.acceptOrder);
router.post("/:id/complete", authenticateToken, orderController.completeOrder);
router.post("/:id/cancel", authenticateToken, orderController.cancelOrder);

// 管理员路由
router.get("/admin/stats", authenticateToken, requireAdmin, orderController.getSystemOrderStats);

export default router;
