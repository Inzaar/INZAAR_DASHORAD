import { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { LoginPage, RegisterPageP1, RegisterPageP2, ForgetPassword } from "./features/auth"
import ResetPage from "./features/auth/pages/ResetPage"
import DashboardPage from "./features/StudentDashboard/pages/DashboardPage"
import Loader from "./components/ui/Loader"

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPageP1 />} />
      <Route path="/register/step2" element={<RegisterPageP2 />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPage />} />

      {/* Default route redirects to login for now, or dashboard if authenticated (logic later) */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/dashboard" element={<DashboardPage />} />

      {/* Catch all - 404 */}
      <Route path="*" element={<div className="text-white p-10">404 - Page Not Found</div>} />
    </Routes>
  )
}

export default App
