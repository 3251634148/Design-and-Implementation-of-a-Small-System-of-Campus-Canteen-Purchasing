import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
  message,
  Spin,
  Timeline,
  Row,
  Col,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ShopOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import api from "../services/api";

const { Title, Text } = Typography;

interface Order {
  id: number;
  order_number: string;
  publisher_id: number;
  accepter_id?: number;
  delivery_address: string;
  tip: string;
  meal_cost: string;
  category: string;
  restaurant: string;
  meal_description: string;
  quantity: number;
  status: "pending" | "accepted" | "completed" | "cancelled";
  published_at: string;
  accepted_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  publisher?: {
    id: number;
    username: string;
    profile?: {
      name?: string;
      contact_way?: string;
      email?: string;
    };
  };
  accepter?: {
    id: number;
    username: string;
    profile?: {
      name?: string;
      contact_way?: string;
      email?: string;
    };
  };
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const orderResponse = await api.get(`/orders/${id}`);

      if (orderResponse.data.success) {
        setOrder(orderResponse.data.data);
      } else {
        message.error(orderResponse.data.message || "获取订单详情失败");
      }
    } catch (error: any) {
      console.error("获取订单详情失败:", error);
      message.error(error.response?.data?.message || "获取订单详情失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleAcceptOrder = async () => {
    if (!order) return;

    try {
      const response = await api.post(`/orders/${order.id}/accept`);
      if (response.data.success) {
        message.success("接受订单成功！");
        fetchOrderDetail();
      } else {
        message.error(response.data.message || "接受订单失败");
      }
    } catch (error: any) {
      console.error("接受订单失败:", error);
      message.error(error.response?.data?.message || "接受订单失败");
    }
  };

  const handleCompleteOrder = async () => {
    if (!order) return;

    // 使用浏览器原生确认对话框
    const confirmed = window.confirm("确认已完成此订单的配送吗？\n\n点击\"确定\"完成订单，点击\"取消\"返回。");
    
    if (confirmed) {
      try {
        console.log("正在完成订单:", order.id); // 调试日志
        const response = await api.post(`/orders/${order.id}/complete`);
        console.log("完成订单响应:", response.data); // 调试日志
        if (response.data.success) {
          message.success("订单已完成！");
          fetchOrderDetail();
        } else {
          message.error(response.data.message || "完成订单失败");
        }
      } catch (error: any) {
        console.error("完成订单失败:", error);
        console.error("错误详情:", error.response?.data); // 调试日志
        message.error(error.response?.data?.message || "完成订单失败");
      }
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    // 使用浏览器原生确认对话框
    const confirmed = window.confirm("确认要取消此订单吗？\n\n⚠️ 此操作不可撤销！\n\n点击\"确定\"取消订单，点击\"取消\"返回。");
    
    if (confirmed) {
      try {
        console.log("正在取消订单:", order.id); // 调试日志
        const response = await api.post(`/orders/${order.id}/cancel`);
        console.log("取消订单响应:", response.data); // 调试日志
        if (response.data.success) {
          message.success("订单已取消！");
          fetchOrderDetail();
        } else {
          message.error(response.data.message || "取消订单失败");
        }
      } catch (error: any) {
        console.error("取消订单失败:", error);
        console.error("错误详情:", error.response?.data); // 调试日志
        message.error(error.response?.data?.message || "取消订单失败");
      }
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="orange">
            等待接单
          </Tag>
        );
      case "accepted":
        return (
          <Tag icon={<UserOutlined />} color="blue">
            已接单
          </Tag>
        );
      case "completed":
        return (
          <Tag icon={<CheckCircleOutlined />} color="green">
            已完成
          </Tag>
        );
      case "cancelled":
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            已取消
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getActionButtons = () => {
    if (!order || !user) {
      console.log("🔍 [OrderDetail getActionButtons] order或user为空:", { order: !!order, user: !!user });
      return null;
    }

    const isPublisher = order.publisher_id === user.id;
    const isAccepter = order.accepter_id === user.id;

    console.log("🔍 [OrderDetail getActionButtons] Order:", order.id, "Status:", order.status, "Publisher:", order.publisher_id, "Accepter:", order.accepter_id, "User:", user.id);
    console.log("🔍 [OrderDetail getActionButtons] isPublisher:", isPublisher, "isAccepter:", isAccepter);

    if (order.status === "pending") {
      if (isPublisher) {
        console.log("🔍 [OrderDetail getActionButtons] 显示取消订单按钮");
        return (
          <Button 
            type="primary" 
            danger 
            onClick={() => {
              console.log("🔥 [OrderDetail Button Click] 取消订单按钮被点击");
              handleCancelOrder();
            }}
          >
            取消订单
          </Button>
        );
      } else {
        console.log("🔍 [OrderDetail getActionButtons] 显示接受订单按钮");
        return (
          <Button 
            type="primary" 
            onClick={() => {
              console.log("🔥 [OrderDetail Button Click] 接受订单按钮被点击");
              handleAcceptOrder();
            }}
          >
            接受订单
          </Button>
        );
      }
    }

    if (order.status === "accepted" && isAccepter) {
      console.log("🔍 [OrderDetail getActionButtons] 显示完成订单按钮");
      return (
        <Button 
          type="primary" 
          onClick={() => {
            console.log("🔥 [OrderDetail Button Click] 完成订单按钮被点击");
            handleCompleteOrder();
          }}
        >
          完成订单
        </Button>
      );
    }

    console.log("🔍 [OrderDetail getActionButtons] 没有显示任何按钮");
    return null;
  };

  const getTimelineItems = () => {
    const items = [];

    items.push({
      color: "blue",
      dot: <ClockCircleOutlined />,
      children: (
        <div>
          <Text strong>订单发布</Text>
          <br />
          <Text type="secondary">
            {order?.published_at ? new Date(order.published_at).toLocaleString() : ""}
          </Text>
        </div>
      ),
    });

    if (order?.accepted_at) {
      items.push({
        color: "green",
        dot: <UserOutlined />,
        children: (
          <div>
            <Text strong>订单被接受</Text>
            <br />
            <Text type="secondary">{new Date(order.accepted_at).toLocaleString()}</Text>
          </div>
        ),
      });
    }

    if (order?.completed_at) {
      items.push({
        color: "green",
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>订单完成</Text>
            <br />
            <Text type="secondary">{new Date(order.completed_at).toLocaleString()}</Text>
          </div>
        ),
      });
    }

    if (order?.cancelled_at) {
      items.push({
        color: "red",
        dot: <CloseCircleOutlined />,
        children: (
          <div>
            <Text strong>订单取消</Text>
            <br />
            <Text type="secondary">{new Date(order.cancelled_at).toLocaleString()}</Text>
          </div>
        ),
      });
    }

    return items;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Text>订单不存在或已被删除</Text>
          <br />
          <Button type="primary" style={{ marginTop: "16px" }} onClick={() => navigate("/orders")}>
            返回订单列表
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/orders")}>
          返回订单列表
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="订单详情">
            <div style={{ marginBottom: "16px" }}>
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  订单号: {order.order_number}
                </Title>
                {getStatusTag(order.status)}
              </Space>
            </div>

            <Descriptions column={1} bordered>
              <Descriptions.Item
                label={
                  <>
                    <ShopOutlined /> 餐厅
                  </>
                }
              >
                {order.restaurant}
              </Descriptions.Item>
              <Descriptions.Item label="餐品类别">{order.category}</Descriptions.Item>
              <Descriptions.Item label="餐品描述">{order.meal_description}</Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <EnvironmentOutlined /> 配送地址
                  </>
                }
              >
                {order.delivery_address}
              </Descriptions.Item>
              <Descriptions.Item label="数量">{order.quantity}</Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <DollarOutlined /> 餐品费用
                  </>
                }
              >
                ¥{order.meal_cost}
              </Descriptions.Item>
              <Descriptions.Item label="小费">¥{order.tip}</Descriptions.Item>
              <Descriptions.Item label="总金额">
                <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                  ¥{(parseFloat(order.meal_cost) + parseFloat(order.tip)).toFixed(2)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Row gutter={[16, 16]}>
              {order.publisher && (
                <Col xs={24} md={12}>
                  <Card size="small" title="发布者信息">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="姓名">
                        {order.publisher.profile?.name || order.publisher.username}
                      </Descriptions.Item>
                      {order.publisher.profile?.contact_way && (
                        <Descriptions.Item
                          label={
                            <>
                              <PhoneOutlined /> 联系方式
                            </>
                          }
                        >
                          {order.publisher.profile.contact_way}
                        </Descriptions.Item>
                      )}
                      {order.publisher.profile?.email && (
                        <Descriptions.Item label="邮箱">
                          {order.publisher.profile.email}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                </Col>
              )}

              {order.accepter && (
                <Col xs={24} md={12}>
                  <Card size="small" title="接单者信息">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="姓名">
                        {order.accepter.profile?.name || order.accepter.username}
                      </Descriptions.Item>
                      {order.accepter.profile?.contact_way && (
                        <Descriptions.Item
                          label={
                            <>
                              <PhoneOutlined /> 联系方式
                            </>
                          }
                        >
                          {order.accepter.profile.contact_way}
                        </Descriptions.Item>
                      )}
                      {order.accepter.profile?.email && (
                        <Descriptions.Item label="邮箱">
                          {order.accepter.profile.email}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                </Col>
              )}
            </Row>

            {getActionButtons() && (
              <>
                <Divider />
                <div style={{ textAlign: "center" }}>{getActionButtons()}</div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="订单状态历史">
            <Timeline items={getTimelineItems()} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetail;
