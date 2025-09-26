import { DollarOutlined, EnvironmentOutlined, ShopOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import type React from "react";
import { useState } from "react";
import api from "../services/api";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface OrderFormProps {
  onOrderCreated?: () => void;
}

interface CreateOrderData {
  delivery_address: string;
  tip: number;
  meal_cost: number;
  category: string;
  restaurant: string;
  meal_description: string;
  quantity: number;
}

const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const categories = [
    "中式快餐",
    "西式快餐",
    "日韩料理",
    "面食",
    "米饭",
    "汤品",
    "小食",
    "饮品",
    "其他",
  ];

  const restaurants = [
    "第一食堂",
    "第二食堂",
    "第三食堂",
    "清真食堂",
    "教工食堂",
    "美食广场",
    "咖啡厅",
    "其他",
  ];

  const handleSubmit = async (values: CreateOrderData) => {
    setLoading(true);
    try {
      const response = await api.post("/orders", values);

      if (response.data.success) {
        message.success("订单发布成功！");
        form.resetFields();
        onOrderCreated?.();
      } else {
        message.error(response.data.message || "订单发布失败");
      }
    } catch (error: any) {
      console.error("订单发布失败:", error);
      message.error(error.response?.data?.message || "订单发布失败");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const mealCost = form.getFieldValue("meal_cost") || 0;
    const tip = form.getFieldValue("tip") || 0;
    return (mealCost + tip).toFixed(2);
  };

  return (
    <Card>
      <Title level={4} style={{ marginBottom: "24px" }}>
        <ShopOutlined style={{ marginRight: "8px" }} />
        发布新订单
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          quantity: 1,
          tip: 0,
        }}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="餐厅"
              name="restaurant"
              rules={[{ required: true, message: "请选择餐厅" }]}
            >
              <Select placeholder="请选择餐厅" size="large">
                {restaurants.map((restaurant) => (
                  <Option key={restaurant} value={restaurant}>
                    {restaurant}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="餐品类别"
              name="category"
              rules={[{ required: true, message: "请选择餐品类别" }]}
            >
              <Select placeholder="请选择餐品类别" size="large">
                {categories.map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="餐品描述"
          name="meal_description"
          rules={[
            { required: true, message: "请输入餐品描述" },
            { min: 5, message: "餐品描述至少5个字符" },
            { max: 200, message: "餐品描述不能超过200个字符" },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="请详细描述您需要的餐品，包括具体菜品、口味要求、特殊需求等"
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              <EnvironmentOutlined style={{ marginRight: "4px" }} />
              配送地址
            </span>
          }
          name="delivery_address"
          rules={[
            { required: true, message: "请输入配送地址" },
            { min: 5, message: "配送地址至少5个字符" },
            { max: 100, message: "配送地址不能超过100个字符" },
          ]}
        >
          <Input placeholder="请输入详细的配送地址，如：XX宿舍楼XX号房间" size="large" />
        </Form.Item>

        <Row gutter={[16, 0]}>
          <Col xs={24} md={8}>
            <Form.Item
              label={
                <span>
                  <DollarOutlined style={{ marginRight: "4px" }} />
                  餐品费用 (元)
                </span>
              }
              name="meal_cost"
              rules={[
                { required: true, message: "请输入餐品费用" },
                { type: "number", min: 0.01, message: "餐品费用必须大于0" },
                {
                  type: "number",
                  max: 999.99,
                  message: "餐品费用不能超过999.99元",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="0.00"
                min={0.01}
                max={999.99}
                step={0.01}
                precision={2}
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="小费 (元)"
              name="tip"
              rules={[
                { type: "number", min: 0, message: "小费不能为负数" },
                { type: "number", max: 99.99, message: "小费不能超过99.99元" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="0.00"
                min={0}
                max={99.99}
                step={0.01}
                precision={2}
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="数量"
              name="quantity"
              rules={[
                { required: true, message: "请输入数量" },
                { type: "number", min: 1, message: "数量至少为1" },
                { type: "number", max: 10, message: "数量不能超过10" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="1"
                min={1}
                max={10}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Card
          size="small"
          style={{
            backgroundColor: "#f6f6f6",
            marginBottom: "24px",
            border: "1px solid #d9d9d9",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Text strong>订单总金额：</Text>
            </Col>
            <Col>
              <Text
                strong
                style={{
                  fontSize: "18px",
                  color: "#1890ff",
                }}
              >
                ¥{calculateTotal()}
              </Text>
            </Col>
          </Row>
          <Row style={{ marginTop: "8px" }}>
            <Col span={24}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                * 总金额 = 餐品费用 + 小费
              </Text>
            </Col>
          </Row>
        </Card>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{ minWidth: "120px" }}
            >
              发布订单
            </Button>
            <Button htmlType="reset" size="large" onClick={() => form.resetFields()}>
              重置表单
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default OrderForm;
