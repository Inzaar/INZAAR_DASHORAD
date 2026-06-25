import React from 'react';
import { Routes, Route, Navigate, Router } from "react-router-dom";
import { LoginPage, RegisterPageP1, RegisterPageP2, ForgetPassword } from "@/features/auth";
import ResetPage from "@/features/auth/pages/ResetPage";
import { RegisterProvider } from "@/features/auth/context/RegisterContext";
import DashboardPage from "@/features/StudentDashboard/pages/DashboardPage";
import EnrolledCourses from "@/features/StudentDashboard/pages/EnrolledCourses";
import Courses from "@/features/courses/pages/Courses";
import CourseView from "@/features/courses/pages/CourseView";
import QuizTakePage from "@/features/courses/pages/QuizTakePage";
import Certificates from "@/features/StudentDashboard/pages/Certificates";
import HelpCenter from "@/features/StudentDashboard/pages/HelpCenter";
import NotificationPage from "@/features/StudentDashboard/pages/NotificationPage";

import AdminRoute from "@/components/auth/AdminRoute";
import StudentRoute from "@/components/auth/StudentRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import ProfilePage from "@/features/StudentDashboard/pages/ProfilePage";
import AdminDashboard from "@/features/adminDashborad/pages/AdminDashboard";
import AdminCalendar from "@/features/adminDashborad/pages/AdminCalendar";
import AdminNotification from "@/features/adminDashborad/pages/AdminNotification";
import AddCoursePage from "@/features/adminDashborad/pages/AddCoursePage";
import ModeratorsPage from "@/features/adminDashborad/pages/ModeratorsPage";
import StudentProfilesPage from "@/features/adminDashborad/pages/StudentProfilesPage";
import AdminCoursesPage from "@/features/adminDashborad/pages/AdminCoursesPage";
import ReportsPage from "@/features/adminDashborad/pages/ReportsPage";
import AdminCourseDetailPage from "@/features/adminDashborad/pages/AdminCourseDetailPage";
import CertificateCard from '@/features/courses/components/CertificateCard';
import ModeratorDetails from '@/features/adminDashborad/pages/ModeratorDetails';
import StudentDetailsPage from '@/features/adminDashborad/pages/StudentDetailsPage';
import ModeratorReportsPage from '@/features/adminDashborad/pages/ModeratorReportsPage';
import CourseReportsPage from '@/features/adminDashborad/pages/CourseReportsPage';
import RegisteredUsersPage from '@/features/adminDashborad/pages/RegisteredUsersPage';
import RegisteredCoursesPage from '@/features/adminDashborad/pages/RegisteredCoursesPage';

const AppRouter = () => {
    return (
        <Routes>
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<RegisterProvider />}>
                    <Route path="/signup" element={<RegisterPageP1 />} />
                    <Route path="/register" element={<RegisterPageP1 />} />
                    <Route path="/register/step2" element={<RegisterPageP2 />} />
                </Route>
                <Route path="/forgot-password" element={<ForgetPassword />} />
                <Route path="/reset-password" element={<ResetPage />} />
            </Route>

            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-calendar" element={<AdminCalendar />} />
                <Route path="/admin-notifications" element={<AdminNotification />} />
                <Route path="/admin-add-course" element={<AddCoursePage />} />
                <Route path="/admin-moderators" element={<ModeratorsPage genderFilter="All" />} />
                <Route path="/admin-moderators/all" element={<ModeratorsPage genderFilter="All" />} />
                <Route path="/admin-moderators/male" element={<ModeratorsPage genderFilter="Male" />} />
                <Route path="/admin-moderators/female" element={<ModeratorsPage genderFilter="Female" />} />
                <Route path="/student-profiles" element={<StudentProfilesPage genderFilter="All" />} />
                <Route path="/student-profiles/all" element={<StudentProfilesPage genderFilter="All" />} />
                <Route path="/student-profiles/male" element={<StudentProfilesPage genderFilter="Male" />} />
                <Route path="/student-profiles/female" element={<StudentProfilesPage genderFilter="Female" />} />
                <Route path="/admin-courses" element={<AdminCoursesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/moderator-reports" element={<ModeratorReportsPage />} />
                <Route path="/course-reports" element={<CourseReportsPage />} />
                <Route path="/admin-course-view/:id" element={<AdminCourseDetailPage />} />
                <Route path="/admin-course-play" element={<CourseView />} />
                <Route path="/moderator-details/:id" element={<ModeratorDetails />} />
                <Route path="/admin/student-details/:id" element={<StudentDetailsPage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
                <Route path="/registered-users" element={<RegisteredUsersPage />} />
                <Route path="/registered-courses" element={<RegisteredCoursesPage />} />
            </Route>

            <Route element={<StudentRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/enrolled-courses" element={<EnrolledCourses />} />
                <Route path="/course-view" element={<CourseView />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/notifications" element={<NotificationPage />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route path="/quiz-take/:id" element={<QuizTakePage />} />
            </Route>

            {/* Fallback routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
            <Route path="/admin/*" element={<Navigate to="/admin-dashboard" replace />} />
        </Routes>
    );
};

export default AppRouter;
