import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { JWTPayload } from "../services/AuthService";

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // 验证JWT token
  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未提供认证token",
        });
        return;
      }

      const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
      const payload = this.authService.verifyToken(token);

      // 检查用户是否被冻结
      if (payload.is_frozen) {
        res.status(403).json({
          success: false,
          message: "账户已被冻结，请联系管理员",
        });
        return;
      }

      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "无效的token",
      });
    }
  };

  // 验证管理员权限
  requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "未认证",
      });
      return;
    }

    if (!req.user.is_admin) {
      res.status(403).json({
        success: false,
        message: "需要管理员权限",
      });
      return;
    }

    next();
  };

  // 可选认证（不强制要求token）
  optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const payload = this.authService.verifyToken(token);

        if (!payload.is_frozen) {
          req.user = payload;
        }
      }

      next();
    } catch (error) {
      // 忽略token验证错误，继续处理请求
      next();
    }
  };

  // 验证用户是否有权限访问特定资源
  requireOwnershipOrAdmin = (userIdParam: string = "userId") => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const resourceUserId = parseInt(req.params[userIdParam]);

      // 管理员可以访问所有资源，或者用户只能访问自己的资源
      if (req.user.is_admin || req.user.userId === resourceUserId) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: "权限不足",
        });
      }
    };
  };
}

// 创建中间件实例
const authMiddleware = new AuthMiddleware();

export const authenticateToken = authMiddleware.authenticate;
export const requireAdmin = authMiddleware.requireAdmin;
export const optionalAuth = authMiddleware.optionalAuth;
export const requireOwnershipOrAdmin = authMiddleware.requireOwnershipOrAdmin;
