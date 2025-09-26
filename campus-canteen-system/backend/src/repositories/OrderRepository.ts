import { Repository, FindManyOptions, Between, In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Order, OrderStatus, OrderCategory } from "../entities/Order";
import { User } from "../entities/User";

export interface OrderQueryOptions {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  category?: OrderCategory;
  publisherId?: number;
  accepterId?: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface OrderListResult {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class OrderRepository {
  private orderRepo: Repository<Order>;
  private userRepo: Repository<User>;

  constructor() {
    this.orderRepo = AppDataSource.getRepository(Order);
    this.userRepo = AppDataSource.getRepository(User);
  }

  // 创建订单
  async create(orderData: Partial<Order>): Promise<Order> {
    // 生成订单编号
    const orderNumber = await this.generateOrderNumber();

    const order = this.orderRepo.create({
      ...orderData,
      order_number: orderNumber,
      status: OrderStatus.PENDING,
      published_at: new Date(),
    });

    return await this.orderRepo.save(order);
  }

  // 根据ID查找订单
  async findById(id: number): Promise<Order | null> {
    return await this.orderRepo.findOne({
      where: { id },
      relations: ["publisher", "publisher.profile", "accepter", "accepter.profile"],
    });
  }

  // 根据订单编号查找订单
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.orderRepo.findOne({
      where: { order_number: orderNumber },
      relations: ["publisher", "publisher.profile", "accepter", "accepter.profile"],
    });
  }

  // 获取订单列表（支持分页和筛选）
  async findMany(options: OrderQueryOptions = {}): Promise<OrderListResult> {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      publisherId,
      accepterId,
      search,
      startDate,
      endDate,
    } = options;

    const queryBuilder = this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.publisher", "publisher")
      .leftJoinAndSelect("publisher.profile", "publisherProfile")
      .leftJoinAndSelect("order.accepter", "accepter")
      .leftJoinAndSelect("accepter.profile", "accepterProfile");

    // 状态筛选
    if (status) {
      queryBuilder.andWhere("order.status = :status", { status });
    }

    // 类别筛选
    if (category) {
      queryBuilder.andWhere("order.category = :category", { category });
    }

    // 发布者筛选
    if (publisherId) {
      queryBuilder.andWhere("order.publisher_id = :publisherId", {
        publisherId,
      });
    }

    // 接单者筛选
    if (accepterId) {
      queryBuilder.andWhere("order.accepter_id = :accepterId", { accepterId });
    }

    // 搜索功能（搜索餐厅名称、餐品描述、收货地址）
    if (search) {
      queryBuilder.andWhere(
        "(order.restaurant LIKE :search OR order.meal_description LIKE :search OR order.delivery_address LIKE :search)",
        { search: `%${search}%` }
      );
    }

    // 日期范围筛选
    if (startDate && endDate) {
      queryBuilder.andWhere("order.published_at BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    }

    // 排序（最新发布的在前）
    queryBuilder.orderBy("order.published_at", "DESC");

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // 更新订单
  async update(id: number, updateData: Partial<Order>): Promise<Order | null> {
    await this.orderRepo.update(id, updateData);
    return await this.findById(id);
  }

  // 接受订单
  async acceptOrder(orderId: number, accepterId: number): Promise<Order | null> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error("订单不存在");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("订单状态不允许接单");
    }

    if (order.publisher_id === accepterId) {
      throw new Error("不能接受自己发布的订单");
    }

    await this.orderRepo.update(orderId, {
      accepter_id: accepterId,
      status: OrderStatus.ACCEPTED,
      accepted_at: new Date(),
    });

    return await this.findById(orderId);
  }

  // 完成订单
  async completeOrder(orderId: number, userId: number): Promise<Order | null> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error("订单不存在");
    }

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new Error("订单状态不允许完成");
    }

    // 只有发布者或接单者可以标记完成
    if (order.publisher_id !== userId && order.accepter_id !== userId) {
      throw new Error("无权限操作此订单");
    }

    await this.orderRepo.update(orderId, {
      status: OrderStatus.COMPLETED,
      completed_at: new Date(),
    });

    return await this.findById(orderId);
  }

  // 取消订单
  async cancelOrder(orderId: number, userId: number): Promise<Order | null> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error("订单不存在");
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new Error("已完成的订单不能取消");
    }

    // 只有发布者可以取消订单
    if (order.publisher_id !== userId) {
      throw new Error("只有发布者可以取消订单");
    }

    await this.orderRepo.update(orderId, {
      status: OrderStatus.CANCELLED,
    });

    return await this.findById(orderId);
  }

  // 删除订单
  async delete(id: number): Promise<boolean> {
    const result = await this.orderRepo.delete(id);
    return result.affected !== 0;
  }

  // 获取用户订单统计
  async getUserOrderStats(userId: number) {
    const publishedCount = await this.orderRepo.count({
      where: { publisher_id: userId },
    });

    const acceptedCount = await this.orderRepo.count({
      where: { accepter_id: userId },
    });

    const completedAsPublisher = await this.orderRepo.count({
      where: {
        publisher_id: userId,
        status: OrderStatus.COMPLETED,
      },
    });

    const completedAsAccepter = await this.orderRepo.count({
      where: {
        accepter_id: userId,
        status: OrderStatus.COMPLETED,
      },
    });

    return {
      published: publishedCount,
      accepted: acceptedCount,
      completedAsPublisher,
      completedAsAccepter,
      totalCompleted: completedAsPublisher + completedAsAccepter,
    };
  }

  // 获取订单状态统计
  async getOrderStatusStats() {
    const stats = await this.orderRepo
      .createQueryBuilder("order")
      .select("order.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("order.status")
      .getRawMany();

    const result = {
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
    };

    stats.forEach((stat) => {
      result[stat.status as keyof typeof result] = parseInt(stat.count);
    });

    return result;
  }

  // 生成订单编号
  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

    // 查找今天已有的订单数量
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayOrderCount = await this.orderRepo.count({
      where: {
        published_at: Between(startOfDay, endOfDay),
      },
    });

    const sequence = (todayOrderCount + 1).toString().padStart(3, "0");
    return `ORD${dateStr}${sequence}`;
  }
}
