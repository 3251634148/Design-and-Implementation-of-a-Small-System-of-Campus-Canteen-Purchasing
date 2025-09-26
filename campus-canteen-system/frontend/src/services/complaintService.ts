import { api } from "./api";

export interface Complaint {
  id: number;
  complainant_id: number;
  complained_id: number;
  order_id?: number;
  category: string;
  reason: string;
  status: "pending" | "processing" | "resolved" | "rejected";
  admin_response?: string;
  processed_by?: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  complainant?: {
    id: number;
    username: string;
    profile?: {
      name: string;
      student_card_id: string;
    };
  };
  complained?: {
    id: number;
    username: string;
    profile?: {
      name: string;
      student_card_id: string;
    };
  };
  order?: {
    id: number;
    order_number: string;
    title: string;
  };
  processed_by_user?: {
    id: number;
    username: string;
  };
}

export interface CreateComplaintData {
  complained_id: number;
  order_id?: number;
  category: string;
  reason: string;
}

export interface ProcessComplaintData {
  status: "pending" | "processing" | "resolved" | "rejected";
  admin_response?: string;
}

export interface ComplaintQueryParams {
  page?: number;
  limit?: number;
  status?: "pending" | "processing" | "resolved" | "rejected";
  category?: string;
  complainant_id?: number;
  complained_id?: number;
  order_id?: number;
  search?: string;
}

export interface ComplaintListResponse {
  complaints: Complaint[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ComplaintStats {
  filed?: {
    total: number;
    pending: number;
    resolved: number;
  };
  received?: {
    total: number;
    pending: number;
    resolved: number;
  };
  total?: number;
  pending?: number;
  processing?: number;
  resolved?: number;
  rejected?: number;
}

export const complaintService = {
  // 提交投诉
  async createComplaint(data: CreateComplaintData): Promise<Complaint> {
    const response = await api.post("/complaints", data);
    return response.data.data;
  },

  // 获取投诉列表
  async getComplaints(params?: ComplaintQueryParams): Promise<ComplaintListResponse> {
    const response = await api.get("/complaints", { params });
    return response.data.data;
  },

  // 获取投诉详情
  async getComplaintById(id: number): Promise<Complaint> {
    const response = await api.get(`/complaints/${id}`);
    return response.data.data;
  },

  // 处理投诉（管理员）
  async processComplaint(id: number, data: ProcessComplaintData): Promise<Complaint> {
    const response = await api.put(`/complaints/${id}/process`, data);
    return response.data.data;
  },

  // 获取用户发起的投诉
  async getUserComplaints(params?: ComplaintQueryParams): Promise<ComplaintListResponse> {
    const response = await api.get("/complaints/user/filed", { params });
    return response.data.data;
  },

  // 获取用户收到的投诉
  async getUserReceivedComplaints(params?: ComplaintQueryParams): Promise<ComplaintListResponse> {
    const response = await api.get("/complaints/user/received", { params });
    return response.data.data;
  },

  // 获取投诉统计
  async getComplaintStats(): Promise<ComplaintStats> {
    const response = await api.get("/complaints/stats");
    return response.data.data;
  },

  // 获取投诉分类
  async getComplaintCategories(): Promise<string[]> {
    const response = await api.get("/complaints/categories");
    return response.data.data;
  },
};
