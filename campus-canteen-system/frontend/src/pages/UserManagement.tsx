import {
  ArrowLeftOutlined,
  CrownOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { type AdminUser, adminService } from "../services/adminService";
import { useAuthStore } from "../stores/authStore";

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersTotal, setUsersTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  // 筛选状态
  const [filters, setFilters] = useState({
    is_admin: undefined as boolean | undefined,
    is_frozen: undefined as boolean | undefined,
    search: "",
  });

  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers({
        page: currentPage,
        limit: pageSize,
        ...filters,
      });
      setUsers(response.users);
      setUsersTotal(response.total);
    } catch (error) {
      message.error("加载用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      loadUsers();
    }
  }, [user, currentPage, pageSize, filters]);

  // 冻结/解冻用户
  const handleToggleFreeze = async (userId: number) => {
    try {
      const result = await adminService.toggleUserFreeze(userId);
      message.success(result.is_frozen ? "用户已冻结" : "用户已解冻");
      loadUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "操作失败");
    }
  };

  // 设置/取消管理员
  const handleToggleAdmin = async (userId: number) => {
    try {
      const result = await adminService.toggleUserAdmin(userId);
      message.success(result.is_admin ? "已设置为管理员" : "已取消管理员权限");
      loadUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "操作失败");
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    try {
      await adminService.deleteUser(userId);
      message.success("用户已删除");
      loadUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "删除失败");
    }
  };

  // 查看用户详情
  const handleViewUser = async (userId: number) => {
    try {
      const userDetail = await adminService.getUserDetail(userId);
      setSelectedUser(userDetail);
      setIsUserModalVisible(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || "获取用户详情失败");
    }
  };

  // 用户表格列定义
  const userColumns = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "姓名",
      key: "name",
      render: (_: any, record: AdminUser) => record.profile?.name || "-",
    },
    {
      title: "学号",
      key: "student_id",
      render: (_: any, record: AdminUser) => record.profile?.student_card_id || "-",
    },
    {
      title: "角色",
      key: "role",
      render: (_: any, record: AdminUser) => (
        <Space>
          {record.is_admin && (
            <Tag color="gold" icon={<CrownOutlined />}>
              管理员
            </Tag>
          )}
          {record.is_frozen && <Tag color="red">已冻结</Tag>}
          {!record.is_admin && !record.is_frozen && <Tag color="green">普通用户</Tag>}
        </Space>
      ),
    },
    {
      title: "信用分",
      dataIndex: "credit_score",
      key: "credit_score",
    },
    {
      title: "注册时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "操作",
      key: "actions",
      width: 300,
      fixed: "right",
      render: (_: any, record: AdminUser) => (
        <Space size="small" wrap>
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record.id)}
          >
            查看
          </Button>
          <Popconfirm
            title={record.is_frozen ? "确定要解冻此用户吗？" : "确定要冻结此用户吗？"}
            onConfirm={() => handleToggleFreeze(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              type="link"
              icon={record.is_frozen ? <PlayCircleOutlined /> : <StopOutlined />}
              disabled={record.id === user?.id}
            >
              {record.is_frozen ? "解冻" : "冻结"}
            </Button>
          </Popconfirm>
          <Popconfirm
            title={record.is_admin ? "确定要取消管理员权限吗？" : "确定要设置为管理员吗？"}
            onConfirm={() => handleToggleAdmin(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              type="link"
              icon={<CrownOutlined />}
              disabled={record.id === user?.id}
            >
              {record.is_admin ? "取消管理员" : "设为管理员"}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定要删除此用户吗？此操作不可恢复！"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.id === user?.id || record.is_admin}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin")}>
              返回管理后台
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              用户管理
            </Title>
          </div>
        </div>

        <Card title="用户列表">
          <Row gutter={16} style={{ marginBottom: "16px" }}>
            <Col span={8}>
              <Input.Search
                placeholder="搜索用户名或姓名"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onSearch={loadUsers}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="用户类型"
                value={filters.is_admin}
                onChange={(value) => setFilters({ ...filters, is_admin: value })}
                style={{ width: "100%" }}
                allowClear
              >
                <Option value={true}>管理员</Option>
                <Option value={false}>普通用户</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="用户状态"
                value={filters.is_frozen}
                onChange={(value) => setFilters({ ...filters, is_frozen: value })}
                style={{ width: "100%" }}
                allowClear
              >
                <Option value={false}>正常</Option>
                <Option value={true}>已冻结</Option>
              </Select>
            </Col>
          </Row>

          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: usersTotal,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 10);
              },
            }}
          />
        </Card>

        {/* 用户详情模态框 */}
        <Modal
          title="用户详情"
          open={isUserModalVisible}
          onCancel={() => setIsUserModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsUserModalVisible(false)}>
              关闭
            </Button>,
          ]}
          width={800}
        >
          {selectedUser && (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="用户名">{selectedUser.username}</Descriptions.Item>
              <Descriptions.Item label="姓名">
                {selectedUser.profile?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="学号">
                {selectedUser.profile?.student_card_id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="年级">
                {selectedUser.profile?.grade || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="学院">
                {selectedUser.profile?.institute || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="联系方式">
                {selectedUser.profile?.contact_way || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {selectedUser.profile?.email || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="性别">
                {selectedUser.profile?.gender || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="是否管理员">
                {selectedUser.is_admin ? <Tag color="gold">是</Tag> : <Tag>否</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="账户状态">
                {selectedUser.is_frozen ? (
                  <Tag color="red">已冻结</Tag>
                ) : (
                  <Tag color="green">正常</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="信用分">{selectedUser.credit_score}</Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {new Date(selectedUser.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="发布订单数" span={2}>
                {selectedUser.published_orders?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="接受订单数" span={2}>
                {selectedUser.accepted_orders?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="发布服务数" span={2}>
                {selectedUser.services?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="发起投诉数" span={2}>
                {selectedUser.filed_complaints?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="收到投诉数" span={2}>
                {selectedUser.received_complaints?.length || 0}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default UserManagement;
