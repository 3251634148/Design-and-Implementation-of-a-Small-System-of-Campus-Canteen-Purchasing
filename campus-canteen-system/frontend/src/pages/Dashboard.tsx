import {
  CloseOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  LockOutlined,
  LogoutOutlined,
  PlusOutlined,
  SaveOutlined,
  SettingOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Layout,
  Modal,
  message,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService, type StudentProfile } from "../services/authService";
import { type OrderStats, orderService } from "../services/orderService";
import { useAuthStore } from "../stores/authStore";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated, initializeAuth, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化认证状态
  useEffect(() => {
    const cleanup = initializeAuth();
    return cleanup;
  }, [initializeAuth]);

  // 认证检查，添加防抖避免无限循环
  useEffect(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    if (!isAuthenticated && !user) {
      redirectTimeoutRef.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100); // 100ms 防抖
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user, navigate]);

  // 获取订单统计数据
  useEffect(() => {
    const fetchOrderStats = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const stats = await orderService.getUserOrderStats();
        setOrderStats(stats);
      } catch (error) {
        console.error("获取订单统计失败:", error);
        message.error("获取订单统计失败");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    message.success("已退出登录");
    navigate("/login");
  };

  // 打开编辑模态框
  const handleEditProfile = () => {
    if (user?.profile) {
      form.setFieldsValue({
        name: user.profile.name,
        grade: user.profile.grade,
        institute: user.profile.institute,
        contact_way: user.profile.contact_way,
        email: user.profile.email,
        gender: user.profile.gender,
      });
    }
    setEditModalVisible(true);
  };

  // 保存个人信息
  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      setEditLoading(true);

      // 验证个人信息合法性
      if (values.contact_way && !/^1[3-9]\d{9}$/.test(values.contact_way)) {
        message.error("请输入正确的手机号码");
        return;
      }

      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        message.error("请输入正确的邮箱地址");
        return;
      }

      if (values.name && (values.name.length < 2 || values.name.length > 10)) {
        message.error("姓名长度应在2-10个字符之间");
        return;
      }

      // 调用API更新个人信息
      const response = await AuthService.updateProfile(values);
      if (response.success && response.data) {
        // 更新本地用户信息
        const updatedUser = {
          ...user!,
          profile: {
            ...user!.profile!,
            ...response.data,
          },
        };
        updateUser(updatedUser);
        message.success("个人信息更新成功");
        setEditModalVisible(false);
      } else {
        message.error(response.message || "更新失败");
      }
    } catch (error: any) {
      console.error("更新个人信息失败:", error);
      message.error(error.message || "更新失败，请重试");
    } finally {
      setEditLoading(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    form.resetFields();
    setEditModalVisible(false);
  };

  // 打开修改密码模态框
  const handleChangePassword = () => {
    setPasswordModalVisible(true);
  };

  // 保存新密码
  const handleSavePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPasswordLoading(true);

      const response = await AuthService.changePassword(values.oldPassword, values.newPassword);
      if (response.success) {
        message.success("密码修改成功");
        passwordForm.resetFields();
        setPasswordModalVisible(false);
      } else {
        message.error(response.message || "密码修改失败");
      }
    } catch (error: any) {
      console.error("修改密码失败:", error);
      message.error(error.message || "密码修改失败，请重试");
    } finally {
      setPasswordLoading(false);
    }
  };

  // 取消修改密码
  const handleCancelPassword = () => {
    passwordForm.resetFields();
    setPasswordModalVisible(false);
  };

  // 打开注销账户模态框
  const handleDeactivateAccount = () => {
    setDeactivateModalVisible(true);
  };

  // 确认注销账户
  const handleConfirmDeactivate = async () => {
    try {
      setDeactivateLoading(true);
      const response = await AuthService.deactivateAccount();
      if (response.success) {
        message.success("账户注销成功");
        logout();
        navigate("/login");
      } else {
        message.error(response.message || "账户注销失败");
      }
    } catch (error: any) {
      console.error("账户注销失败:", error);
      message.error(error.message || "账户注销失败，请重试");
    } finally {
      setDeactivateLoading(false);
      setDeactivateModalVisible(false);
    }
  };

  // 取消注销账户
  const handleCancelDeactivate = () => {
    setDeactivateModalVisible(false);
  };

  if (!user) {
    return <div>加载中...</div>;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
          校园食堂代买餐平台
        </Title>
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{user.profile?.name || user.username}</Text>
          {user.is_admin && <Tag color="red">管理员</Tag>}
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: "24px", background: "#f0f2f5" }}>
        <Row gutter={[24, 24]}>
          {/* 用户信息卡片 */}
          <Col xs={24} lg={8}>
            <Card
              title="个人信息"
              extra={
                <Button type="link" icon={<EditOutlined />} onClick={handleEditProfile}>
                  编辑
                </Button>
              }
              style={{ height: "100%" }}
            >
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <Avatar size={80} icon={<UserOutlined />} />
                <Title level={4} style={{ marginTop: "12px", marginBottom: "4px" }}>
                  {user.profile?.name || user.username}
                </Title>
                <Text type="secondary">{user.profile?.student_card_id}</Text>
              </div>

              <Descriptions column={1} size="small">
                <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
                <Descriptions.Item label="年级">
                  {user.profile?.grade || "未设置"}
                </Descriptions.Item>
                <Descriptions.Item label="学院">
                  {user.profile?.institute || "未设置"}
                </Descriptions.Item>
                <Descriptions.Item label="联系方式">
                  {user.profile?.contact_way || "未设置"}
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  {user.profile?.email || "未设置"}
                </Descriptions.Item>
                <Descriptions.Item label="性别">
                  {user.profile?.gender === "male"
                    ? "男"
                    : user.profile?.gender === "female"
                      ? "女"
                      : user.profile?.gender === "other"
                        ? "其他"
                        : "未设置"}
                </Descriptions.Item>
                <Descriptions.Item label="注册时间">
                  {new Date(user.created_at).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="default"
                    icon={<KeyOutlined />}
                    onClick={handleChangePassword}
                    style={{ width: "100%" }}
                  >
                    修改密码
                  </Button>
                  <Button
                    type="default"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeactivateAccount}
                    style={{ width: "100%" }}
                  >
                    注销账户
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>

          {/* 快速操作 */}
          <Col xs={24} lg={16}>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card title="快速操作">
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <Card
                        hoverable
                        style={{ textAlign: "center" }}
                        styles={{ body: { padding: "20px" } }}
                        onClick={() => navigate("/orders?tab=create")}
                      >
                        <PlusOutlined
                          style={{
                            fontSize: "24px",
                            color: "#1890ff",
                            marginBottom: "8px",
                          }}
                        />
                        <div>发布订单</div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        hoverable
                        style={{ textAlign: "center" }}
                        styles={{ body: { padding: "20px" } }}
                        onClick={() => navigate("/orders")}
                      >
                        <UnorderedListOutlined
                          style={{
                            fontSize: "24px",
                            color: "#52c41a",
                            marginBottom: "8px",
                          }}
                        />
                        <div>查看订单</div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        hoverable
                        style={{ textAlign: "center" }}
                        styles={{ body: { padding: "20px" } }}
                        onClick={() => navigate("/services")}
                      >
                        <ToolOutlined
                          style={{
                            fontSize: "24px",
                            color: "#faad14",
                            marginBottom: "8px",
                          }}
                        />
                        <div>我的服务</div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card
                        hoverable
                        style={{ textAlign: "center" }}
                        styles={{ body: { padding: "20px" } }}
                        onClick={() => navigate("/complaints")}
                      >
                        <CustomerServiceOutlined
                          style={{
                            fontSize: "24px",
                            color: "#f5222d",
                            marginBottom: "8px",
                          }}
                        />
                        <div>投诉建议</div>
                      </Card>
                    </Col>
                    {user.is_admin && (
                      <Col xs={12} sm={6}>
                        <Card
                          hoverable
                          style={{ textAlign: "center" }}
                          styles={{ body: { padding: "20px" } }}
                          onClick={() => navigate("/admin")}
                        >
                          <SettingOutlined
                            style={{
                              fontSize: "24px",
                              color: "#722ed1",
                              marginBottom: "8px",
                            }}
                          />
                          <div>管理后台</div>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Col>

              {/* 统计信息 */}
              <Col xs={24}>
                <Card title="我的统计">
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Spin size="large" />
                    </div>
                  ) : (
                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={6}>
                        <div style={{ textAlign: "center" }}>
                          <Title level={2} style={{ color: "#1890ff", margin: 0 }}>
                            {orderStats?.publishedCount || 0}
                          </Title>
                          <Text type="secondary">发布的订单</Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div style={{ textAlign: "center" }}>
                          <Title level={2} style={{ color: "#52c41a", margin: 0 }}>
                            {orderStats?.acceptedCount || 0}
                          </Title>
                          <Text type="secondary">接受的订单</Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div style={{ textAlign: "center" }}>
                          <Title level={2} style={{ color: "#faad14", margin: 0 }}>
                            {orderStats?.completedCount || 0}
                          </Title>
                          <Text type="secondary">完成的订单</Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div style={{ textAlign: "center" }}>
                          <Title level={2} style={{ color: "#52c41a", margin: 0 }}>
                            {user?.credit_score || 100}
                          </Title>
                          <Text type="secondary">信用评分</Text>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card>
              </Col>

              {/* 最近活动 */}
              <Col xs={24}>
                <Card title="最近活动">
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "#999",
                    }}
                  >
                    <UnorderedListOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
                    <div>暂无活动记录</div>
                    <Text type="secondary">开始使用平台来查看您的活动记录</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>

      {/* 编辑个人信息模态框 */}
      <Modal
        title="编辑个人信息"
        open={editModalVisible}
        onCancel={handleCancelEdit}
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={editLoading}
            onClick={handleSaveProfile}
            icon={<SaveOutlined />}
          >
            保存
          </Button>,
        ]}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: "20px" }}>
          <Form.Item
            label="真实姓名"
            name="name"
            rules={[
              { required: true, message: "请输入真实姓名!" },
              { min: 2, message: "姓名至少2个字符!" },
              { max: 10, message: "姓名最多10个字符!" },
            ]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>

          <Form.Item label="年级" name="grade">
            <Select placeholder="请选择年级" allowClear>
              <Select.Option value="大一">大一</Select.Option>
              <Select.Option value="大二">大二</Select.Option>
              <Select.Option value="大三">大三</Select.Option>
              <Select.Option value="大四">大四</Select.Option>
              <Select.Option value="研一">研一</Select.Option>
              <Select.Option value="研二">研二</Select.Option>
              <Select.Option value="研三">研三</Select.Option>
              <Select.Option value="博士">博士</Select.Option>
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
            <Input placeholder="请输入手机号码" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ type: "email", message: "请输入正确的邮箱地址!" }]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item label="性别" name="gender">
            <Select placeholder="请选择性别" allowClear>
              <Select.Option value="male">男</Select.Option>
              <Select.Option value="female">女</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={handleCancelPassword}
        footer={[
          <Button key="cancel" onClick={handleCancelPassword}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={passwordLoading}
            onClick={handleSavePassword}
            icon={<LockOutlined />}
          >
            确认修改
          </Button>,
        ]}
        width={500}
      >
        <Form form={passwordForm} layout="vertical" style={{ marginTop: "20px" }}>
          <Form.Item
            label="当前密码"
            name="oldPassword"
            rules={[{ required: true, message: "请输入当前密码!" }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: "请输入新密码!" },
              { min: 6, message: "密码至少6个字符!" },
              { max: 20, message: "密码最多20个字符!" },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请确认新密码!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 注销账户模态框 */}
      <Modal
        title="注销账户"
        open={deactivateModalVisible}
        onCancel={handleCancelDeactivate}
        footer={[
          <Button key="cancel" onClick={handleCancelDeactivate}>
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={deactivateLoading}
            onClick={handleConfirmDeactivate}
            icon={<DeleteOutlined />}
          >
            确认注销
          </Button>,
        ]}
        width={500}
      >
        <div style={{ padding: "20px 0" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <DeleteOutlined style={{ fontSize: "48px", color: "#ff4d4f" }} />
          </div>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Title level={4} style={{ color: "#ff4d4f" }}>
              确认注销账户？
            </Title>
            <Text type="secondary">
              注销后您将无法再使用此账户登录系统，所有相关数据将被删除且无法恢复。
            </Text>
          </div>
          <div
            style={{
              background: "#fff2f0",
              padding: "16px",
              borderRadius: "6px",
              border: "1px solid #ffccc7",
            }}
          >
            <Text strong style={{ color: "#cf1322" }}>
              注意事项：
            </Text>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
              <li>
                <Text type="secondary">账户注销后无法恢复</Text>
              </li>
              <li>
                <Text type="secondary">所有订单记录将被删除</Text>
              </li>
              <li>
                <Text type="secondary">个人信息将被永久清除</Text>
              </li>
              <li>
                <Text type="secondary">如有未完成的订单，请先处理完毕</Text>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
