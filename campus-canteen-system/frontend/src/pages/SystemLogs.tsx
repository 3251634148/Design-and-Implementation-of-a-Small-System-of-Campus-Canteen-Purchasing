import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  message,
  Row,
  Select,
  Space,
  Table,
  Timeline,
} from "antd";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { adminService, type SystemActivity, type SystemLogsParams } from "../services/adminService";
import { useAuthStore } from "../stores/authStore";

const { RangePicker } = DatePicker;

const SystemLogs: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 查询参数
  const [filters, setFilters] = useState<SystemLogsParams>({
    username: "",
    orderId: "",
    activityType: "",
  });

  // 加载系统活动日志
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getSystemLogs({
        page: currentPage,
        limit: pageSize,
        ...filters,
      });
      setActivities(response.activities);
      setTotal(response.total);
    } catch (error) {
      message.error("加载系统日志失败");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    if (user?.is_admin) {
      loadLogs();
    }
  }, [user, loadLogs]);

  // 搜索处理
  const handleSearch = () => {
    setCurrentPage(1);
    loadLogs();
  };

  // 重置搜索
  const handleReset = () => {
    setFilters({
      username: "",
      orderId: "",
      activityType: "",
      startDate: undefined,
      endDate: undefined,
    });
    setCurrentPage(1);
    setTimeout(() => {
      loadLogs();
    }, 100);
  };

  // 日期范围变化
  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setFilters({
      ...filters,
      startDate: dateStrings[0] || undefined,
      endDate: dateStrings[1] || undefined,
    });
  };

  // 表格列定义
  const columns = [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
    {
      title: "用户",
      dataIndex: "user",
      key: "user",
      width: 120,
      render: (user: string) => user || "-",
    },
    {
      title: "活动类型",
      dataIndex: "type",
      key: "type",
      width: 120,
    },
    {
      title: "活动描述",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
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
          <h1>系统活动日志</h1>
          <Button onClick={() => navigate("/admin")}>返回管理后台</Button>
        </div>

        <Row gutter={16}>
          {/* 左侧：搜索和表格 */}
          <Col span={16}>
            <Card title="活动日志" style={{ marginBottom: "16px" }}>
              {/* 搜索区域 */}
              <Row gutter={16} style={{ marginBottom: "16px" }}>
                <Col span={4}>
                  <Input
                    placeholder="搜索用户名"
                    value={filters.username}
                    onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                    onPressEnter={handleSearch}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    placeholder="搜索订单号"
                    value={filters.orderId}
                    onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
                    onPressEnter={handleSearch}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="活动类型"
                    value={filters.activityType}
                    onChange={(value) => setFilters({ ...filters, activityType: value })}
                    style={{ width: "100%" }}
                    allowClear
                  >
                    <Select.Option value="order_created">订单创建</Select.Option>
                    <Select.Option value="order_completed">订单完成</Select.Option>
                    <Select.Option value="order_cancelled">订单取消</Select.Option>
                    <Select.Option value="order_exception">订单异常</Select.Option>
                    <Select.Option value="user_registered">用户注册</Select.Option>
                    <Select.Option value="user_deactivated">用户注销</Select.Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <RangePicker
                    style={{ width: "100%" }}
                    onChange={handleDateRangeChange}
                    placeholder={["开始日期", "结束日期"]}
                  />
                </Col>
                <Col span={4}>
                  <Space>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                      搜索
                    </Button>
                    <Button onClick={handleReset}>重置</Button>
                  </Space>
                </Col>
              </Row>

              {/* 表格 */}
              <Table
                columns={columns}
                dataSource={activities}
                rowKey={(record, index) =>
                  `${record.timestamp}-${record.type}-${record.message.slice(0, 20)}-${index}`
                }
                loading={loading}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size || 20);
                  },
                }}
              />
            </Card>
          </Col>

          {/* 右侧：时间线视图 */}
          <Col span={8}>
            <Card
              title="最近活动"
              style={{ height: "600px" }}
              bodyStyle={{ height: "540px", overflow: "auto" }}
            >
              <Timeline>
                {activities.slice(0, 20).map((activity, index) => (
                  <Timeline.Item key={`timeline-${activity.timestamp}-${activity.type}-${index}`}>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                    <div style={{ fontSize: "14px", marginBottom: "4px" }}>{activity.message}</div>
                    {activity.user && (
                      <div style={{ fontSize: "12px", color: "#999" }}>用户: {activity.user}</div>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
};

export default SystemLogs;
