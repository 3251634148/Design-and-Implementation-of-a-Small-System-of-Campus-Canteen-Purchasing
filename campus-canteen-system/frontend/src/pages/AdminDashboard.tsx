import {
  AuditOutlined,
  CustomerServiceOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Statistic, Timeline } from "antd";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { adminService, type DashboardStats, type SystemActivity } from "../services/adminService";
import { useAuthStore } from "../stores/authStore";

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<SystemActivity[]>([]);

  // 加载统计数据
  const loadStats = async () => {
    try {
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error("加载统计数据失败:", error);
    }
  };

  // 加载系统活动
  const loadActivities = async () => {
    try {
      const response = await adminService.getSystemLogs({ limit: 10 });
      setActivities(response.activities);
    } catch (error) {
      console.error("加载系统活动失败:", error);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      loadStats();
      loadActivities();
    }
  }, [user]);

  if (!user?.is_admin) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <h2>访问被拒绝</h2>
        <p>您没有管理员权限访问此页面。</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div style={{ width: "100%", maxWidth: "100%" }}>
        <h1>管理员仪表板</h1>

        {/* 统计卡片 */}
        {stats && (
          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="用户统计"
                  value={stats.users.total}
                  prefix={<UserOutlined />}
                  suffix={
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      活跃: {stats.users.active} | 冻结: {stats.users.frozen}
                    </div>
                  }
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="订单统计"
                  value={stats.orders.total}
                  prefix={<ShoppingCartOutlined />}
                  suffix={
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      待处理: {stats.orders.pending} | 已完成: {stats.orders.completed} | 已取消:{" "}
                      {stats.orders.cancelled}
                    </div>
                  }
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="服务统计"
                  value={stats.services.total}
                  prefix={<ToolOutlined />}
                  suffix={
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      活跃: {stats.services.active} | 暂停: {stats.services.inactive}
                    </div>
                  }
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="投诉统计"
                  value={stats.complaints.total}
                  prefix={<CustomerServiceOutlined />}
                  suffix={
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      待处理: {stats.complaints.pending} | 已解决: {stats.complaints.resolved}
                    </div>
                  }
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* 快速操作 */}
        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Card title="快速操作">
              <Row gutter={16}>
                <Col span={6}>
                  <Card
                    hoverable
                    style={{ textAlign: "center", cursor: "pointer" }}
                    onClick={() => navigate("/admin/registration-review")}
                  >
                    <AuditOutlined
                      style={{ fontSize: "32px", color: "#1890ff", marginBottom: "12px" }}
                    />
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>注册审核</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                      审核学生注册申请
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card
                    hoverable
                    style={{ textAlign: "center", cursor: "pointer" }}
                    onClick={() => navigate("/admin/users")}
                  >
                    <UserOutlined
                      style={{ fontSize: "32px", color: "#52c41a", marginBottom: "12px" }}
                    />
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>用户管理</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                      管理系统用户
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card
                    hoverable
                    style={{ textAlign: "center", cursor: "pointer" }}
                    onClick={() => navigate("/complaints")}
                  >
                    <CustomerServiceOutlined
                      style={{ fontSize: "32px", color: "#faad14", marginBottom: "12px" }}
                    />
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>投诉处理</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                      处理用户投诉
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card
                    hoverable
                    style={{ textAlign: "center", cursor: "pointer" }}
                    onClick={() => navigate("/orders")}
                  >
                    <ShoppingCartOutlined
                      style={{ fontSize: "32px", color: "#f5222d", marginBottom: "12px" }}
                    />
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>订单监控</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                      监控系统订单
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            {/* 系统活动预览 */}
            <Card
              title="系统活动"
              style={{ height: "600px" }}
              extra={
                <Button type="link" onClick={() => navigate("/admin/system-logs")}>
                  查看全部
                </Button>
              }
            >
              <div style={{ height: "520px", overflow: "auto" }}>
                <Timeline>
                  {activities.map((activity, index) => (
                    <Timeline.Item key={index}>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                      <div>{activity.message}</div>
                      {activity.user && (
                        <div style={{ fontSize: "12px", color: "#999" }}>用户: {activity.user}</div>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
