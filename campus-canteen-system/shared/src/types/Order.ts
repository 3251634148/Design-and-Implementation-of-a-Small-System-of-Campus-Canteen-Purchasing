import { User } from "./User";

export interface Order {
  id: number;
  order_number: string;
  publisher_id: number;
  accepter_id?: number;
  delivery_address: string;
  tip: number;
  meal_cost: number;
  status: OrderStatus;
  category: OrderCategory;
  restaurant: string;
  meal_description: string;
  quantity: number;
  published_at: Date;
  accepted_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
  publisher?: User;
  accepter?: User;
}

export enum OrderStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum OrderCategory {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  SNACK = "snack",
}

// API请求/响应类型
export interface CreateOrderRequest {
  delivery_address: string;
  tip?: number;
  meal_cost: number;
  category: OrderCategory;
  restaurant: string;
  meal_description: string;
  quantity?: number;
}

export interface UpdateOrderRequest {
  delivery_address?: string;
  tip?: number;
  meal_cost?: number;
  restaurant?: string;
  meal_description?: string;
  quantity?: number;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  category?: OrderCategory;
  publisher_id?: number;
  accepter_id?: number;
  search?: string;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  data?: Order;
}

export interface OrderListResponse {
  success: boolean;
  message?: string;
  data?: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
