import type { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { ApplicationStatus, RegistrationApplication } from "../entities/RegistrationApplication";
import { AdminService, type UserQueryParams } from "../services/AdminService";
import { AuthService } from "../services/AuthService";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // 获取用户列表
  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const { page, limit, is_admin, is_frozen, search } = req.query;

      const params: UserQueryParams = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        is_admin: is_admin === "true" ? true : is_admin === "false" ? false : undefined,
        is_frozen: is_frozen === "true" ? true : is_frozen === "false" ? false : undefined,
        search: search as string,
      };

      const result = await this.adminService.getUsers(req.user.userId, params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取用户列表失败",
      });
    }
  };

  // 获取用户详情
  getUserDetail = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "无效的用户ID",
        });
        return;
      }

      const user = await this.adminService.getUserDetail(req.user.userId, userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "获取用户详情失败",
      });
    }
  };

  // 冻结/解冻用户
  toggleUserFreeze = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "无效的用户ID",
        });
        return;
      }

      const updatedUser = await this.adminService.toggleUserFreeze(req.user.userId, userId);

      res.json({
        success: true,
        message: updatedUser.is_frozen ? "用户已冻结" : "用户已解冻",
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          is_frozen: updatedUser.is_frozen,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "操作失败",
      });
    }
  };

  // 删除用户
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "无效的用户ID",
        });
        return;
      }

      await this.adminService.deleteUser(req.user.userId, userId);

      res.json({
        success: true,
        message: "用户已删除",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "删除用户失败",
      });
    }
  };

  // 设置/取消管理员权限
  toggleUserAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "无效的用户ID",
        });
        return;
      }

      const updatedUser = await this.adminService.toggleUserAdmin(req.user.userId, userId);

      res.json({
        success: true,
        message: updatedUser.is_admin ? "已设置为管理员" : "已取消管理员权限",
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          is_admin: updatedUser.is_admin,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "操作失败",
      });
    }
  };

  // 获取仪表板统计数据
  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const stats = await this.adminService.getDashboardStats(req.user.userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取统计数据失败",
      });
    }
  };

  // 获取系统活动日志
  getSystemLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const { page, limit } = req.query;

      const params = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await this.adminService.getSystemLogs(req.user.userId, params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取系统日志失败",
      });
    }
  };

  // 获取注册申请列表
  getRegistrationApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const { page, limit, status, search } = req.query;
      const applicationRepository = AppDataSource.getRepository(RegistrationApplication);

      const queryBuilder = applicationRepository
        .createQueryBuilder("application")
        .leftJoinAndSelect("application.reviewer", "reviewer");

      // 状态过滤
      if (status) {
        queryBuilder.andWhere("application.status = :status", { status });
      }

      // 搜索过滤
      if (search) {
        queryBuilder.andWhere(
          "(application.username LIKE :search OR application.name LIKE :search OR application.student_card_id LIKE :search)",
          { search: `%${search}%` }
        );
      }

      // 分页
      const pageNum = page ? parseInt(page as string) : 1;
      const limitNum = limit ? parseInt(limit as string) : 10;
      const offset = (pageNum - 1) * limitNum;

      queryBuilder.orderBy("application.created_at", "DESC").skip(offset).take(limitNum);

      const [applications, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          applications,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取注册申请失败",
      });
    }
  };

  // 审核注册申请
  reviewRegistrationApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const { id } = req.params;
      const { action, comment } = req.body;
      const applicationId = parseInt(id);

      if (isNaN(applicationId)) {
        res.status(400).json({
          success: false,
          message: "无效的申请ID",
        });
        return;
      }

      if (!action || !["approve", "reject"].includes(action)) {
        res.status(400).json({
          success: false,
          message: "无效的审核操作",
        });
        return;
      }

      const applicationRepository = AppDataSource.getRepository(RegistrationApplication);
      const application = await applicationRepository.findOne({
        where: { id: applicationId },
      });

      if (!application) {
        res.status(404).json({
          success: false,
          message: "注册申请不存在",
        });
        return;
      }

      if (application.status !== ApplicationStatus.PENDING) {
        res.status(400).json({
          success: false,
          message: "该申请已被审核",
        });
        return;
      }

      // 更新申请状态
      application.status =
        action === "approve" ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;
      application.reviewed_at = new Date();
      application.reviewer_id = req.user.userId;
      application.review_comment = comment;

      await applicationRepository.save(application);

      // 如果审核通过，创建用户账户
      if (action === "approve") {
        const authService = new AuthService();
        try {
          await authService.register({
            username: application.username,
            password: application.password, // 已经是加密的密码
            student_card_id: application.student_card_id,
            name: application.name,
            grade: application.grade,
            institute: application.institute,
            contact_way: application.contact_way,
            email: application.email,
            gender: application.gender,
            is_admin: false,
          });
        } catch (error) {
          // 如果创建用户失败，回滚申请状态
          application.status = ApplicationStatus.PENDING;
          application.reviewed_at = undefined;
          application.reviewer_id = undefined;
          application.review_comment = undefined;
          await applicationRepository.save(application);

          res.status(500).json({
            success: false,
            message: "创建用户账户失败，请重试",
          });
          return;
        }
      }

      res.json({
        success: true,
        message: action === "approve" ? "审核通过，用户账户已创建" : "审核拒绝",
        data: application,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "审核失败",
      });
    }
  };
}
