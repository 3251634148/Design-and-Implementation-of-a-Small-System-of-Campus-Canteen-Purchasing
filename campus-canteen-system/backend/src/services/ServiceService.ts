import { AppDataSource } from "../config/database";
import { Service, ServiceStatus } from "../entities/Service";
import { User } from "../entities/User";
import { Repository } from "typeorm";

export interface CreateServiceData {
  service_number: string;
  category: string;
  description: string;
}

export interface UpdateServiceData {
  category?: string;
  description?: string;
  status?: ServiceStatus;
}

export interface ServiceQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: ServiceStatus;
  publisher_id?: number;
  search?: string;
}

export class ServiceService {
  private serviceRepository: Repository<Service>;
  private userRepository: Repository<User>;

  constructor() {
    this.serviceRepository = AppDataSource.getRepository(Service);
    this.userRepository = AppDataSource.getRepository(User);
  }

  // 创建服务
  async createService(publisherId: number, serviceData: CreateServiceData): Promise<Service> {
    // 检查用户是否存在
    const publisher = await this.userRepository.findOne({
      where: { id: publisherId },
    });

    if (!publisher) {
      throw new Error("发布者不存在");
    }

    if (publisher.is_frozen) {
      throw new Error("账户已被冻结，无法发布服务");
    }

    // 检查服务编号是否已存在
    const existingService = await this.serviceRepository.findOne({
      where: { service_number: serviceData.service_number },
    });

    if (existingService) {
      throw new Error("服务编号已存在");
    }

    // 创建新服务
    const service = this.serviceRepository.create({
      ...serviceData,
      publisher_id: publisherId,
      status: ServiceStatus.ACTIVE,
      published_at: new Date(),
    });

    return await this.serviceRepository.save(service);
  }

  // 获取服务列表
  async getServices(params: ServiceQueryParams = {}) {
    const { page = 1, limit = 10, category, status, publisher_id, search } = params;

    const queryBuilder = this.serviceRepository
      .createQueryBuilder("service")
      .leftJoinAndSelect("service.publisher", "publisher")
      .leftJoinAndSelect("publisher.profile", "profile");

    // 添加筛选条件
    if (category) {
      queryBuilder.andWhere("service.category = :category", { category });
    }

    if (status) {
      queryBuilder.andWhere("service.status = :status", { status });
    } else {
      // 默认只显示活跃的服务
      queryBuilder.andWhere("service.status = :status", { status: ServiceStatus.ACTIVE });
    }

    if (publisher_id) {
      queryBuilder.andWhere("service.publisher_id = :publisher_id", { publisher_id });
    }

    if (search) {
      queryBuilder.andWhere(
        "(service.service_number LIKE :search OR service.description LIKE :search OR service.category LIKE :search)",
        { search: `%${search}%` }
      );
    }

    // 排序
    queryBuilder.orderBy("service.published_at", "DESC");

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [services, total] = await queryBuilder.getManyAndCount();

    return {
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 获取服务详情
  async getServiceById(id: number): Promise<Service | null> {
    return await this.serviceRepository.findOne({
      where: { id },
      relations: ["publisher", "publisher.profile"],
    });
  }

  // 更新服务
  async updateService(id: number, userId: number, updateData: UpdateServiceData): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ["publisher"],
    });

    if (!service) {
      throw new Error("服务不存在");
    }

    // 检查权限：只有发布者或管理员可以修改
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    if (service.publisher_id !== userId && !user.is_admin) {
      throw new Error("无权限修改此服务");
    }

    // 更新服务信息
    Object.assign(service, updateData);
    return await this.serviceRepository.save(service);
  }

  // 删除服务（软删除）
  async deleteService(id: number, userId: number): Promise<void> {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new Error("服务不存在");
    }

    // 检查权限
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    if (service.publisher_id !== userId && !user.is_admin) {
      throw new Error("无权限删除此服务");
    }

    // 软删除
    service.status = ServiceStatus.DELETED;
    await this.serviceRepository.save(service);
  }

  // 获取服务分类列表
  async getServiceCategories(): Promise<string[]> {
    const result = await this.serviceRepository
      .createQueryBuilder("service")
      .select("DISTINCT service.category", "category")
      .where("service.status = :status", { status: ServiceStatus.ACTIVE })
      .getRawMany();

    return result.map((item) => item.category);
  }

  // 获取用户发布的服务
  async getUserServices(userId: number, params: ServiceQueryParams = {}) {
    return await this.getServices({
      ...params,
      publisher_id: userId,
    });
  }

  // 获取服务统计信息
  async getServiceStats(userId?: number) {
    const queryBuilder = this.serviceRepository.createQueryBuilder("service");

    if (userId) {
      queryBuilder.where("service.publisher_id = :userId", { userId });
    }

    const [totalServices, activeServices, inactiveServices] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere("service.status = :status", { status: ServiceStatus.ACTIVE })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere("service.status = :status", { status: ServiceStatus.INACTIVE })
        .getCount(),
    ]);

    return {
      total: totalServices,
      active: activeServices,
      inactive: inactiveServices,
      deleted: totalServices - activeServices - inactiveServices,
    };
  }
}
