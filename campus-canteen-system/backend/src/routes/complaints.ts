import { Router } from "express";
import { ComplaintController } from "../controllers/ComplaintController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const complaintController = new ComplaintController();

// 所有投诉相关路由都需要认证
router.use(authenticateToken);

// 投诉管理
router.post("/", complaintController.createComplaint);
router.get("/", complaintController.getComplaints);
router.get("/categories", complaintController.getComplaintCategories);
router.get("/stats", complaintController.getComplaintStats);
router.get("/user/filed", complaintController.getUserComplaints);
router.get("/user/received", complaintController.getUserReceivedComplaints);
router.get("/:id", complaintController.getComplaintById);

// 管理员处理投诉
router.put("/:id/process", complaintController.processComplaint);

export default router;
