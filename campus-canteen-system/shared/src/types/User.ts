export interface User {
  id: number;
  username: string;
  is_admin: boolean;
  is_frozen: boolean;
  credit_score: number;
  created_at: Date;
  updated_at: Date;
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
  gender?: Gender;
  created_at: Date;
  updated_at: Date;
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

// API请求/响应类型
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
  gender?: Gender;
  is_admin?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<User, "password">;
    token: string;
  };
}

export interface UserProfileResponse {
  success: boolean;
  message?: string;
  data?: Omit<User, "password">;
}

export interface UpdateProfileRequest {
  student_card_id?: string;
  name?: string;
  grade?: string;
  institute?: string;
  contact_way?: string;
  email?: string;
  gender?: Gender;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
