import { api } from "./api";

export interface AdminUser {
  id: number;
  username: string;
  is_admin: boolean;
  is_frozen: boolean;
  credit_score: number;
  created_at: string;
  updated_at: string;
  profile?: {
    student_card_id: string;
    name: string;
    grade?: string;
    institute?: string;
    contact_way?: string;
    email?: string;
    gender?: "male" | "female" | "other";
  };
  published_orders?: any[];
  accepted_orders?: any[];
  services?: any[];
  filed_complaints?: any[];
  received_complaints?: any[];
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  is_admin?: boolean;
  is_frozen?: boolean;
  search?: string;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export interface SystemActivity {
  type: string;
  message: string;
  timestamp: string;
  user?: string;
}

export interface SystemLogsResponse {
  activities: SystemActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SystemLogsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  username?: string;
  orderId?: string;
  activityType?: string;
}

export interface RegistrationApplication {
  id: number;
  username: string;
  student_card_id: string;
  name: string;
  grade?: string;
  institute?: string;
  contact_way?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  student_photo_url?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at?: string;
  reviewer_id?: number;
  review_comment?: string;
}

export interface RegistrationApplicationsResponse {
  applications: RegistrationApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RegistrationApplicationsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  search?: string;
}

export interface ReviewRegistrationRequest {
  action: "approve" | "reject";
  comment?: string;
}

export const adminService = {
  // 获取用户列表
  async getUsers(params?: UserQueryParams): Promise<UserListResponse> {
    const response = await api.get("/admin/users", { params });
    return response.data.data;
  },

  // 获取用户详情
  async getUserDetail(id: number): Promise<AdminUser> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  },

  // 冻结/解冻用户
  async toggleUserFreeze(
    id: number
  ): Promise<{ id: number; username: string; is_frozen: boolean }> {
    const response = await api.put(`/admin/users/${id}/freeze`);
    return response.data.data;
  },

  // 设置/取消管理员权限
  async toggleUserAdmin(id: number): Promise<{ id: number; username: string; is_admin: boolean }> {
    const response = await api.put(`/admin/users/${id}/admin`);
    return response.data.data;
  },

  // 删除用户
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  // 获取仪表板统计数据
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get("/admin/dashboard/stats");
    return response.data.data;
  },

  // 获取系统活动日志
  async getSystemLogs(params?: SystemLogsParams): Promise<SystemLogsResponse> {
    const response = await api.get("/admin/logs", { params });
    return response.data.data;
  },

  // 获取注册申请列表
  async getRegistrationApplications(
    params?: RegistrationApplicationsParams
  ): Promise<RegistrationApplicationsResponse> {
    const response = await api.get("/admin/registration-applications", { params });
    return response.data.data;
  },

  // 审核注册申请
  async reviewRegistrationApplication(
    id: number,
    reviewData: ReviewRegistrationRequest
  ): Promise<RegistrationApplication> {
    const response = await api.post(`/admin/registration-applications/${id}/review`, reviewData);
    return response.data.data;
  },
};
