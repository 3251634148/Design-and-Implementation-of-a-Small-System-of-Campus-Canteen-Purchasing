import axios, { type AxiosInstance, type AxiosResponse } from "axios";

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理通用错误
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth-storage");

      // 触发自定义事件，让authStore处理登出逻辑
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
