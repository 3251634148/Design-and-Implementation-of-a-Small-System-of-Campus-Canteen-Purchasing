import api from "./api";

export interface OrderStats {
  publishedCount: number;
  acceptedCount: number;
  completedCount: number;
  published?: number;
  accepted?: number;
  totalCompleted?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const orderService = {
  // 获取用户订单统计
  async getUserOrderStats(): Promise<OrderStats> {
    const response = await api.get("/orders/my/stats");
    const data = response.data.data;

    // 映射后端数据到前端期望的格式
    return {
      publishedCount: data.published || 0,
      acceptedCount: data.accepted || 0,
      completedCount: data.totalCompleted || 0,
      published: data.published,
      accepted: data.accepted,
      totalCompleted: data.totalCompleted,
    };
  },
};
