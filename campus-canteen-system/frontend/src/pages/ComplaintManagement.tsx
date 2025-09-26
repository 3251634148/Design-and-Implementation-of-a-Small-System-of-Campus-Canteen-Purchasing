import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Descriptions,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import {
  complaintService,
  type Complaint,
  type CreateComplaintData,
  type ComplaintStats,
} from "../services/complaintService";
import { useAuthStore } from "../stores/authStore";
import AppLayout from "../components/AppLayout";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ComplaintManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [filedComplaints, setFiledComplaints] = useState<Complaint[]>([]);
  const [receivedComplaints, setReceivedComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [filedTotal, setFiledTotal] = useState(0);
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [activeTab, setActiveTab] = useState("filed");

  // 模态框状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"create" | "view" | "process">("create");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [form] = Form.useForm();

  // 筛选状态
  const [filters, setFilters] = useState<{
    status: "pending" | "processing" | "resolved" | "rejected" | "";
    category: string;
    search: string;
  }>({
    status: "",
    category: "",
    search: "",
  });

  // 加载发起的投诉
  const loadFiledComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintService.getUserComplaints({
        page: currentPage,
        limit: pageSize,
        status: filters.status || undefined,
        category: filters.category || undefined,
        search: filters.search || undefined,
      });
      setFiledComplaints(response.complaints);
      setFiledTotal(response.total);
    } catch (error) {
      message.error("加载投诉列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载收到的投诉
  const loadReceivedComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintService.getUserReceivedComplaints({
        page: currentPage,
        limit: pageSize,
        status: filters.status || undefined,
        category: filters.category || undefined,
        search: filters.search || undefined,
      });
      setReceivedComplaints(response.complaints);
      setReceivedTotal(response.total);
    } catch (error) {
      message.error("加载投诉列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      const statsData = await complaintService.getComplaintStats();
      setStats(statsData);
    } catch (error) {
      console.error("加载统计数据失败:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "filed") {
      loadFiledComplaints();
    } else {
      loadReceivedComplaints();
    }
    loadStats();
  }, [currentPage, pageSize, filters, activeTab]);

  // 打开模态框
  const openModal = (type: "create" | "view" | "process", complaint?: Complaint) => {
    setModalType(type);
    setSelectedComplaint(complaint || null);
    setIsModalVisible(true);

    if (type === "create") {
      form.resetFields();
    } else if (type === "process" && complaint) {
      form.setFieldsValue({
        status: complaint.status,
        admin_response: complaint.admin_response,
      });
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedComplaint(null);
    form.resetFields();
  };

  // 提交投诉
  const handleCreate = async (values: CreateComplaintData) => {
    try {
      await complaintService.createComplaint(values);
      message.success("投诉提交成功");
      closeModal();
      loadFiledComplaints();
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || "投诉提交失败");
    }
  };

  // 处理投诉（管理员）
  const handleProcess = async (values: any) => {
    if (!selectedComplaint) return;

    try {
      await complaintService.processComplaint(selectedComplaint.id, values);
      message.success("投诉处理成功");
      closeModal();
      if (activeTab === "filed") {
        loadFiledComplaints();
      } else {
        loadReceivedComplaints();
      }
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || "投诉处理失败");
    }
  };

  // 状态标签渲染
  const renderStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: "orange", text: "待处理" },
      processing: { color: "blue", text: "处理中" },
      resolved: { color: "green", text: "已解决" },
      rejected: { color: "red", text: "已拒绝" },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // 表格列定义
  const getColumns = (isReceived: boolean = false) => [
    {
      title: isReceived ? "投诉人" : "被投诉人",
      key: "user",
      render: (_: any, record: Complaint) => {
        const user = isReceived ? record.complainant : record.complained;
        return user ? `${user.profile?.name || user.username} (${user.username})` : "-";
      },
    },
    {
      title: "投诉分类",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "投诉原因",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "相关订单",
      key: "order",
      render: (_: any, record: Complaint) => (record.order ? record.order.order_number : "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: renderStatusTag,
    },
    {
      title: "提交时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "操作",
      key: "actions",
      render: (_: any, record: Complaint) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openModal("view", record)}>
            查看
          </Button>
          {user?.is_admin && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openModal("process", record)}
              disabled={record.status === "resolved" || record.status === "rejected"}
            >
              处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ width: "100%", maxWidth: "100%" }}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            <CustomerServiceOutlined style={{ marginRight: "8px" }} />
            投诉管理
          </Title>
          <Text type="secondary">管理您的投诉记录，维护良好的交易环境</Text>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            {stats.filed && (
              <>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    <Statistic
                      title="发起投诉总数"
                      value={stats.filed.total}
                      valueStyle={{ color: "#fff" }}
                      prefix={<CustomerServiceOutlined style={{ color: "#fff" }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    style={{
                      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      border: "none",
                    }}
                  >
                    <Statistic
                      title="待处理投诉"
                      value={stats.filed.pending}
                      valueStyle={{ color: "#fff" }}
                      prefix={<EyeOutlined style={{ color: "#fff" }} />}
                    />
                  </Card>
                </Col>
              </>
            )}
            {stats.received && (
              <>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    style={{
                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      border: "none",
                    }}
                  >
                    <Statistic
                      title="收到投诉总数"
                      value={stats.received.total}
                      valueStyle={{ color: "#fff" }}
                      prefix={<EditOutlined style={{ color: "#fff" }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    style={{
                      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                      border: "none",
                    }}
                  >
                    <Statistic
                      title="待处理投诉"
                      value={stats.received.pending}
                      valueStyle={{ color: "#fff" }}
                      prefix={<PlusOutlined style={{ color: "#fff" }} />}
                    />
                  </Card>
                </Col>
              </>
            )}
          </Row>
        )}

        {/* 筛选和操作区域 */}
        <Card
          style={{
            marginBottom: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "100%",
          }}
          title={
            <Space>
              <CustomerServiceOutlined style={{ color: "#1890ff" }} />
              <Text strong>筛选与操作</Text>
            </Space>
          }
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Input.Search
                placeholder="搜索投诉内容"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onSearch={() => {
                  if (activeTab === "filed") {
                    loadFiledComplaints();
                  } else {
                    loadReceivedComplaints();
                  }
                }}
              />
            </Col>
            <Col xs={12} sm={6} md={4} lg={4} xl={4}>
              <Select
                placeholder="选择状态"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                style={{ width: "100%" }}
                allowClear
              >
                <Option value="pending">待处理</Option>
                <Option value="processing">处理中</Option>
                <Option value="resolved">已解决</Option>
                <Option value="rejected">已拒绝</Option>
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4} lg={4} xl={4}>
              <Input
                placeholder="投诉分类"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal("create")}>
                提交投诉
              </Button>
            </Col>
          </Row>
        </Card>

        {/* 投诉列表 */}
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "100%",
          }}
          title={
            <Space>
              <CustomerServiceOutlined style={{ color: "#1890ff" }} />
              <Text strong>投诉记录</Text>
            </Space>
          }
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "filed",
                label: "我发起的投诉",
                children: (
                  <Table
                    columns={getColumns(false)}
                    dataSource={filedComplaints}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      total: filedTotal,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                      onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size || 10);
                      },
                    }}
                  />
                ),
              },
              {
                key: "received",
                label: "我收到的投诉",
                children: (
                  <Table
                    columns={getColumns(true)}
                    dataSource={receivedComplaints}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      total: receivedTotal,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                      onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size || 10);
                      },
                    }}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* 投诉模态框 */}
        <Modal
          title={
            modalType === "create" ? "提交投诉" : modalType === "process" ? "处理投诉" : "投诉详情"
          }
          open={isModalVisible}
          onCancel={closeModal}
          footer={
            modalType === "view"
              ? [
                  <Button key="close" onClick={closeModal}>
                    关闭
                  </Button>,
                ]
              : [
                  <Button key="cancel" onClick={closeModal}>
                    取消
                  </Button>,
                  <Button key="submit" type="primary" onClick={() => form.submit()}>
                    {modalType === "create" ? "提交" : "处理"}
                  </Button>,
                ]
          }
          width={600}
        >
          {modalType === "view" && selectedComplaint ? (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="投诉人">
                {selectedComplaint.complainant?.profile?.name ||
                  selectedComplaint.complainant?.username}
              </Descriptions.Item>
              <Descriptions.Item label="被投诉人">
                {selectedComplaint.complained?.profile?.name ||
                  selectedComplaint.complained?.username}
              </Descriptions.Item>
              <Descriptions.Item label="相关订单">
                {selectedComplaint.order?.order_number || "无"}
              </Descriptions.Item>
              <Descriptions.Item label="投诉分类">{selectedComplaint.category}</Descriptions.Item>
              <Descriptions.Item label="投诉原因">{selectedComplaint.reason}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {renderStatusTag(selectedComplaint.status)}
              </Descriptions.Item>
              {selectedComplaint.admin_response && (
                <Descriptions.Item label="管理员回复">
                  {selectedComplaint.admin_response}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="提交时间">
                {new Date(selectedComplaint.created_at).toLocaleString()}
              </Descriptions.Item>
              {selectedComplaint.processed_at && (
                <Descriptions.Item label="处理时间">
                  {new Date(selectedComplaint.processed_at).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={modalType === "create" ? handleCreate : handleProcess}
            >
              {modalType === "create" && (
                <>
                  <Form.Item
                    label="被投诉人ID"
                    name="complained_id"
                    rules={[{ required: true, message: "请输入被投诉人ID" }]}
                  >
                    <Input placeholder="请输入被投诉人的用户ID" type="number" />
                  </Form.Item>

                  <Form.Item label="相关订单ID（可选）" name="order_id">
                    <Input placeholder="如果投诉与某个订单相关，请输入订单ID" type="number" />
                  </Form.Item>

                  <Form.Item
                    label="投诉分类"
                    name="category"
                    rules={[{ required: true, message: "请输入投诉分类" }]}
                  >
                    <Input placeholder="如：服务质量、态度问题等" />
                  </Form.Item>

                  <Form.Item
                    label="投诉原因"
                    name="reason"
                    rules={[{ required: true, message: "请输入投诉原因" }]}
                  >
                    <TextArea rows={4} placeholder="请详细描述投诉的具体原因和情况" />
                  </Form.Item>
                </>
              )}

              {modalType === "process" && (
                <>
                  <Form.Item
                    label="处理状态"
                    name="status"
                    rules={[{ required: true, message: "请选择处理状态" }]}
                  >
                    <Select>
                      <Option value="processing">处理中</Option>
                      <Option value="resolved">已解决</Option>
                      <Option value="rejected">已拒绝</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="管理员回复" name="admin_response">
                    <TextArea rows={4} placeholder="请输入处理结果和回复内容" />
                  </Form.Item>
                </>
              )}
            </Form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default ComplaintManagement;
