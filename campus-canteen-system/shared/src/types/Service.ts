import { User } from "./User";

export interface Service {
  id: number;
  service_number: string;
  publisher_id: number;
  category: string;
  description: string;
  status: ServiceStatus;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
  publisher?: User;
}

export enum ServiceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DELETED = "deleted",
}

// API请求/响应类型
export interface CreateServiceRequest {
  category: string;
  description: string;
}

export interface UpdateServiceRequest {
  category?: string;
  description?: string;
  status?: ServiceStatus;
}

export interface ServiceListQuery {
  page?: number;
  limit?: number;
  category?: string;
  status?: ServiceStatus;
  publisher_id?: number;
  search?: string;
}

export interface ServiceResponse {
  success: boolean;
  message?: string;
  data?: Service;
}

export interface ServiceListResponse {
  success: boolean;
  message?: string;
  data?: {
    services: Service[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
