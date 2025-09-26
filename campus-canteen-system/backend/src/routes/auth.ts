import { Router } from "express";
import * as multer from "multer";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const authController = new AuthController();

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("只允许上传图片文件"));
    }
  },
});

// 公开路由（不需要认证）
router.post("/register", authController.register);
router.post(
  "/register-application",
  upload.single("student_photo"),
  authController.submitRegistrationApplication
);
router.post("/login", authController.login);

// 需要认证的路由
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", authenticateToken, authController.updateProfile);
router.post("/change-password", authenticateToken, authController.changePassword);
router.post("/refresh-token", authenticateToken, authController.refreshToken);
router.post("/logout", authenticateToken, authController.logout);
router.delete("/deactivate", authenticateToken, authController.deactivateAccount);

export default router;
