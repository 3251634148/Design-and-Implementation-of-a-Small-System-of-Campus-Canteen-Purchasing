import api from "./api";

// 类型定义
export interface User {
  id: number;
  username: string;
  is_admin: boolean;
  is_frozen: boolean;
  credit_score?: number;
  created_at: string;
  profile?: StudentProfile;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  student_card_id: string;
  name: string;
  grade?: string;
  institute?: string;
  contact_way?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  student_card_id: string;
  name: string;
  grade?: string;
  institute?: string;
  contact_way?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  is_admin?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// 认证服务类
export class AuthService {
  // 登录
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  }

  // 注册
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response.data;
  }

  // 获取用户信息
  static async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>("/auth/profile");
    return response.data;
  }

  // 更新用户信息
  static async updateProfile(
    profileData: Partial<StudentProfile>
  ): Promise<ApiResponse<StudentProfile>> {
    const response = await api.put<ApiResponse<StudentProfile>>("/auth/profile", profileData);
    return response.data;
  }

  // 修改密码
  static async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  }

  // 刷新token
  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await api.post<ApiResponse<{ token: string }>>("/auth/refresh-token");
    return response.data;
  }

  // 登出
  static async logout(): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>("/auth/logout");
    return response.data;
  }

  // 注销账户
  static async deactivateAccount(): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>("/auth/deactivate");
    return response.data;
  }

  // 本地存储操作
  static saveToken(token: string): void {
    localStorage.setItem("token", token);
  }

  static getToken(): string | null {
    return localStorage.getItem("token");
  }

  static removeToken(): void {
    localStorage.removeItem("token");
  }

  static saveUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  static removeUser(): void {
    localStorage.removeItem("user");
  }

  static clearAuth(): void {
    AuthService.removeToken();
    AuthService.removeUser();
  }

  static isAuthenticated(): boolean {
    return !!AuthService.getToken();
  }
}

export default AuthService;
