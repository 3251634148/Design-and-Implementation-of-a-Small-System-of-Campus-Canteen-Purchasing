import { User } from "./User";
import { Order } from "./Order";

export interface Complaint {
  id: number;
  complainant_id: number;
  complained_id: number;
  order_id?: number;
  category: string;
  reason: string;
  status: ComplaintStatus;
  admin_response?: string;
  processed_by?: number;
  processed_at?: Date;
  created_at: Date;
  updated_at: Date;
  complainant?: User;
  complained?: User;
  order?: Order;
  processed_by_user?: User;
}

export enum ComplaintStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

// API请求/响应类型
export interface CreateComplaintRequest {
  complained_id: number;
  order_id?: number;
  category: string;
  reason: string;
}

export interface ProcessComplaintRequest {
  status: ComplaintStatus;
  admin_response?: string;
}

export interface ComplaintListQuery {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
  category?: string;
  complainant_id?: number;
  complained_id?: number;
  order_id?: number;
}

export interface ComplaintResponse {
  success: boolean;
  message?: string;
  data?: Complaint;
}

export interface ComplaintListResponse {
  success: boolean;
  message?: string;
  data?: {
    complaints: Complaint[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ComplaintStatsResponse {
  success: boolean;
  data?: {
    total: number;
    pending: number;
    processing: number;
    resolved: number;
    rejected: number;
    byCategory: Record<string, number>;
  };
}
