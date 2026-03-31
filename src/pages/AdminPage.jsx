import { Routes, Route, Navigate } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin.js";
import LoginPage from "../components/admin/LoginPage.jsx";
import AdminLayout from "../components/admin/AdminLayout.jsx";
import Dashboard from "../components/admin/Dashboard.jsx";
import ServicesManager from "../components/admin/ServicesManager.jsx";
import SlotsManager from "../components/admin/SlotsManager.jsx";
import BookingsManager from "../components/admin/BookingsManager.jsx";

export default function AdminPage() {
  const admin = useAdmin();

  if (admin.isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!admin.isLoggedIn) {
    return <LoginPage onLogin={admin.login} />;
  }

  return (
    <AdminLayout onLogout={admin.logout}>
      <Routes>
        <Route path="/" element={<Dashboard authHeader={admin.authHeader} />} />
        <Route path="/tjanster" element={<ServicesManager authHeader={admin.authHeader} />} />
        <Route path="/tider" element={<SlotsManager authHeader={admin.authHeader} />} />
        <Route path="/bokningar" element={<BookingsManager authHeader={admin.authHeader} />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
