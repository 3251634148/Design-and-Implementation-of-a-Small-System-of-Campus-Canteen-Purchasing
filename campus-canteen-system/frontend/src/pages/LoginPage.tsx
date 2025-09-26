import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, message, Typography } from "antd";
import type React from "react";
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const { Title } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError, isAuthenticated, user, initializeAuth } =
    useAuthStore();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化认证状态
  useEffect(() => {
    const cleanup = initializeAuth();
    return cleanup;
  }, [initializeAuth]);

  // 如果已经登录，重定向到主页，添加防抖
  useEffect(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    if (isAuthenticated && user) {
      redirectTimeoutRef.current = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100); // 100ms 防抖
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user, navigate]);

  // 清除错误信息
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onFinish = async (values: LoginForm) => {
    try {
      const success = await login(values);
      if (success) {
        message.success("登录成功！");
        form.resetFields();
        navigate("/dashboard");
      }
    } catch (error) {
      // 错误已经在store中处理
    }
  };

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
          width: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: "8px" }}>
            校园食堂代买餐平台
          </Title>
          <p style={{ color: "#666", fontSize: "14px" }}>便捷的校园餐饮代购服务</p>
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

        <Form form={form} name="login" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "请输入用户名!" },
              { min: 3, message: "用户名至少3个字符!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "请输入密码!" },
              { min: 6, message: "密码至少6个字符!" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ width: "100%", height: "40px" }}
            >
              登录
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
            <span style={{ color: "#666" }}>还没有账号？</span>
            <Link to="/register" style={{ marginLeft: "8px" }}>
              立即注册
            </Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
