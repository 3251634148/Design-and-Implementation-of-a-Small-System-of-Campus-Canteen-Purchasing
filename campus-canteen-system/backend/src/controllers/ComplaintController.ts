import { Request, Response } from "express";
import {
  ComplaintService,
  CreateComplaintData,
  ProcessComplaintData,
  ComplaintQueryParams,
} from "../services/ComplaintService";
import { ComplaintStatus } from "../entities/Complaint";

export class ComplaintController {
  private complaintService: ComplaintService;

  constructor() {
    this.complaintService = new ComplaintService();
  }

  // 提交投诉
  createComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { complained_id, order_id, category, reason }: CreateComplaintData = req.body;

      // 基本验证
      if (!complained_id || !category || !reason) {
        res.status(400).json({
          success: false,
          message: "被投诉人、投诉分类和投诉原因为必填项",
        });
        return;
      }

      const complaintData: CreateComplaintData = {
        complained_id,
        order_id,
        category,
        reason,
      };

      const complaint = await this.complaintService.createComplaint(req.user.userId, complaintData);

      res.status(201).json({
        success: true,
        message: "投诉提交成功",
        data: complaint,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "投诉提交失败",
      });
    }
  };

  // 获取投诉列表
  getComplaints = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { page, limit, status, category, complainant_id, complained_id, order_id, search } =
        req.query;

      const params: ComplaintQueryParams = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as ComplaintStatus,
        category: category as string,
        complainant_id: complainant_id ? parseInt(complainant_id as string) : undefined,
        complained_id: complained_id ? parseInt(complained_id as string) : undefined,
        order_id: order_id ? parseInt(order_id as string) : undefined,
        search: search as string,
      };

      // 如果不是管理员，只能查看与自己相关的投诉
      if (!req.user.isAdmin) {
        // 如果没有指定查询条件，默认查看自己发起的投诉
        if (!params.complainant_id && !params.complained_id) {
          params.complainant_id = req.user.userId;
        } else {
          // 确保只能查看与自己相关的投诉
          if (params.complainant_id && params.complainant_id !== req.user.userId) {
            res.status(403).json({
              success: false,
              message: "无权限查看其他用户的投诉",
            });
            return;
          }
          if (params.complained_id && params.complained_id !== req.user.userId) {
            res.status(403).json({
              success: false,
              message: "无权限查看其他用户的投诉",
            });
            return;
          }
        }
      }

      const result = await this.complaintService.getComplaints(params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取投诉列表失败",
      });
    }
  };

  // 获取投诉详情
  getComplaintById = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { id } = req.params;
      const complaintId = parseInt(id);

      if (isNaN(complaintId)) {
        res.status(400).json({
          success: false,
          message: "无效的投诉ID",
        });
        return;
      }

      const complaint = await this.complaintService.getComplaintById(complaintId);

      if (!complaint) {
        res.status(404).json({
          success: false,
          message: "投诉不存在",
        });
        return;
      }

      // 权限检查：只有相关用户或管理员可以查看
      if (
        !req.user.isAdmin &&
        complaint.complainant_id !== req.user.userId &&
        complaint.complained_id !== req.user.userId
      ) {
        res.status(403).json({
          success: false,
          message: "无权限查看此投诉",
        });
        return;
      }

      res.json({
        success: true,
        data: complaint,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取投诉详情失败",
      });
    }
  };

  // 处理投诉（管理员）
  processComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const { id } = req.params;
      const complaintId = parseInt(id);

      if (isNaN(complaintId)) {
        res.status(400).json({
          success: false,
          message: "无效的投诉ID",
        });
        return;
      }

      const { status, admin_response }: ProcessComplaintData = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: "处理状态为必填项",
        });
        return;
      }

      // 验证状态值
      if (!Object.values(ComplaintStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: "无效的处理状态",
        });
        return;
      }

      const processData: ProcessComplaintData = {
        status,
        admin_response,
      };

      const updatedComplaint = await this.complaintService.processComplaint(
        complaintId,
        req.user.userId,
        processData
      );

      res.json({
        success: true,
        message: "投诉处理成功",
        data: updatedComplaint,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "投诉处理失败",
      });
    }
  };

  // 获取用户发起的投诉
  getUserComplaints = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { page, limit, status, category, search } = req.query;

      const params: ComplaintQueryParams = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as ComplaintStatus,
        category: category as string,
        search: search as string,
      };

      const result = await this.complaintService.getUserComplaints(req.user.userId, params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取用户投诉列表失败",
      });
    }
  };

  // 获取用户收到的投诉
  getUserReceivedComplaints = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { page, limit, status, category, search } = req.query;

      const params: ComplaintQueryParams = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as ComplaintStatus,
        category: category as string,
        search: search as string,
      };

      const result = await this.complaintService.getUserReceivedComplaints(req.user.userId, params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取收到的投诉列表失败",
      });
    }
  };

  // 获取投诉统计信息
  getComplaintStats = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      // 如果是管理员，可以获取全局统计；否则只能获取自己的统计
      const userId = req.user.isAdmin ? undefined : req.user.userId;
      const stats = await this.complaintService.getComplaintStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取投诉统计失败",
      });
    }
  };

  // 获取投诉分类
  getComplaintCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.complaintService.getComplaintCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取投诉分类失败",
      });
    }
  };
}
