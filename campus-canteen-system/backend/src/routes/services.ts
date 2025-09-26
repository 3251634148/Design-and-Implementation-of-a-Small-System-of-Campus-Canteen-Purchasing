import { Router } from "express";
import { ServiceController } from "../controllers/ServiceController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const serviceController = new ServiceController();

// 公开路由 - 具体路径要在参数路径之前
router.get("/", serviceController.getServices.bind(serviceController));
router.get("/categories", serviceController.getServiceCategories.bind(serviceController));
router.get("/:id", serviceController.getServiceById.bind(serviceController));

// 需要认证的路由
router.use(authenticateToken);

// 用户服务管理
router.post("/", serviceController.createService.bind(serviceController));
router.get("/user/my", serviceController.getUserServices.bind(serviceController));
router.get("/user/stats", serviceController.getServiceStats.bind(serviceController));
router.put("/:id", serviceController.updateService.bind(serviceController));
router.delete("/:id", serviceController.deleteService.bind(serviceController));

export default router;
