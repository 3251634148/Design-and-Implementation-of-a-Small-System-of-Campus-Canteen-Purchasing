import {
  CameraOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, message, Select, Typography, Upload } from "antd";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { RegisterRequest } from "../services/authService";
import { useAuthStore } from "../stores/authStore";

const { Title } = Typography;
const { Option } = Select;

interface RegisterForm extends RegisterRequest {}

const RegisterPage: React.FC = () => {
  const { submitRegistrationApplication, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // 如果已经登录，重定向到主页
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // 清除错误信息
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // 文件上传处理
  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList];

    // 限制只能上传一个文件
    newFileList = newFileList.slice(-1);

    // 限制文件大小为5MB
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);
  };

  // 上传前的验证
  const beforeUpload = (file: any) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("只能上传图片文件!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("图片大小不能超过5MB!");
      return false;
    }

    return true;
  };

  const onFinish = async (values: RegisterForm) => {
    try {
      // 检查是否上传了学生身份照片
      if (fileList.length === 0) {
        message.error("请上传学生身份照片!");
        return;
      }

      // 移除确认密码字段，准备申请数据
      const { confirmPassword, ...applicationData } = values as any;

      // 添加照片文件到申请数据
      const submitData = {
        ...applicationData,
        student_photo: fileList[0]?.originFileObj || undefined,
      };

      const success = await submitRegistrationApplication(submitData);
      if (success) {
        message.success("注册申请已提交，请等待管理员审核！");
        form.resetFields();
        setFileList([]);
        // 显示成功页面而不是跳转到登录页面
        setSubmissionSuccess(true);
      }
    } catch (error) {
      // 错误已经在store中处理
    }
  };

  // 如果提交成功，显示成功页面
  if (submissionSuccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ padding: "40px 20px" }}>
            <div style={{ fontSize: "48px", color: "#52c41a", marginBottom: "20px" }}>✓</div>
            <Title level={2} style={{ color: "#52c41a", marginBottom: "16px" }}>
              注册申请已提交
            </Title>
            <p style={{ color: "#666", fontSize: "16px", marginBottom: "24px" }}>
              您的注册申请已成功提交，我们会尽快处理您的申请。
            </p>
            <Alert
              message="审核说明"
              description="管理员将在1-3个工作日内审核您的申请，审核结果将通过邮箱或短信通知您。请耐心等待。"
              type="info"
              showIcon
              style={{ marginBottom: "24px", textAlign: "left" }}
            />
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/login")}
              style={{ width: "200px" }}
            >
              返回登录页面
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: "8px" }}>
            注册申请
          </Title>
          <p style={{ color: "#666", fontSize: "14px" }}>
            提交注册申请，等待管理员审核后即可使用平台
          </p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: "20px" }}
          />
        )}

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: "请输入用户名!" },
              { min: 3, message: "用户名至少3个字符!" },
              { max: 20, message: "用户名最多20个字符!" },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "用户名只能包含字母、数字和下划线!",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: "请输入密码!" },
              { min: 6, message: "密码至少6个字符!" },
              { max: 20, message: "密码最多20个字符!" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致!"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item
            label="校园卡号"
            name="student_card_id"
            rules={[
              { required: true, message: "请输入校园卡号!" },
              { pattern: /^\d{6,20}$/, message: "校园卡号应为6-20位数字!" },
            ]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="请输入校园卡号" />
          </Form.Item>

          <Form.Item
            label="真实姓名"
            name="name"
            rules={[
              { required: true, message: "请输入真实姓名!" },
              { min: 2, message: "姓名至少2个字符!" },
              { max: 10, message: "姓名最多10个字符!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入真实姓名" />
          </Form.Item>

          <Form.Item label="年级" name="grade">
            <Select placeholder="请选择年级">
              <Option value="大一">大一</Option>
              <Option value="大二">大二</Option>
              <Option value="大三">大三</Option>
              <Option value="大四">大四</Option>
              <Option value="研一">研一</Option>
              <Option value="研二">研二</Option>
              <Option value="研三">研三</Option>
              <Option value="博士">博士</Option>
            </Select>
          </Form.Item>

          <Form.Item label="学院" name="institute">
            <Input placeholder="请输入学院名称" />
          </Form.Item>

          <Form.Item
            label="联系方式"
            name="contact_way"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码!" }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号码" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ type: "email", message: "请输入正确的邮箱地址!" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item label="性别" name="gender">
            <Select placeholder="请选择性别">
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="学生身份照片"
            name="studentPhoto"
            rules={[{ required: true, message: "请上传学生身份照片!" }]}
            extra="请上传学生证或校园卡照片，用于身份验证（支持jpg、png格式，大小不超过5MB）"
          >
            <Upload
              name="studentPhoto"
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              customRequest={({ onSuccess }) => {
                // 自定义上传，暂时不实际上传到服务器
                setTimeout(() => {
                  onSuccess && onSuccess("ok");
                }, 0);
              }}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <CameraOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
                  <div>上传照片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ width: "100%", height: "40px" }}
            >
              提交申请
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
            <span style={{ color: "#666" }}>已有账号？</span>
            <Link to="/login" style={{ marginLeft: "8px" }}>
              立即登录
            </Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
