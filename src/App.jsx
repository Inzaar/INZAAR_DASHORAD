import { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { LoginPage, RegisterPageP1, RegisterPageP2, ForgetPassword } from "./features/auth"
import ResetPage from "./features/auth/pages/ResetPage"
import DashboardPage from "./features/StudentDashboard/pages/DashboardPage"
import Loader from "./components/ui/Loader"
import EnrolledCourses from "./features/StudentDashboard/pages/EnrolledCourses"
import Courses from "./features/courses/pages/Courses"
import CourseView from "./features/courses/pages/CourseView"
import NotificationPage from "./features/StudentDashboard/pages/NotificationPage"

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
      <Route path="/signup" element={<RegisterPageP1 />} />
      <Route path="/register" element={<RegisterPageP1 />} />
      <Route path="/register/step2" element={<RegisterPageP2 />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/enrolled-courses" element={<EnrolledCourses />} />
      <Route path="/course-view" element={<CourseView />} />
      <Route path="*" element={<div className="text-white p-10">404 - Page Not Found</div>} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/notifications" element={<NotificationPage />} />
    </Routes>
  )
}

export default App
