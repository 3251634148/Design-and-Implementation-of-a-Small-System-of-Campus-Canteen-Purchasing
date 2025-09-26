import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Order, OrderStatus } from "../entities/Order";
import { Service, ServiceStatus } from "../entities/Service";
import { Complaint, ComplaintStatus } from "../entities/Complaint";
import { Repository } from "typeorm";

export interface UserQueryParams {
  page?: number;
  limit?: number;
  is_admin?: boolean;
  is_frozen?: boolean;
  search?: string;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    frozen: number;
    admins: number;
  };
  orders: {
    total: number;
    pending: number;
    accepted: number;
    completed: number;
    cancelled: number;
  };
  services: {
    total: number;
    active: number;
    inactive: number;
  };
  complaints: {
    total: number;
    pending: number;
    processing: number;
    resolved: number;
    rejected: number;
  };
}

export class AdminService {
  private userRepository: Repository<User>;
  private orderRepository: Repository<Order>;
  private serviceRepository: Repository<Service>;
  private complaintRepository: Repository<Complaint>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.serviceRepository = AppDataSource.getRepository(Service);
    this.complaintRepository = AppDataSource.getRepository(Complaint);
  }

  // 验证管理员权限
  private async verifyAdmin(adminId: number): Promise<User> {
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || !admin.is_admin) {
      throw new Error("需要管理员权限");
    }

    return admin;
  }

  // 获取用户列表
  async getUsers(adminId: number, params: UserQueryParams = {}) {
    await this.verifyAdmin(adminId);

    const { page = 1, limit = 10, is_admin, is_frozen, search } = params;

    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.profile", "profile");

    // 添加筛选条件
    if (is_admin !== undefined) {
      queryBuilder.andWhere("user.is_admin = :is_admin", { is_admin });
    }

    if (is_frozen !== undefined) {
      queryBuilder.andWhere("user.is_frozen = :is_frozen", { is_frozen });
    }

    if (search) {
      queryBuilder.andWhere(
        "(user.username LIKE :search OR profile.name LIKE :search OR profile.student_card_id LIKE :search)",
        { search: `%${search}%` }
      );
    }

    // 排序
    queryBuilder.orderBy("user.created_at", "DESC");

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 冻结/解冻用户
  async toggleUserFreeze(adminId: number, userId: number): Promise<User> {
    await this.verifyAdmin(adminId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["profile"],
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    // 不能冻结其他管理员
    if (user.is_admin && user.id !== adminId) {
      throw new Error("不能冻结其他管理员");
    }

    // 不能冻结自己
    if (user.id === adminId) {
      throw new Error("不能冻结自己");
    }

    user.is_frozen = !user.is_frozen;
    return await this.userRepository.save(user);
  }

  // 删除用户（软删除，实际上是永久冻结）
  async deleteUser(adminId: number, userId: number): Promise<void> {
    await this.verifyAdmin(adminId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    // 不能删除其他管理员
    if (user.is_admin && user.id !== adminId) {
      throw new Error("不能删除其他管理员");
    }

    // 不能删除自己
    if (user.id === adminId) {
      throw new Error("不能删除自己");
    }

    // 永久冻结用户
    user.is_frozen = true;
    await this.userRepository.save(user);
  }

  // 获取仪表板统计数据
  async getDashboardStats(adminId: number): Promise<DashboardStats> {
    await this.verifyAdmin(adminId);

    // 用户统计
    const [totalUsers, activeUsers, frozenUsers, adminUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { is_frozen: false } }),
      this.userRepository.count({ where: { is_frozen: true } }),
      this.userRepository.count({ where: { is_admin: true } }),
    ]);

    // 订单统计
    const [totalOrders, pendingOrders, acceptedOrders, completedOrders, cancelledOrders] =
      await Promise.all([
        this.orderRepository.count(),
        this.orderRepository.count({ where: { status: OrderStatus.PENDING } }),
        this.orderRepository.count({ where: { status: OrderStatus.ACCEPTED } }),
        this.orderRepository.count({ where: { status: OrderStatus.COMPLETED } }),
        this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } }),
      ]);

    // 服务统计
    const [totalServices, activeServices, inactiveServices] = await Promise.all([
      this.serviceRepository.count(),
      this.serviceRepository.count({ where: { status: ServiceStatus.ACTIVE } }),
      this.serviceRepository.count({ where: { status: ServiceStatus.INACTIVE } }),
    ]);

    // 投诉统计
    const [
      totalComplaints,
      pendingComplaints,
      processingComplaints,
      resolvedComplaints,
      rejectedComplaints,
    ] = await Promise.all([
      this.complaintRepository.count(),
      this.complaintRepository.count({ where: { status: ComplaintStatus.PENDING } }),
      this.complaintRepository.count({ where: { status: ComplaintStatus.PROCESSING } }),
      this.complaintRepository.count({ where: { status: ComplaintStatus.RESOLVED } }),
      this.complaintRepository.count({ where: { status: ComplaintStatus.REJECTED } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        frozen: frozenUsers,
        admins: adminUsers,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        accepted: acceptedOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      services: {
        total: totalServices,
        active: activeServices,
        inactive: inactiveServices,
      },
      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
        processing: processingComplaints,
        resolved: resolvedComplaints,
        rejected: rejectedComplaints,
      },
    };
  }

  // 获取用户详细信息
  async getUserDetail(adminId: number, userId: number): Promise<User> {
    await this.verifyAdmin(adminId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        "profile",
        "published_orders",
        "accepted_orders",
        "services",
        "filed_complaints",
        "received_complaints",
      ],
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    return user;
  }

  // 设置用户管理员权限
  async toggleUserAdmin(adminId: number, userId: number): Promise<User> {
    await this.verifyAdmin(adminId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["profile"],
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    // 不能修改自己的管理员权限
    if (user.id === adminId) {
      throw new Error("不能修改自己的管理员权限");
    }

    user.is_admin = !user.is_admin;
    return await this.userRepository.save(user);
  }

  // 获取系统活动日志（简化版本，实际应该有专门的日志表）
  async getSystemLogs(adminId: number, params: { page?: number; limit?: number } = {}) {
    await this.verifyAdmin(adminId);

    const { page = 1, limit = 20 } = params;

    // 这里简化处理，实际应该有专门的操作日志表
    // 暂时返回最近的用户注册、订单创建、投诉提交等活动
    const recentUsers = await this.userRepository.find({
      order: { created_at: "DESC" },
      take: 5,
      relations: ["profile"],
    });

    const recentOrders = await this.orderRepository.find({
      order: { created_at: "DESC" },
      take: 5,
      relations: ["publisher"],
    });

    const recentComplaints = await this.complaintRepository.find({
      order: { created_at: "DESC" },
      take: 5,
      relations: ["complainant"],
    });

    // 合并并排序活动
    const activities = [
      ...recentUsers.map((user) => ({
        type: "user_register",
        message: `用户 ${user.username} 注册了账号`,
        timestamp: user.created_at,
        user: user.username,
      })),
      ...recentOrders.map((order) => ({
        type: "order_create",
        message: `用户 ${order.publisher?.username} 发布了订单 ${order.order_number}`,
        timestamp: order.created_at,
        user: order.publisher?.username,
      })),
      ...recentComplaints.map((complaint) => ({
        type: "complaint_create",
        message: `用户 ${complaint.complainant?.username} 提交了投诉`,
        timestamp: complaint.created_at,
        user: complaint.complainant?.username,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const offset = (page - 1) * limit;
    const paginatedActivities = activities.slice(offset, offset + limit);

    return {
      activities: paginatedActivities,
      total: activities.length,
      page,
      limit,
      totalPages: Math.ceil(activities.length / limit),
    };
  }
}
