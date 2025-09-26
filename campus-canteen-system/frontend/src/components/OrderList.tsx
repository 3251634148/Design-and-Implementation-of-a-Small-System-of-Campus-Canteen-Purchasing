import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  List,
  message,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import type React from "react";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";

const { Text, Title } = Typography;

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
    };
  };
  accepter?: {
    id: number;
    username: string;
    profile?: {
      name?: string;
      contact_way?: string;
    };
  };
}

interface OrderListProps {
  type: "all" | "my" | "accepted";
  refreshTrigger?: number;
  onOrderUpdate?: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ type, refreshTrigger, onOrderUpdate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // 添加用户状态调试
  console.log("🔍 [OrderList] 组件渲染, type:", type, "user:", user);
  console.log("🔍 [OrderList] 用户ID:", user?.id, "用户名:", user?.username);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let endpoint = "/orders";

      switch (type) {
        case "my":
        case "accepted":
          endpoint = "/orders/my";
          break;
        case "all":
        default:
          endpoint = "/orders";
      }

      const response = await api.get(endpoint);
      if (response.data.success) {
        // 处理不同的API响应格式
        const data = response.data.data;
        let orderList: Order[] = [];

        console.log("API响应数据:", data); // 调试日志

        if (Array.isArray(data)) {
          // 直接是数组格式
          orderList = data;
        } else if (data && Array.isArray(data.orders)) {
          // 分页格式 {orders: [...], total: ...}
          orderList = data.orders;
        } else if (data && (data.published || data.accepted)) {
          // 用户订单格式 {published: [...], accepted: [...]}
          if (type === "accepted") {
            orderList = Array.isArray(data.accepted) ? data.accepted : [];
          } else if (type === "my") {
            orderList = Array.isArray(data.published) ? data.published : [];
          } else {
            // type === "all" 时，合并两个数组
            const published = Array.isArray(data.published) ? data.published : [];
            const accepted = Array.isArray(data.accepted) ? data.accepted : [];
            orderList = [...published, ...accepted];
          }
        } else {
          console.warn("未知的API响应格式:", data);
          orderList = [];
        }

        // 确保orderList是数组
        if (!Array.isArray(orderList)) {
          console.error("orderList不是数组:", orderList);
          orderList = [];
        }

        setOrders(orderList);
      } else {
        message.error(response.data.message || "获取订单列表失败");
        setOrders([]); // 确保设置为空数组
      }
    } catch (error: any) {
      console.error("获取订单列表失败:", error);
      message.error(error.response?.data?.message || "获取订单列表失败");
      setOrders([]); // 确保设置为空数组
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [type, refreshTrigger]);

  const handleAcceptOrder = async (orderId: number) => {
    try {
      const response = await api.post(`/orders/${orderId}/accept`);
      if (response.data.success) {
        message.success("接受订单成功！");
        fetchOrders();
        onOrderUpdate?.();
      } else {
        message.error(response.data.message || "接受订单失败");
      }
    } catch (error: any) {
      console.error("接受订单失败:", error);
      message.error(error.response?.data?.message || "接受订单失败");
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    console.log("🚀 [handleCompleteOrder] 函数被调用, orderId:", orderId);

    // 使用浏览器原生确认对话框替代Ant Design Modal
    const confirmed = window.confirm(
      '确认已完成此订单的配送吗？\n\n点击"确定"完成订单，点击"取消"返回。'
    );

    if (confirmed) {
      console.log("✅ [Confirm] 用户确认完成订单, orderId:", orderId);
      try {
        console.log("🔄 [API Call] 正在完成订单:", orderId);
        const response = await api.post(`/orders/${orderId}/complete`);
        console.log("📥 [API Response] 完成订单响应:", response.data);
        if (response.data.success) {
          message.success("订单已完成！");
          fetchOrders();
          onOrderUpdate?.();
        } else {
          message.error(response.data.message || "完成订单失败");
        }
      } catch (error: any) {
        console.error("❌ [API Error] 完成订单失败:", error);
        console.error("❌ [API Error] 错误详情:", error.response?.data);
        message.error(error.response?.data?.message || "完成订单失败");
      }
    } else {
      console.log("❌ [Confirm] 用户取消完成订单, orderId:", orderId);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    console.log("🚀 [handleCancelOrder] 函数被调用, orderId:", orderId);

    // 使用浏览器原生确认对话框替代Ant Design Modal
    const confirmed = window.confirm(
      '确认要取消此订单吗？\n\n⚠️ 此操作不可撤销！\n\n点击"确定"取消订单，点击"取消"返回。'
    );

    if (confirmed) {
      console.log("✅ [Confirm] 用户确认取消订单, orderId:", orderId);
      try {
        console.log("🔄 [API Call] 正在取消订单:", orderId);
        const response = await api.post(`/orders/${orderId}/cancel`);
        console.log("📥 [API Response] 取消订单响应:", response.data);
        if (response.data.success) {
          message.success("订单已取消！");
          fetchOrders();
          onOrderUpdate?.();
        } else {
          message.error(response.data.message || "取消订单失败");
        }
      } catch (error: any) {
        console.error("❌ [API Error] 取消订单失败:", error);
        console.error("❌ [API Error] 错误详情:", error.response?.data);
        message.error(error.response?.data?.message || "取消订单失败");
      }
    } else {
      console.log("❌ [Confirm] 用户取消取消订单操作, orderId:", orderId);
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

  const getActionButtons = (order: Order) => {
    const isPublisher = order.publisher_id === user?.id;
    const isAccepter = order.accepter_id === user?.id;

    console.log(
      "🔍 [getActionButtons] Order:",
      order.id,
      "Status:",
      order.status,
      "Publisher:",
      order.publisher_id,
      "Accepter:",
      order.accepter_id,
      "User:",
      user?.id
    );
    console.log("🔍 [getActionButtons] isPublisher:", isPublisher, "isAccepter:", isAccepter);

    if (order.status === "pending") {
      if (isPublisher) {
        console.log("🔍 [getActionButtons] 显示取消订单按钮 for order:", order.id);
        return (
          <Button
            type="primary"
            danger
            size="small"
            onClick={() => {
              console.log("🔥 [Button Click] 取消订单按钮被点击, orderId:", order.id);
              handleCancelOrder(order.id);
            }}
          >
            取消订单
          </Button>
        );
      } else {
        console.log("🔍 [getActionButtons] 显示接受订单按钮 for order:", order.id);
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              console.log("🔥 [Button Click] 接受订单按钮被点击, orderId:", order.id);
              handleAcceptOrder(order.id);
            }}
          >
            接受订单
          </Button>
        );
      }
    }

    if (order.status === "accepted" && isAccepter) {
      console.log("🔍 [getActionButtons] 显示完成订单按钮 for order:", order.id);
      return (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            console.log("🔥 [Button Click] 完成订单按钮被点击, orderId:", order.id);
            handleCompleteOrder(order.id);
          }}
        >
          完成订单
        </Button>
      );
    }

    console.log("🔍 [getActionButtons] 没有显示任何按钮 for order:", order.id);
    return null;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // 确保orders是数组
  const safeOrders = Array.isArray(orders) ? orders : [];

  if (safeOrders.length === 0) {
    return (
      <Empty
        description={
          type === "my"
            ? "您还没有发布任何订单"
            : type === "accepted"
              ? "您还没有接受任何订单"
              : "暂无订单"
        }
        style={{ padding: "50px" }}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        height: "calc(100vh - 300px)",
        overflow: "auto",
      }}
    >
      <List
        dataSource={safeOrders}
        style={{ width: "100%", maxWidth: "100%" }}
        renderItem={(order) => (
          <List.Item style={{ padding: 0, marginBottom: "16px", width: "100%", maxWidth: "100%" }}>
            <Card
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
              styles={{
                body: {
                  padding: "16px",
                  width: "100%",
                  maxWidth: "100%",
                },
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <div style={{ marginBottom: "12px" }}>
                    <Space>
                      <Title level={5} style={{ margin: 0 }}>
                        订单号: {order.order_number}
                      </Title>
                      {getStatusTag(order.status)}
                    </Space>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <Text strong>餐厅：</Text>
                    <Text>{order.restaurant}</Text>
                    <Divider type="vertical" />
                    <Text strong>类别：</Text>
                    <Text>{order.category}</Text>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <Text strong>餐品描述：</Text>
                    <Text>{order.meal_description}</Text>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <EnvironmentOutlined style={{ marginRight: "4px" }} />
                    <Text strong>配送地址：</Text>
                    <Text>{order.delivery_address}</Text>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <Space>
                      <Text>
                        <DollarOutlined style={{ marginRight: "4px" }} />
                        餐费: ¥{order.meal_cost}
                      </Text>
                      <Text>小费: ¥{order.tip}</Text>
                      <Text>数量: {order.quantity}</Text>
                    </Space>
                  </div>

                  {order.publisher && (
                    <div style={{ marginBottom: "8px" }}>
                      <UserOutlined style={{ marginRight: "4px" }} />
                      <Text strong>发布者：</Text>
                      <Text>{order.publisher.profile?.name || order.publisher.username}</Text>
                      {order.publisher.profile?.contact_way && (
                        <>
                          <Divider type="vertical" />
                          <PhoneOutlined style={{ marginRight: "4px" }} />
                          <Text>{order.publisher.profile.contact_way}</Text>
                        </>
                      )}
                    </div>
                  )}

                  {order.accepter && (
                    <div style={{ marginBottom: "8px" }}>
                      <UserOutlined style={{ marginRight: "4px" }} />
                      <Text strong>接单者：</Text>
                      <Text>{order.accepter.profile?.name || order.accepter.username}</Text>
                      {order.accepter.profile?.contact_way && (
                        <>
                          <Divider type="vertical" />
                          <PhoneOutlined style={{ marginRight: "4px" }} />
                          <Text>{order.accepter.profile.contact_way}</Text>
                        </>
                      )}
                    </div>
                  )}

                  <div>
                    <Text type="secondary">
                      发布时间: {new Date(order.published_at).toLocaleString()}
                    </Text>
                    {order.accepted_at && (
                      <>
                        <Divider type="vertical" />
                        <Text type="secondary">
                          接单时间: {new Date(order.accepted_at).toLocaleString()}
                        </Text>
                      </>
                    )}
                    {order.completed_at && (
                      <>
                        <Divider type="vertical" />
                        <Text type="secondary">
                          完成时间: {new Date(order.completed_at).toLocaleString()}
                        </Text>
                      </>
                    )}
                  </div>
                </Col>

                <Col xs={24} lg={8}>
                  <div
                    style={{
                      textAlign: "right",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                        ¥{(parseFloat(order.meal_cost) + parseFloat(order.tip)).toFixed(2)}
                      </Title>
                      <Text type="secondary">总金额</Text>
                    </div>

                    <div style={{ marginTop: "16px" }}>{getActionButtons(order)}</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default OrderList;
