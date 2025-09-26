import { api } from "./api";

export interface Service {
  id: number;
  service_number: string;
  publisher_id: number;
  category: string;
  description: string;
  status: "active" | "inactive" | "deleted";
  published_at: string;
  created_at: string;
  updated_at: string;
  publisher?: {
    id: number;
    username: string;
    profile?: {
      name: string;
      student_card_id: string;
      contact_way?: string;
    };
  };
}

export interface CreateServiceData {
  service_number: string;
  category: string;
  description: string;
}

export interface UpdateServiceData {
  category?: string;
  description?: string;
  status?: "active" | "inactive" | "deleted";
}

export interface ServiceQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: "active" | "inactive" | "deleted";
  publisher_id?: number;
  search?: string;
}

export interface ServiceListResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
}

export const serviceService = {
  // 获取服务列表
  async getServices(params?: ServiceQueryParams): Promise<ServiceListResponse> {
    const response = await api.get("/services", { params });
    return response.data.data;
  },

  // 获取服务详情
  async getServiceById(id: number): Promise<Service> {
    const response = await api.get(`/services/${id}`);
    return response.data.data;
  },

  // 创建服务
  async createService(data: CreateServiceData): Promise<Service> {
    const response = await api.post("/services", data);
    return response.data.data;
  },

  // 更新服务
  async updateService(id: number, data: UpdateServiceData): Promise<Service> {
    const response = await api.put(`/services/${id}`, data);
    return response.data.data;
  },

  // 删除服务
  async deleteService(id: number): Promise<void> {
    await api.delete(`/services/${id}`);
  },

  // 获取服务分类
  async getServiceCategories(): Promise<string[]> {
    const response = await api.get("/services/categories");
    return response.data.data;
  },

  // 获取用户发布的服务
  async getUserServices(params?: ServiceQueryParams): Promise<ServiceListResponse> {
    const response = await api.get("/services/user/my", { params });
    return response.data.data;
  },

  // 获取服务统计
  async getServiceStats(): Promise<ServiceStats> {
    const response = await api.get("/services/user/stats");
    return response.data.data;
  },
};
