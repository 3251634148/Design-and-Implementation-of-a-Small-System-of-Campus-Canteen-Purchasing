import React from "react";
import { Button, Modal, message } from "antd";

const TestModal: React.FC = () => {
  const testModal = () => {
    console.log("🧪 [TestModal] 测试Modal开始");
    
    try {
      const modalInstance = Modal.confirm({
        title: "测试Modal",
        content: "这是一个测试Modal，用于验证Modal组件是否正常工作",
        okText: "确认",
        cancelText: "取消",
        centered: true,
        onOk: () => {
          console.log("✅ [TestModal] 用户点击了确认");
          message.success("测试成功！Modal正常工作");
        },
        onCancel: () => {
          console.log("❌ [TestModal] 用户点击了取消");
          message.info("测试取消");
        }
      });
      
      console.log("🧪 [TestModal] Modal实例创建:", modalInstance);
    } catch (error) {
      console.error("❌ [TestModal] Modal创建失败:", error);
    }
  };

  return (
    <div style={{ 
      position: "fixed", 
      bottom: "20px", 
      left: "20px", 
      zIndex: 1000,
      backgroundColor: "#fff",
      padding: "10px",
      border: "2px solid #52c41a",
      borderRadius: "4px"
    }}>
      <Button type="primary" onClick={testModal}>
        测试Modal
      </Button>
    </div>
  );
};

export default TestModal;