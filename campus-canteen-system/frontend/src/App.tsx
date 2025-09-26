import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useAuthStore } from "./stores/authStore";
import "./App.css";

function App() {
  const { initializeAuth } = useAuthStore();

  // 应用启动时初始化认证状态
  useEffect(() => {
    const cleanup = initializeAuth();
    return cleanup;
  }, [initializeAuth]);

  return (
    <ConfigProvider locale={zhCN}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </ConfigProvider>
  );
}

export default App;
