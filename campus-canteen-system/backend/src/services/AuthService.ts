import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import type { StudentProfile } from "../entities/StudentProfile";
import type { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

export interface RegisterData {
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

export interface LoginData {
  username: string;
  password: string;
}

export interface JWTPayload {
  userId: number;
  username: string;
  is_admin: boolean;
  is_frozen: boolean;
  isAdmin?: boolean; // 添加别名以便使用
}

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findByUsername(data.username);
    if (existingUser) {
      throw new Error("用户名已存在");
    }

    // 检查校园卡号是否已存在
    const cardExists = await this.userRepository.checkStudentCardExists(data.student_card_id);
    if (cardExists) {
      throw new Error("校园卡号已存在");
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 创建用户数据
    const userData: Partial<User> = {
      username: data.username,
      password: hashedPassword,
      is_admin: data.is_admin || false,
      is_frozen: false,
      credit_score: 100,
    };

    // 创建学生信息数据
    const profileData: Partial<StudentProfile> = {
      student_card_id: data.student_card_id,
      name: data.name,
      grade: data.grade,
      institute: data.institute,
      contact_way: data.contact_way,
      email: data.email,
      gender: data.gender as any,
    };

    // 创建用户
    const user = await this.userRepository.create(userData, profileData);

    // 生成JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(data: LoginData): Promise<{ user: User; token: string }> {
    // 查找用户
    const user = await this.userRepository.findByUsername(data.username);
    if (!user) {
      throw new Error("用户名或密码错误");
    }

    // 检查用户是否被冻结
    if (user.is_frozen) {
      throw new Error("账户已被冻结，请联系管理员");
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("用户名或密码错误");
    }

    // 生成JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  async getUserProfile(userId: number): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }

  async updateProfile(
    userId: number,
    profileData: Partial<StudentProfile>
  ): Promise<StudentProfile | null> {
    // 如果更新校园卡号，检查是否已存在
    if (profileData.student_card_id) {
      const cardExists = await this.userRepository.checkStudentCardExists(
        profileData.student_card_id,
        userId
      );
      if (cardExists) {
        throw new Error("校园卡号已存在");
      }
    }

    return await this.userRepository.updateProfile(userId, profileData);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("用户不存在");
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error("原密码错误");
    }

    // 哈希新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    const updatedUser = await this.userRepository.update(userId, {
      password: hashedNewPassword,
    });
    return !!updatedUser;
  }

  generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      is_admin: user.is_admin,
      is_frozen: user.is_frozen,
      isAdmin: user.is_admin,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new Error("无效的token");
    }
  }

  async refreshToken(userId: number): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("用户不存在");
    }

    if (user.is_frozen) {
      throw new Error("账户已被冻结");
    }

    return this.generateToken(user);
  }

  async deactivateAccount(userId: number): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("用户不存在");
    }

    // 删除用户账户（软删除或硬删除，这里使用硬删除）
    const deleted = await this.userRepository.delete(userId);
    return deleted;
  }
}
