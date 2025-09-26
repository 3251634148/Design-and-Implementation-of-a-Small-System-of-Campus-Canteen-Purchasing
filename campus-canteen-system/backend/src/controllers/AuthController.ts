import * as bcrypt from "bcrypt";
import { validate } from "class-validator";
import type { Request, Response } from "express";
import * as fs from "fs";
import * as multer from "multer";
import * as path from "path";
import { AppDataSource } from "../config/database";
import { ApplicationStatus, RegistrationApplication } from "../entities/RegistrationApplication";
import { AuthService, type LoginData, type RegisterData } from "../services/AuthService";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // 用户注册
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        username,
        password,
        student_card_id,
        name,
        grade,
        institute,
        contact_way,
        email,
        gender,
        is_admin,
      }: RegisterData = req.body;

      // 基本验证
      if (!username || !password || !student_card_id || !name) {
        res.status(400).json({
          success: false,
          message: "用户名、密码、校园卡号和姓名为必填项",
        });
        return;
      }

      // 密码强度验证
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "密码长度至少为6位",
        });
        return;
      }

      const registerData: RegisterData = {
        username,
        password,
        student_card_id,
        name,
        grade,
        institute,
        contact_way,
        email,
        gender,
        is_admin: is_admin || false,
      };

      const result = await this.authService.register(registerData);

      res.status(201).json({
        success: true,
        message: "注册成功",
        data: {
          user: {
            id: result.user.id,
            username: result.user.username,
            is_admin: result.user.is_admin,
            profile: result.user.profile,
          },
          token: result.token,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "注册失败",
      });
    }
  };

  // 用户登录
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password }: LoginData = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: "用户名和密码为必填项",
        });
        return;
      }

      const result = await this.authService.login({ username, password });

      res.json({
        success: true,
        message: "登录成功",
        data: {
          user: {
            id: result.user.id,
            username: result.user.username,
            is_admin: result.user.is_admin,
            is_frozen: result.user.is_frozen,
            profile: result.user.profile,
          },
          token: result.token,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : "登录失败",
      });
    }
  };

  // 获取用户信息
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const user = await this.authService.getUserProfile(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "用户不存在",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          is_admin: user.is_admin,
          is_frozen: user.is_frozen,
          profile: user.profile,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取用户信息失败",
      });
    }
  };

  // 更新用户信息
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { student_card_id, name, grade, institute, contact_way, email, gender } = req.body;

      const profileData = {
        student_card_id,
        name,
        grade,
        institute,
        contact_way,
        email,
        gender,
      };

      // 移除undefined值
      Object.keys(profileData).forEach((key) => {
        if (profileData[key as keyof typeof profileData] === undefined) {
          delete profileData[key as keyof typeof profileData];
        }
      });

      const updatedProfile = await this.authService.updateProfile(req.user.userId, profileData);

      res.json({
        success: true,
        message: "更新成功",
        data: updatedProfile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "更新失败",
      });
    }
  };

  // 修改密码
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: "原密码和新密码为必填项",
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: "新密码长度至少为6位",
        });
        return;
      }

      await this.authService.changePassword(req.user.userId, oldPassword, newPassword);

      res.json({
        success: true,
        message: "密码修改成功",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "密码修改失败",
      });
    }
  };

  // 刷新token
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      const newToken = await this.authService.refreshToken(req.user.userId);

      res.json({
        success: true,
        message: "Token刷新成功",
        data: {
          token: newToken,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Token刷新失败",
      });
    }
  };

  // 登出（客户端处理，服务端只返回成功消息）
  logout = async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      message: "登出成功",
    });
  };

  // 提交注册申请
  submitRegistrationApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        username,
        password,
        student_card_id,
        name,
        grade,
        institute,
        contact_way,
        email,
        gender,
      } = req.body;

      // 基本验证
      if (!username || !password || !student_card_id || !name) {
        res.status(400).json({
          success: false,
          message: "用户名、密码、校园卡号和姓名为必填项",
        });
        return;
      }

      // 密码强度验证
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "密码长度至少为6位",
        });
        return;
      }

      const applicationRepository = AppDataSource.getRepository(RegistrationApplication);

      // 检查用户名是否已存在（包括已注册用户和待审核申请）
      const existingApplication = await applicationRepository.findOne({
        where: { username },
      });

      if (existingApplication) {
        res.status(400).json({
          success: false,
          message: "用户名已存在或已有待审核申请",
        });
        return;
      }

      // 检查校园卡号是否已存在
      const existingCardId = await applicationRepository.findOne({
        where: { student_card_id },
      });

      if (existingCardId) {
        res.status(400).json({
          success: false,
          message: "校园卡号已存在或已有待审核申请",
        });
        return;
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 处理上传的文件
      let student_photo_url: string | undefined;
      if (req.file) {
        // 确保上传目录存在
        const uploadDir = path.join(__dirname, "../../uploads/student_photos");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 生成唯一文件名
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // 保存文件
        fs.writeFileSync(filePath, req.file.buffer);
        student_photo_url = `/uploads/student_photos/${fileName}`;
      }

      // 创建注册申请
      const application = applicationRepository.create({
        username,
        password: hashedPassword,
        student_card_id,
        name,
        grade,
        institute,
        contact_way,
        email,
        gender,
        student_photo_url,
        status: ApplicationStatus.PENDING,
      });

      await applicationRepository.save(application);

      res.status(201).json({
        success: true,
        message: "注册申请已提交，请等待管理员审核",
        applicationId: application.id,
      });
    } catch (error) {
      console.error("提交注册申请失败:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "提交注册申请失败",
      });
    }
  };

  // 注销账户
  deactivateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "未认证",
        });
        return;
      }

      await this.authService.deactivateAccount(req.user.userId);

      res.json({
        success: true,
        message: "账户注销成功",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "账户注销失败",
      });
    }
  };
}
