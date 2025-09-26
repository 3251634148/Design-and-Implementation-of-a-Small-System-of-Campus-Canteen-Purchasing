import { AppDataSource } from "../config/database";
import { Complaint, ComplaintStatus } from "../entities/Complaint";
import { User } from "../entities/User";
import { Order } from "../entities/Order";
import { Repository } from "typeorm";

export interface CreateComplaintData {
  complained_id: number;
  order_id?: number;
  category: string;
  reason: string;
}

export interface ProcessComplaintData {
  status: ComplaintStatus;
  admin_response?: string;
}

export interface ComplaintQueryParams {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
  category?: string;
  complainant_id?: number;
  complained_id?: number;
  order_id?: number;
  search?: string;
}

export class ComplaintService {
  private complaintRepository: Repository<Complaint>;
  private userRepository: Repository<User>;
  private orderRepository: Repository<Order>;

  constructor() {
    this.complaintRepository = AppDataSource.getRepository(Complaint);
    this.userRepository = AppDataSource.getRepository(User);
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  // 提交投诉
  async createComplaint(
    complainantId: number,
    complaintData: CreateComplaintData
  ): Promise<Complaint> {
    // 检查投诉人是否存在
    const complainant = await this.userRepository.findOne({
      where: { id: complainantId },
    });

    if (!complainant) {
      throw new Error("投诉人不存在");
    }

    if (complainant.is_frozen) {
      throw new Error("账户已被冻结，无法提交投诉");
    }

    // 检查被投诉人是否存在
    const complained = await this.userRepository.findOne({
      where: { id: complaintData.complained_id },
    });

    if (!complained) {
      throw new Error("被投诉人不存在");
    }

    // 不能投诉自己
    if (complainantId === complaintData.complained_id) {
      throw new Error("不能投诉自己");
    }

    // 如果有订单ID，检查订单是否存在且相关
    if (complaintData.order_id) {
      const order = await this.orderRepository.findOne({
        where: { id: complaintData.order_id },
        relations: ["publisher", "accepter"],
      });

      if (!order) {
        throw new Error("相关订单不存在");
      }

      // 检查投诉人是否与订单相关（发布者或接受者）
      if (order.publisher_id !== complainantId && order.accepter_id !== complainantId) {
        throw new Error("您与此订单无关，无法投诉");
      }

      // 检查被投诉人是否与订单相关
      if (
        order.publisher_id !== complaintData.complained_id &&
        order.accepter_id !== complaintData.complained_id
      ) {
        throw new Error("被投诉人与此订单无关");
      }
    }

    // 创建投诉
    const complaint = this.complaintRepository.create({
      complainant_id: complainantId,
      complained_id: complaintData.complained_id,
      order_id: complaintData.order_id,
      category: complaintData.category,
      reason: complaintData.reason,
      status: ComplaintStatus.PENDING,
    });

    return await this.complaintRepository.save(complaint);
  }

  // 获取投诉列表
  async getComplaints(params: ComplaintQueryParams = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      complainant_id,
      complained_id,
      order_id,
      search,
    } = params;

    const queryBuilder = this.complaintRepository
      .createQueryBuilder("complaint")
      .leftJoinAndSelect("complaint.complainant", "complainant")
      .leftJoinAndSelect("complainant.profile", "complainant_profile")
      .leftJoinAndSelect("complaint.complained", "complained")
      .leftJoinAndSelect("complained.profile", "complained_profile")
      .leftJoinAndSelect("complaint.order", "order")
      .leftJoinAndSelect("complaint.processed_by_user", "processor");

    // 添加筛选条件
    if (status) {
      queryBuilder.andWhere("complaint.status = :status", { status });
    }

    if (category) {
      queryBuilder.andWhere("complaint.category = :category", { category });
    }

    if (complainant_id) {
      queryBuilder.andWhere("complaint.complainant_id = :complainant_id", { complainant_id });
    }

    if (complained_id) {
      queryBuilder.andWhere("complaint.complained_id = :complained_id", { complained_id });
    }

    if (order_id) {
      queryBuilder.andWhere("complaint.order_id = :order_id", { order_id });
    }

    if (search) {
      queryBuilder.andWhere(
        "(complaint.reason LIKE :search OR complaint.category LIKE :search OR complaint.admin_response LIKE :search)",
        { search: `%${search}%` }
      );
    }

    // 排序
    queryBuilder.orderBy("complaint.created_at", "DESC");

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [complaints, total] = await queryBuilder.getManyAndCount();

    return {
      complaints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 获取投诉详情
  async getComplaintById(id: number): Promise<Complaint | null> {
    return await this.complaintRepository.findOne({
      where: { id },
      relations: [
        "complainant",
        "complainant.profile",
        "complained",
        "complained.profile",
        "order",
        "processed_by_user",
      ],
    });
  }

  // 处理投诉（管理员）
  async processComplaint(
    id: number,
    adminId: number,
    processData: ProcessComplaintData
  ): Promise<Complaint> {
    // 检查管理员权限
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || !admin.is_admin) {
      throw new Error("无权限处理投诉");
    }

    // 获取投诉
    const complaint = await this.complaintRepository.findOne({
      where: { id },
    });

    if (!complaint) {
      throw new Error("投诉不存在");
    }

    if (
      complaint.status !== ComplaintStatus.PENDING &&
      complaint.status !== ComplaintStatus.PROCESSING
    ) {
      throw new Error("投诉已处理完成，无法再次处理");
    }

    // 更新投诉状态
    complaint.status = processData.status;
    complaint.admin_response = processData.admin_response;
    complaint.processed_by = adminId;
    complaint.processed_at = new Date();

    return await this.complaintRepository.save(complaint);
  }

  // 获取用户相关的投诉（作为投诉人）
  async getUserComplaints(userId: number, params: ComplaintQueryParams = {}) {
    return await this.getComplaints({
      ...params,
      complainant_id: userId,
    });
  }

  // 获取用户收到的投诉（作为被投诉人）
  async getUserReceivedComplaints(userId: number, params: ComplaintQueryParams = {}) {
    return await this.getComplaints({
      ...params,
      complained_id: userId,
    });
  }

  // 获取投诉统计信息
  async getComplaintStats(userId?: number) {
    const queryBuilder = this.complaintRepository.createQueryBuilder("complaint");

    if (userId) {
      // 用户统计：包括发起的投诉和收到的投诉
      const [
        filedComplaints,
        receivedComplaints,
        pendingFiled,
        resolvedFiled,
        pendingReceived,
        resolvedReceived,
      ] = await Promise.all([
        queryBuilder.clone().where("complaint.complainant_id = :userId", { userId }).getCount(),
        queryBuilder.clone().where("complaint.complained_id = :userId", { userId }).getCount(),
        queryBuilder
          .clone()
          .where("complaint.complainant_id = :userId", { userId })
          .andWhere("complaint.status = :status", { status: ComplaintStatus.PENDING })
          .getCount(),
        queryBuilder
          .clone()
          .where("complaint.complainant_id = :userId", { userId })
          .andWhere("complaint.status = :status", { status: ComplaintStatus.RESOLVED })
          .getCount(),
        queryBuilder
          .clone()
          .where("complaint.complained_id = :userId", { userId })
          .andWhere("complaint.status = :status", { status: ComplaintStatus.PENDING })
          .getCount(),
        queryBuilder
          .clone()
          .where("complaint.complained_id = :userId", { userId })
          .andWhere("complaint.status = :status", { status: ComplaintStatus.RESOLVED })
          .getCount(),
      ]);

      return {
        filed: {
          total: filedComplaints,
          pending: pendingFiled,
          resolved: resolvedFiled,
        },
        received: {
          total: receivedComplaints,
          pending: pendingReceived,
          resolved: resolvedReceived,
        },
      };
    } else {
      // 全局统计（管理员）
      const [
        totalComplaints,
        pendingComplaints,
        processingComplaints,
        resolvedComplaints,
        rejectedComplaints,
      ] = await Promise.all([
        queryBuilder.getCount(),
        queryBuilder
          .clone()
          .where("complaint.status = :status", { status: ComplaintStatus.PENDING })
          .getCount(),
        queryBuilder
          .clone()
          .where("complaint.status = :status", { status: ComplaintStatus.PROCESSING })
          .getCount(),
        queryBuilder
          .clone()
          .where("complaint.status = :status", { status: ComplaintStatus.RESOLVED })
          .getCount(),
        queryBuilder
          .clone()
          .where("complaint.status = :status", { status: ComplaintStatus.REJECTED })
          .getCount(),
      ]);

      return {
        total: totalComplaints,
        pending: pendingComplaints,
        processing: processingComplaints,
        resolved: resolvedComplaints,
        rejected: rejectedComplaints,
      };
    }
  }

  // 获取投诉分类列表
  async getComplaintCategories(): Promise<string[]> {
    const result = await this.complaintRepository
      .createQueryBuilder("complaint")
      .select("DISTINCT complaint.category", "category")
      .getRawMany();

    return result.map((item) => item.category);
  }
}
