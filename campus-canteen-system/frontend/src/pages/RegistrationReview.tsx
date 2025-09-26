import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Input,
  Modal,
  message,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type React from "react";
import { useCallback, useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { adminService, type RegistrationApplication } from "../services/adminService";
import { useAuthStore } from "../stores/authStore";

const { Title, Text } = Typography;
const { TextArea } = Input;

const RegistrationReview: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const commentId = useId();
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<RegistrationApplication | null>(
    null
  );
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // 检查权限
  useEffect(() => {
    if (!isAuthenticated || !user?.is_admin) {
      message.error("您没有权限访问此页面");
      navigate("/dashboard");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getRegistrationApplications({
        page: 1,
        limit: 50,
      });
      setApplications(response.applications);
    } catch (error) {
      console.error("获取注册申请失败:", error);
      message.error("获取注册申请失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取注册申请列表
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // 查看详情
  const handleViewDetail = (application: RegistrationApplication) => {
    setSelectedApplication(application);
    setDetailModalVisible(true);
  };

  // 开始审核
  const handleStartReview = (
    application: RegistrationApplication,
    action: "approve" | "reject"
  ) => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewComment("");
    setReviewModalVisible(true);
  };

  // 提交审核
  const handleSubmitReview = async () => {
    if (!selectedApplication) return;

    try {
      setReviewLoading(true);

      const updatedApplication = await adminService.reviewRegistrationApplication(
        selectedApplication.id,
        {
          action: reviewAction,
          comment: reviewComment,
        }
      );

      // 更新本地数据
      setApplications((prev) =>
        prev.map((app) => (app.id === selectedApplication.id ? updatedApplication : app))
      );

      message.success(reviewAction === "approve" ? "审核通过" : "审核拒绝");
      setReviewModalVisible(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error("审核失败:", error);
      message.error("审核失败，请重试");
    } finally {
      setReviewLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: "申请时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => new Date(text).toLocaleString(),
      width: 150,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 120,
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 100,
    },
    {
      title: "学号",
      dataIndex: "student_card_id",
      key: "student_card_id",
      width: 120,
    },
    {
      title: "学院",
      dataIndex: "institute",
      key: "institute",
      width: 150,
    },
    {
      title: "联系方式",
      dataIndex: "contact_way",
      key: "contact_way",
      width: 120,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap = {
          pending: { color: "orange", text: "待审核" },
          approved: { color: "green", text: "已通过" },
          rejected: { color: "red", text: "已拒绝" },
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      width: 100,
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: RegistrationApplication) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleStartReview(record, "approve")}
                style={{ color: "#52c41a" }}
              >
                通过
              </Button>
              <Button
                type="link"
                icon={<CloseOutlined />}
                onClick={() => handleStartReview(record, "reject")}
                danger
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
      width: 200,
    },
  ];

  if (!user?.is_admin) {
    return null;
  }

  return (
    <AppLayout>
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin")}
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              返回管理后台
            </Button>
            <div>
              <Title level={2} style={{ color: "white", margin: 0 }}>
                注册申请审核
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                审核学生注册申请，验证身份信息
              </Text>
            </div>
          </div>
        </div>

        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Table
            columns={columns}
            dataSource={applications}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>

      {/* 详情模态框 */}
      <Modal
        title="注册申请详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedApplication && (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="用户名">{selectedApplication.username}</Descriptions.Item>
                <Descriptions.Item label="真实姓名">{selectedApplication.name}</Descriptions.Item>
                <Descriptions.Item label="学号">
                  {selectedApplication.student_card_id}
                </Descriptions.Item>
                <Descriptions.Item label="年级">
                  {selectedApplication.grade || "未填写"}
                </Descriptions.Item>
                <Descriptions.Item label="学院">
                  {selectedApplication.institute || "未填写"}
                </Descriptions.Item>
                <Descriptions.Item label="联系方式">
                  {selectedApplication.contact_way || "未填写"}
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  {selectedApplication.email || "未填写"}
                </Descriptions.Item>
                <Descriptions.Item label="性别">
                  {selectedApplication.gender === "male"
                    ? "男"
                    : selectedApplication.gender === "female"
                      ? "女"
                      : selectedApplication.gender === "other"
                        ? "其他"
                        : "未填写"}
                </Descriptions.Item>
                <Descriptions.Item label="申请时间">
                  {new Date(selectedApplication.created_at).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag
                    color={
                      selectedApplication.status === "pending"
                        ? "orange"
                        : selectedApplication.status === "approved"
                          ? "green"
                          : "red"
                    }
                  >
                    {selectedApplication.status === "pending"
                      ? "待审核"
                      : selectedApplication.status === "approved"
                        ? "已通过"
                        : "已拒绝"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ textAlign: "center" }}>
                <Title level={5}>学生身份照片</Title>
                {selectedApplication.student_photo_url ? (
                  <Image
                    src={selectedApplication.student_photo_url}
                    alt="学生身份照片"
                    style={{ maxWidth: "100%", maxHeight: "300px" }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                  />
                ) : (
                  <div
                    style={{
                      height: "200px",
                      border: "1px dashed #d9d9d9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                    }}
                  >
                    暂无照片
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Modal>

      {/* 审核模态框 */}
      <Modal
        title={reviewAction === "approve" ? "审核通过" : "审核拒绝"}
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setReviewModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={reviewLoading}
            onClick={handleSubmitReview}
            danger={reviewAction === "reject"}
          >
            确认{reviewAction === "approve" ? "通过" : "拒绝"}
          </Button>,
        ]}
      >
        {selectedApplication && (
          <div>
            <p>
              确认{reviewAction === "approve" ? "通过" : "拒绝"}用户{" "}
              <strong>{selectedApplication.name}</strong>（{selectedApplication.username}
              ）的注册申请？
            </p>
            <div style={{ marginTop: "16px" }}>
              <label htmlFor={commentId}>审核意见：</label>
              <TextArea
                id={commentId}
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  reviewAction === "approve" ? "请填写通过理由（可选）" : "请填写拒绝理由（必填）"
                }
                maxLength={500}
              />
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
};

export default RegistrationReview;
