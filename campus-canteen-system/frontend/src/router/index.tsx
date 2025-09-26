import { createBrowserRouter, Navigate } from "react-router-dom";
import OrderDetail from "../components/OrderDetail";
import AdminDashboard from "../pages/AdminDashboard";
import ComplaintManagement from "../pages/ComplaintManagement";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import OrderManagement from "../pages/OrderManagement";
import RegisterPage from "../pages/RegisterPage";
import RegistrationReview from "../pages/RegistrationReview";
import ServiceManagement from "../pages/ServiceManagement";
import SystemLogs from "../pages/SystemLogs";
import UserManagement from "../pages/UserManagement";
import { useAuthStore } from "../stores/authStore";

// 路由守卫组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders",
    element: (
      <ProtectedRoute>
        <OrderManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders/:id",
    element: (
      <ProtectedRoute>
        <OrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/services",
    element: (
      <ProtectedRoute>
        <ServiceManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/complaints",
    element: (
      <ProtectedRoute>
        <ComplaintManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/registration-review",
    element: (
      <ProtectedRoute>
        <RegistrationReview />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/system-logs",
    element: (
      <ProtectedRoute>
        <SystemLogs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute>
        <UserManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
