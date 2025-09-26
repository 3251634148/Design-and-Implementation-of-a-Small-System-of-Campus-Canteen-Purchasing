import React from "react";
import { Card, Typography, Space, Tag } from "antd";
import { useAuthStore } from "../stores/authStore";

const { Text, Title } = Typography;

const DebugInfo: React.FC = () => {
  const { user, token, isAuthenticated } = useAuthStore();

  console.log("🔍 [DebugInfo] 认证状态:", { user, token: !!token, isAuthenticated });

  return (
    <Card 
      title="调试信息" 
      size="small" 
      style={{ 
        position: "fixed", 
        top: "10px", 
        right: "10px", 
        width: "300px", 
        zIndex: 1000,
        backgroundColor: "#f0f0f0",
        border: "2px solid #1890ff"
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Text strong>认证状态: </Text>
          <Tag color={isAuthenticated ? "green" : "red"}>
            {isAuthenticated ? "已登录" : "未登录"}
          </Tag>
        </div>
        
        <div>
          <Text strong>用户ID: </Text>
          <Text>{user?.id || "无"}</Text>
        </div>
        
        <div>
          <Text strong>用户名: </Text>
          <Text>{user?.username || "无"}</Text>
        </div>
        
        <div>
          <Text strong>Token: </Text>
          <Text>{token ? "存在" : "无"}</Text>
        </div>
        
        <div>
          <Text strong>LocalStorage Token: </Text>
          <Text>{localStorage.getItem("token") ? "存在" : "无"}</Text>
        </div>
        
        <div>
          <Text strong>LocalStorage User: </Text>
          <Text>{localStorage.getItem("user") ? "存在" : "无"}</Text>
        </div>
      </Space>
    </Card>
  );
};

export default DebugInfo;