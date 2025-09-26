import React, { useState, useEffect } from "react";
import { Tabs, Card, Button, message } from "antd";
import { PlusOutlined, UnorderedListOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import OrderList from "../components/OrderList";
import OrderForm from "../components/OrderForm";
import AppLayout from "../components/AppLayout";
import TestModal from "../components/TestModal";

const OrderManagement: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["all", "my", "accepted", "create"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleOrderCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("my");
    message.success("订单发布成功！");
  };

  const handleOrderUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
    message.success("订单状态已更新！");
  };

  const tabItems = [
    {
      key: "all",
      label: (
        <span>
          <UnorderedListOutlined />
          所有订单
        </span>
      ),
      children: (
        <OrderList type="all" refreshTrigger={refreshTrigger} onOrderUpdate={handleOrderUpdated} />
      ),
    },
    {
      key: "my",
      label: (
        <span>
          <UserOutlined />
          我发布的
        </span>
      ),
      children: (
        <OrderList type="my" refreshTrigger={refreshTrigger} onOrderUpdate={handleOrderUpdated} />
      ),
    },
    {
      key: "accepted",
      label: (
        <span>
          <UserOutlined />
          我接受的
        </span>
      ),
      children: (
        <OrderList
          type="accepted"
          refreshTrigger={refreshTrigger}
          onOrderUpdate={handleOrderUpdated}
        />
      ),
    },
    {
      key: "create",
      label: (
        <span>
          <PlusOutlined />
          发布订单
        </span>
      ),
      children: <OrderForm onOrderCreated={handleOrderCreated} />,
    },
  ];

  return (
    <AppLayout>
      <TestModal />
      <div style={{ width: "100%", maxWidth: "100%" }}>
        <Card
          style={{
            minHeight: "calc(100vh - 200px)",
            width: "100%",
            maxWidth: "100%",
          }}
          styles={{
            body: {
              width: "100%",
              maxWidth: "100%",
              padding: "24px",
            },
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ width: "100%" }}
            tabBarExtraContent={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setActiveTab("create")}>
                发布新订单
              </Button>
            }
          />
        </Card>
      </div>
    </AppLayout>
  );
};

export default OrderManagement;
