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
  Popconfirm,
  Row,
  Col,
  Statistic,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  serviceService,
  type Service,
  type CreateServiceData,
  type UpdateServiceData,
  type ServiceStats,
} from "../services/serviceService";
import { useAuthStore } from "../stores/authStore";
import AppLayout from "../components/AppLayout";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ServiceManagement: React.FC = () => {
  const {} = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // 模态框状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "view">("create");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  // 筛选状态
  const [filters, setFilters] = useState<{
    category: string;
    status: "active" | "inactive" | "deleted" | "";
    search: string;
  }>({
    category: "",
    status: "",
    search: "",
  });

  // 加载数据
  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await serviceService.getUserServices({
        page: currentPage,
        limit: pageSize,
        category: filters.category || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });
      setServices(response.services);
      setTotal(response.total);
    } catch (error) {
      message.error("加载服务列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      const statsData = await serviceService.getServiceStats();
      setStats(statsData);
    } catch (error) {
      console.error("加载统计数据失败:", error);
    }
  };

  // 加载分类
  const loadCategories = async () => {
    try {
      const categoriesData = await serviceService.getServiceCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("加载分类失败:", error);
    }
  };

  useEffect(() => {
    loadServices();
    loadStats();
    loadCategories();
  }, [currentPage, pageSize, filters]);

  // 打开模态框
  const openModal = (type: "create" | "edit" | "view", service?: Service) => {
    setModalType(type);
    setSelectedService(service || null);
    setIsModalVisible(true);

    if (type === "edit" && service) {
      form.setFieldsValue({
        category: service.category,
        description: service.description,
        status: service.status,
      });
    } else if (type === "create") {
      form.resetFields();
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedService(null);
    form.resetFields();
  };

  // 创建服务
  const handleCreate = async (values: CreateServiceData) => {
    try {
      await serviceService.createService(values);
      message.success("服务发布成功");
      closeModal();
      loadServices();
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || "服务发布失败");
    }
  };

  // 更新服务
  const handleUpdate = async (values: UpdateServiceData) => {
    if (!selectedService) return;

    try {
      await serviceService.updateService(selectedService.id, values);
      message.success("服务更新成功");
      closeModal();
      loadServices();
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || "服务更新失败");
    }
  };

  // 删除服务
  const handleDelete = async (id: number) => {
    try {
      await serviceService.deleteService(id);
      message.success("服务删除成功");
      loadServices();
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || "服务删除失败");
    }
  };

  // 表格列定义
  const columns = [
    {
      title: "服务编号",
      dataIndex: "service_number",
      key: "service_number",
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap = {
          active: { color: "green", text: "活跃" },
          inactive: { color: "orange", text: "暂停" },
          deleted: { color: "red", text: "已删除" },
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "发布时间",
      dataIndex: "published_at",
      key: "published_at",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "操作",
      key: "actions",
      render: (_: any, record: Service) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openModal("view", record)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal("edit", record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个服务吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ width: "100%", maxWidth: "100%" }}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            <ToolOutlined style={{ marginRight: "8px" }} />
            服务管理
          </Title>
          <Text type="secondary">管理您提供的服务，展示专业能力</Text>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Card
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  width: "100%",
                  maxWidth: "100%",
                }}
                styles={{
                  body: {
                    width: "100%",
                    maxWidth: "100%",
                  },
                }}
              >
                <Statistic
                  title="总服务数"
                  value={stats.total}
                  valueStyle={{ color: "#fff" }}
                  prefix={<ToolOutlined style={{ color: "#fff" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Card
                style={{
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  border: "none",
                }}
              >
                <Statistic
                  title="活跃服务"
                  value={stats.active}
                  valueStyle={{ color: "#fff" }}
                  prefix={<EyeOutlined style={{ color: "#fff" }} />}
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
                  title="暂停服务"
                  value={stats.inactive}
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
                  title="已删除"
                  value={stats.deleted}
                  valueStyle={{ color: "#fff" }}
                  prefix={<DeleteOutlined style={{ color: "#fff" }} />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* 筛选和操作区域 */}
        <Card
          style={{
            marginBottom: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "100%",
          }}
          styles={{
            body: {
              width: "100%",
              maxWidth: "100%",
            },
          }}
          title={
            <Space>
              <ToolOutlined style={{ color: "#1890ff" }} />
              <Text strong>筛选与操作</Text>
            </Space>
          }
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Input.Search
                placeholder="搜索服务编号或描述"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onSearch={() => loadServices()}
              />
            </Col>
            <Col xs={12} sm={6} md={4} lg={4} xl={4}>
              <Select
                placeholder="选择分类"
                value={filters.category}
                onChange={(value) => setFilters({ ...filters, category: value })}
                style={{ width: "100%" }}
                allowClear
              >
                {categories.map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4} lg={4} xl={4}>
              <Select
                placeholder="选择状态"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                style={{ width: "100%" }}
                allowClear
              >
                <Option value="active">活跃</Option>
                <Option value="inactive">暂停</Option>
                <Option value="deleted">已删除</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal("create")}>
                发布服务
              </Button>
            </Col>
          </Row>
        </Card>

        {/* 服务列表 */}
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "100%",
          }}
          styles={{
            body: {
              width: "100%",
              maxWidth: "100%",
            },
          }}
          title={
            <Space>
              <ToolOutlined style={{ color: "#1890ff" }} />
              <Text strong>服务列表</Text>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={services}
            rowKey="id"
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
                setPageSize(size || 10);
              },
            }}
          />
        </Card>

        {/* 服务模态框 */}
        <Modal
          title={
            modalType === "create" ? "发布服务" : modalType === "edit" ? "编辑服务" : "服务详情"
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
                    {modalType === "create" ? "发布" : "更新"}
                  </Button>,
                ]
          }
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={modalType === "create" ? handleCreate : handleUpdate}
          >
            {modalType === "create" && (
              <Form.Item
                label="服务编号"
                name="service_number"
                rules={[{ required: true, message: "请输入服务编号" }]}
              >
                <Input placeholder="请输入唯一的服务编号" />
              </Form.Item>
            )}

            <Form.Item
              label="服务分类"
              name="category"
              rules={[{ required: true, message: "请输入服务分类" }]}
            >
              <Input placeholder="如：代买餐、代取快递等" disabled={modalType === "view"} />
            </Form.Item>

            <Form.Item
              label="服务描述"
              name="description"
              rules={[{ required: true, message: "请输入服务描述" }]}
            >
              <TextArea
                rows={4}
                placeholder="详细描述您提供的服务内容"
                disabled={modalType === "view"}
              />
            </Form.Item>

            {modalType === "edit" && (
              <Form.Item
                label="服务状态"
                name="status"
                rules={[{ required: true, message: "请选择服务状态" }]}
              >
                <Select>
                  <Option value="active">活跃</Option>
                  <Option value="inactive">暂停</Option>
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default ServiceManagement;
