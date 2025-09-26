import { create } from "zustand";
import { persist } from "zustand/middleware";
import AuthService, {
  type LoginRequest,
  type RegisterRequest,
  type User,
} from "../services/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  loadUserFromStorage: () => void;
  updateUser: (user: User) => void;
  initializeAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 登录
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await AuthService.login(credentials);

          if (response.success && response.data) {
            const { user, token } = response.data;

            // 保存到本地存储
            AuthService.saveToken(token);
            AuthService.saveUser(user);

            // 更新状态
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || "登录失败",
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "登录失败，请检查网络连接";
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      // 注册
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await AuthService.register(userData);

          if (response.success && response.data) {
            const { user, token } = response.data;

            // 保存到本地存储
            AuthService.saveToken(token);
            AuthService.saveUser(user);

            // 更新状态
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || "注册失败",
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "注册失败，请检查网络连接";
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      // 登出
      logout: () => {
        AuthService.clearAuth();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 从本地存储加载用户信息
      loadUserFromStorage: () => {
        const token = AuthService.getToken();
        const user = AuthService.getUser();

        if (token && user) {
          set({
            user,
            token,
            isAuthenticated: true,
          });
        }
      },

      // 更新用户信息
      updateUser: (user: User) => {
        AuthService.saveUser(user);
        set({ user });
      },

      // 初始化认证状态
      initializeAuth: () => {
        const token = AuthService.getToken();
        const user = AuthService.getUser();

        if (token && user) {
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } else {
          // 如果没有有效的token或user，确保状态为未认证
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }

        // 监听API拦截器触发的登出事件
        const handleAuthLogout = () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: "登录已过期，请重新登录",
          });
        };

        window.addEventListener("auth:logout", handleAuthLogout);

        // 返回清理函数
        return () => {
          window.removeEventListener("auth:logout", handleAuthLogout);
        };
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
