import {
  AuditOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from "antd";
import type React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <span style={{ whiteSpace: "nowrap" }}>首页</span>,
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: <span style={{ whiteSpace: "nowrap" }}>订单管理</span>,
      onClick: () => navigate("/orders"),
    },
    {
      key: "/services",
      icon: <ToolOutlined />,
      label: <span style={{ whiteSpace: "nowrap" }}>服务管理</span>,
      onClick: () => navigate("/services"),
    },
    {
      key: "/complaints",
      icon: <CustomerServiceOutlined />,
      label: <span style={{ whiteSpace: "nowrap" }}>投诉管理</span>,
      onClick: () => navigate("/complaints"),
    },
  ];

  if (user?.is_admin) {
    menuItems.push({
      key: "/admin",
      icon: <SettingOutlined />,
      label: <span style={{ whiteSpace: "nowrap" }}>管理后台</span>,
      children: [
        {
          key: "/admin",
          icon: <DashboardOutlined />,
          label: <span style={{ whiteSpace: "nowrap" }}>仪表板</span>,
          onClick: () => navigate("/admin"),
        },
        {
          key: "/admin/registration-review",
          icon: <AuditOutlined />,
          label: <span style={{ whiteSpace: "nowrap" }}>注册审核</span>,
          onClick: () => navigate("/admin/registration-review"),
        },
        {
          key: "/admin/users",
          icon: <TeamOutlined />,
          label: <span style={{ whiteSpace: "nowrap" }}>用户管理</span>,
          onClick: () => navigate("/admin"),
        },
        {
          key: "/admin/system-logs",
          icon: <FileTextOutlined />,
          label: <span style={{ whiteSpace: "nowrap" }}>系统日志</span>,
          onClick: () => navigate("/admin/system-logs"),
        },
      ],
    });
  }

  const userMenuItems = [
    {
      key: "profile",
      label: "个人信息",
      icon: <UserOutlined />,
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

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
          position: "fixed",
          width: "100%",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#1890ff", marginRight: "24px" }}>校园食堂代买餐平台</h2>
        </div>

        <Space>
          <Text strong>{user?.profile?.name || user?.username}</Text>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={<Avatar size="small" icon={<UserOutlined />} />}>
              {user?.is_admin && <span style={{ color: "#f5222d", fontSize: "12px" }}>管理员</span>}
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Layout style={{ marginTop: 64 }}>
        <Sider
          width={240}
          style={{
            background: "#fff",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            minWidth: "240px",
            maxWidth: "300px",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{
              height: "100%",
              borderRight: 0,
              fontSize: "14px",
              lineHeight: "40px",
            }}
            items={menuItems}
          />
        </Sider>

        <Layout style={{ width: "100%" }}>
          <Content
            style={{
              padding: "24px",
              background: "#f0f2f5",
              minHeight: "calc(100vh - 64px)",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <div style={{ width: "100%", maxWidth: "100%" }}>{children}</div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
