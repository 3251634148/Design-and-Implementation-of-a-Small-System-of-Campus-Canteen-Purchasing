import { Request, Response } from "express";
import { OrderService, CreateOrderData, UpdateOrderData } from "../services/OrderService";
import { OrderStatus, OrderCategory } from "../entities/Order";

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  // 发布新订单
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const {
        delivery_address,
        tip,
        meal_cost,
        category,
        restaurant,
        meal_description,
        quantity,
      }: CreateOrderData = req.body;

      // 基本验证
      if (!delivery_address || !meal_cost || !category || !restaurant || !meal_description) {
        res.status(400).json({
          success: false,
          message: "收货地址、餐品费用、类别、餐厅和餐品描述为必填项",
        });
        return;
      }

      const orderData: CreateOrderData = {
        delivery_address,
        tip: tip || 0,
        meal_cost,
        category,
        restaurant,
        meal_description,
        quantity: quantity || 1,
      };

      const order = await this.orderService.createOrder(req.user.userId, orderData);

      res.status(201).json({
        success: true,
        message: "订单发布成功",
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "订单发布失败",
      });
    }
  };

  // 获取订单列表
  getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = "1",
        limit = "10",
        status,
        category,
        publisherId,
        accepterId,
        search,
        startDate,
        endDate,
      } = req.query;

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as OrderStatus,
        category: category as OrderCategory,
        publisherId: publisherId ? parseInt(publisherId as string) : undefined,
        accepterId: accepterId ? parseInt(accepterId as string) : undefined,
        search: search as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const result = await this.orderService.getOrders(options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取订单列表失败",
      });
    }
  };

  // 获取订单详情
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        res.status(400).json({
          success: false,
          message: "无效的订单ID",
        });
        return;
      }

      const order = await this.orderService.getOrderById(orderId);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : "订单不存在",
      });
    }
  };

  // 更新订单信息
  updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        res.status(400).json({
          success: false,
          message: "无效的订单ID",
        });
        return;
      }

      const updateData: UpdateOrderData = req.body;

      const order = await this.orderService.updateOrder(orderId, req.user.userId, updateData);

      res.json({
        success: true,
        message: "订单更新成功",
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "订单更新失败",
      });
    }
  };

  // 接受订单
  acceptOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        res.status(400).json({
          success: false,
          message: "无效的订单ID",
        });
        return;
      }

      const order = await this.orderService.acceptOrder(orderId, req.user.userId);

      res.json({
        success: true,
        message: "接单成功",
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "接单失败",
      });
    }
  };

  // 完成订单
  completeOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        res.status(400).json({
          success: false,
          message: "无效的订单ID",
        });
        return;
      }

      const order = await this.orderService.completeOrder(orderId, req.user.userId);

      res.json({
        success: true,
        message: "订单完成",
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "订单完成失败",
      });
    }
  };

  // 取消订单
  cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        res.status(400).json({
          success: false,
          message: "无效的订单ID",
        });
        return;
      }

      const order = await this.orderService.cancelOrder(orderId, req.user.userId);

      res.json({
        success: true,
        message: "订单已取消",
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "订单取消失败",
      });
    }
  };

  // 获取用户的订单
  getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { page = "1", limit = "10", status, category } = req.query;

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as OrderStatus,
        category: category as OrderCategory,
      };

      const result = await this.orderService.getUserOrders(req.user.userId, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取用户订单失败",
      });
    }
  };

  // 获取用户订单统计
  getUserOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const stats = await this.orderService.getUserOrderStats(req.user.userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取订单统计失败",
      });
    }
  };

  // 获取系统订单统计（管理员）
  getSystemOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.is_admin) {
        res.status(403).json({
          success: false,
          message: "需要管理员权限",
        });
        return;
      }

      const stats = await this.orderService.getSystemOrderStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取系统统计失败",
      });
    }
  };

  // 搜索订单
  searchOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: searchTerm, page = "1", limit = "10" } = req.query;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: "搜索关键词不能为空",
        });
        return;
      }

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await this.orderService.searchOrders(searchTerm as string, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "搜索订单失败",
      });
    }
  };

  // 获取订单状态历史
  getOrderStatusHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        res.status(400).json({
          success: false,
          message: "无效的订单ID",
        });
        return;
      }

      const history = await this.orderService.getOrderStatusHistory(orderId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : "获取订单历史失败",
      });
    }
  };
}
