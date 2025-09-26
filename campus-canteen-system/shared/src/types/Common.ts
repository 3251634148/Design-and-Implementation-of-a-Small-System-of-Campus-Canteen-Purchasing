// 通用API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// 分页查询参数
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

// 分页响应数据
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 错误响应
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  code?: string;
  details?: any;
}

// JWT载荷
export interface JWTPayload {
  userId: number;
  username: string;
  is_admin: boolean;
  is_frozen: boolean;
  iat?: number;
  exp?: number;
}

// 文件上传响应
export interface FileUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    filename: string;
    originalName: string;
    size: number;
    url: string;
  };
}

// 统计数据接口
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
