import { OrderRepository, OrderQueryOptions } from "../repositories/OrderRepository";
import { UserRepository } from "../repositories/UserRepository";
import { Order, OrderStatus, OrderCategory } from "../entities/Order";

export interface CreateOrderData {
  delivery_address: string;
  tip?: number;
  meal_cost: number;
  category: OrderCategory;
  restaurant: string;
  meal_description: string;
  quantity?: number;
}

export interface UpdateOrderData {
  delivery_address?: string;
  tip?: number;
  meal_cost?: number;
  restaurant?: string;
  meal_description?: string;
  quantity?: number;
}

export class OrderService {
  private orderRepository: OrderRepository;
  private userRepository: UserRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.userRepository = new UserRepository();
  }

  // 发布新订单
  async createOrder(publisherId: number, orderData: CreateOrderData): Promise<Order> {
    // 验证发布者是否存在且未被冻结
    const publisher = await this.userRepository.findById(publisherId);
    if (!publisher) {
      throw new Error("用户不存在");
    }

    if (publisher.is_frozen) {
      throw new Error("账户已被冻结，无法发布订单");
    }

    // 验证订单数据
    this.validateOrderData(orderData);

    // 创建订单
    const order = await this.orderRepository.create({
      publisher_id: publisherId,
      delivery_address: orderData.delivery_address,
      tip: orderData.tip || 0,
      meal_cost: orderData.meal_cost,
      category: orderData.category,
      restaurant: orderData.restaurant,
      meal_description: orderData.meal_description,
      quantity: orderData.quantity || 1,
    });

    return order;
  }

  // 获取订单列表
  async getOrders(options: OrderQueryOptions = {}) {
    return await this.orderRepository.findMany(options);
  }

  // 获取订单详情
  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("订单不存在");
    }
    return order;
  }

  // 更新订单信息
  async updateOrder(orderId: number, userId: number, updateData: UpdateOrderData): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("订单不存在");
    }

    // 只有发布者可以修改订单
    if (order.publisher_id !== userId) {
      throw new Error("只有发布者可以修改订单");
    }

    // 只有待接单状态的订单可以修改
    if (order.status !== OrderStatus.PENDING) {
      throw new Error("只有待接单状态的订单可以修改");
    }

    // 验证更新数据
    if (updateData.meal_cost !== undefined) {
      this.validateMealCost(updateData.meal_cost);
    }

    if (updateData.tip !== undefined) {
      this.validateTip(updateData.tip);
    }

    if (updateData.quantity !== undefined) {
      this.validateQuantity(updateData.quantity);
    }

    const updatedOrder = await this.orderRepository.update(orderId, updateData);
    if (!updatedOrder) {
      throw new Error("订单更新失败");
    }

    return updatedOrder;
  }

  // 接受订单
  async acceptOrder(orderId: number, accepterId: number): Promise<Order> {
    // 验证接单者是否存在且未被冻结
    const accepter = await this.userRepository.findById(accepterId);
    if (!accepter) {
      throw new Error("用户不存在");
    }

    if (accepter.is_frozen) {
      throw new Error("账户已被冻结，无法接单");
    }

    const result = await this.orderRepository.acceptOrder(orderId, accepterId);
    if (!result) {
      throw new Error("接单失败");
    }
    return result;
  }

  // 完成订单
  async completeOrder(orderId: number, userId: number): Promise<Order> {
    const result = await this.orderRepository.completeOrder(orderId, userId);
    if (!result) {
      throw new Error("订单完成失败");
    }
    return result;
  }

  // 取消订单
  async cancelOrder(orderId: number, userId: number): Promise<Order> {
    const result = await this.orderRepository.cancelOrder(orderId, userId);
    if (!result) {
      throw new Error("订单取消失败");
    }
    return result;
  }

  // 获取用户的订单列表
  async getUserOrders(
    userId: number,
    options: Omit<OrderQueryOptions, "publisherId" | "accepterId"> = {}
  ) {
    // 获取用户发布的订单
    const publishedResult = await this.orderRepository.findMany({
      ...options,
      publisherId: userId,
    });

    // 获取用户接受的订单
    const acceptedResult = await this.orderRepository.findMany({
      ...options,
      accepterId: userId,
    });

    return {
      published: publishedResult.orders,
      accepted: acceptedResult.orders,
    };
  }

  // 获取用户订单统计
  async getUserOrderStats(userId: number) {
    return await this.orderRepository.getUserOrderStats(userId);
  }

  // 获取系统订单统计
  async getSystemOrderStats() {
    const statusStats = await this.orderRepository.getOrderStatusStats();
    const totalOrders = Object.values(statusStats).reduce((sum, count) => sum + count, 0);

    return {
      total: totalOrders,
      ...statusStats,
    };
  }

  // 搜索订单
  async searchOrders(searchTerm: string, options: Omit<OrderQueryOptions, "search"> = {}) {
    return await this.orderRepository.findMany({
      ...options,
      search: searchTerm,
    });
  }

  // 获取热门餐厅
  async getPopularRestaurants(limit: number = 10) {
    // 这里可以根据订单数量统计热门餐厅
    // 暂时返回空数组，后续可以扩展
    return [];
  }

  // 获取订单状态流转历史（扩展功能）
  async getOrderStatusHistory(orderId: number) {
    const order = await this.getOrderById(orderId);

    const history = [
      {
        status: OrderStatus.PENDING,
        timestamp: order.published_at,
        description: "订单已发布",
      },
    ];

    if (order.accepted_at) {
      history.push({
        status: OrderStatus.ACCEPTED,
        timestamp: order.accepted_at,
        description: "订单已被接受",
      });
    }

    if (order.completed_at) {
      history.push({
        status: OrderStatus.COMPLETED,
        timestamp: order.completed_at,
        description: "订单已完成",
      });
    }

    return history;
  }

  // 验证订单数据
  private validateOrderData(orderData: CreateOrderData): void {
    if (!orderData.delivery_address || orderData.delivery_address.trim().length === 0) {
      throw new Error("收货地址不能为空");
    }

    if (orderData.delivery_address.length > 200) {
      throw new Error("收货地址不能超过200个字符");
    }

    this.validateMealCost(orderData.meal_cost);

    if (orderData.tip !== undefined) {
      this.validateTip(orderData.tip);
    }

    if (!orderData.restaurant || orderData.restaurant.trim().length === 0) {
      throw new Error("餐厅名称不能为空");
    }

    if (orderData.restaurant.length > 100) {
      throw new Error("餐厅名称不能超过100个字符");
    }

    if (!orderData.meal_description || orderData.meal_description.trim().length === 0) {
      throw new Error("餐品描述不能为空");
    }

    if (orderData.meal_description.length > 500) {
      throw new Error("餐品描述不能超过500个字符");
    }

    if (orderData.quantity !== undefined) {
      this.validateQuantity(orderData.quantity);
    }

    // 验证类别
    if (!Object.values(OrderCategory).includes(orderData.category)) {
      throw new Error("无效的订单类别");
    }
  }

  private validateMealCost(mealCost: number): void {
    if (mealCost <= 0) {
      throw new Error("餐品费用必须大于0");
    }

    if (mealCost > 9999.99) {
      throw new Error("餐品费用不能超过9999.99元");
    }
  }

  private validateTip(tip: number): void {
    if (tip < 0) {
      throw new Error("小费不能为负数");
    }

    if (tip > 999.99) {
      throw new Error("小费不能超过999.99元");
    }
  }

  private validateQuantity(quantity: number): void {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error("数量必须为正整数");
    }

    if (quantity > 99) {
      throw new Error("数量不能超过99");
    }
  }
}
