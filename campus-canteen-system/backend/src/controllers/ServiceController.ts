import { Request, Response } from "express";
import {
  ServiceService,
  CreateServiceData,
  UpdateServiceData,
  ServiceQueryParams,
} from "../services/ServiceService";
import { ServiceStatus } from "../entities/Service";

export class ServiceController {
  private serviceService: ServiceService;

  constructor() {
    this.serviceService = new ServiceService();
  }

  // 创建服务
  async createService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { service_number, category, description }: CreateServiceData = req.body;

      // 基本验证
      if (!service_number || !category || !description) {
        res.status(400).json({
          success: false,
          message: "服务编号、分类和描述为必填项",
        });
        return;
      }

      const serviceData: CreateServiceData = {
        service_number,
        category,
        description,
      };

      const service = await this.serviceService.createService(req.user.userId, serviceData);

      res.status(201).json({
        success: true,
        message: "服务发布成功",
        data: service,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "服务发布失败",
      });
    }
  }

  // 获取服务列表
  async getServices(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, category, status, publisher_id, search } = req.query;

      const params: ServiceQueryParams = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        category: category as string,
        status: status as ServiceStatus,
        publisher_id: publisher_id ? parseInt(publisher_id as string) : undefined,
        search: search as string,
      };

      const result = await this.serviceService.getServices(params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取服务列表失败",
      });
    }
  }

  // 获取服务详情
  async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const serviceId = parseInt(id);

      if (isNaN(serviceId)) {
        res.status(400).json({
          success: false,
          message: "无效的服务ID",
        });
        return;
      }

      const service = await this.serviceService.getServiceById(serviceId);

      if (!service) {
        res.status(404).json({
          success: false,
          message: "服务不存在",
        });
        return;
      }

      res.json({
        success: true,
        data: service,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取服务详情失败",
      });
    }
  }

  // 更新服务
  async updateService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { id } = req.params;
      const serviceId = parseInt(id);

      if (isNaN(serviceId)) {
        res.status(400).json({
          success: false,
          message: "无效的服务ID",
        });
        return;
      }

      const { category, description, status }: UpdateServiceData = req.body;

      const updateData: UpdateServiceData = {};
      if (category !== undefined) updateData.category = category;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: "没有提供要更新的数据",
        });
        return;
      }

      const updatedService = await this.serviceService.updateService(
        serviceId,
        req.user.userId,
        updateData
      );

      res.json({
        success: true,
        message: "服务更新成功",
        data: updatedService,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "服务更新失败",
      });
    }
  }

  // 删除服务
  async deleteService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { id } = req.params;
      const serviceId = parseInt(id);

      if (isNaN(serviceId)) {
        res.status(400).json({
          success: false,
          message: "无效的服务ID",
        });
        return;
      }

      await this.serviceService.deleteService(serviceId, req.user.userId);

      res.json({
        success: true,
        message: "服务删除成功",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "服务删除失败",
      });
    }
  }

  // 获取服务分类
  async getServiceCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.serviceService.getServiceCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取服务分类失败",
      });
    }
  }

  // 获取用户发布的服务
  async getUserServices(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { page, limit, category, status, search } = req.query;

      const params: ServiceQueryParams = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        category: category as string,
        status: status as ServiceStatus,
        search: search as string,
      };

      const result = await this.serviceService.getUserServices(req.user.userId, params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取用户服务列表失败",
      });
    }
  }

  // 获取服务统计信息
  async getServiceStats(req: Request, res: Response): Promise<void> {
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
      const stats = await this.serviceService.getServiceStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "获取服务统计失败",
      });
    }
  }
}
