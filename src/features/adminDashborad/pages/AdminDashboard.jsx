import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import Navbar from '@/components/layouts/NavBar';
import SharedStudentTable from '@/components/shared/SharedStudentTable';
import PerformanceCard from '@/components/shared/PerformanceCard';
import UserCard from '../components/UserCard';
import StatsCard from '../components/StatsCard';
import CoursesEnrollmentOverview from '../components/CoursesEnrollmentOverview';
import { getAllUsers } from '@/api/user';
import { getAllCourses } from '@/api/course';
import { getAllEnrollments } from '@/api/enrollment';
import axiosInstance from '@/api/axiosInstance';
import NewBatchAlert from '@/components/layouts/ManageBatches/NewBatchAlert';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const firstName = localStorage.getItem('firstName');
    const [studentCount, setStudentCount] = useState(0);
    const [moderatorCount, setModeratorCount] = useState(0);
    const [courseCount, setCourseCount] = useState(0);
    const [courseStats, setCourseStats] = useState([]);

    // Students List Data
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 });

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const usersRes = await getAllUsers();
                if (usersRes?.data) {
                    const users = usersRes.data;
                    setStudentCount(users.filter(u => u.role === 'user').length);
                    setModeratorCount(users.filter(u => u.role === 'moderator').length);
                }
            } catch (err) { console.error('Error fetching users:', err); }

            try {
                const coursesRes = await getAllCourses();
                if (coursesRes?.data?.data) {
                    setCourseCount(coursesRes.data.data.length);
                }
                const courses = coursesRes?.data?.data || [];

                try {
                    const enrollmentsRes = await getAllEnrollments();
                    const enrollments = enrollmentsRes?.data || [];
                    const stats = courses.map(course => {
                        const count = Array.isArray(enrollments)
                            ? enrollments.filter(e => e.courseId && e.courseId._id === course._id).length
                            : 0;
                        return { count, trend: '0%', trendDirection: count > 0 ? 'up' : 'down', name: course.title };
                    });
                    setCourseStats(stats);
                } catch (err) { console.error('Error fetching enrollments:', err); }
            } catch (err) { console.error('Error fetching courses:', err); }
        };
        fetchDashboardData();
    }, []);

    const fetchStudentsTable = async (page = 1) => {
        setLoadingStudents(true);
        try {
            const res = await axiosInstance.get(`/admin/reports/students?page=${page}&limit=5`);
            if (res?.data?.data) {
                setStudents(res.data.data.studentsList || []);
                setPagination(res.data.data.pagination || { page: 1, limit: 5, total: 0, totalPages: 0 });
            }
        } catch (err) {
            console.error('Failed to fetch students for dashboard:', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    useEffect(() => {
        fetchStudentsTable(1);
    }, []);

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>

                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`
                        transition-transform duration-300 ease-in-out z-40
                        lg:translate-x-0 lg:static lg:block
                        fixed left-0 top-0 shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className="py-4 pr-2">
                            <div className="flex justify-between items-start mb-8 gap-4">
                                <div>
                                    <h2 className="text-[20px] min-[430px]:text-[24px] min-[641px]:text-3xl font-bold text-gray-900 mb-1">Aslam Alaikum {firstName} 👋🏻</h2>
                                    <p className="text-gray-500 text-[11px] min-[641px]:text-[16px]">Let's learn something new today!</p>
                                </div>
                                <GradiantButton
                                    onClick={() => navigate('/admin-add-course')}
                                    className="max-[600px]:hidden px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex gap-2"
                                >
                                    <span className='bg-white text-blue-500 rounded-full px-2 pb-0.5 flex items-center justify-center'>+</span> Add New Course
                                </GradiantButton>
                                <GradiantButton
                                    onClick={() => navigate('/admin-add-course')}
                                    className="max-[600px]:block hidden text-[24px] px-4 py-1 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                                >
                                    +
                                </GradiantButton>
                            </div>

                            <NewBatchAlert />

                            <div className="gap-6">
                                <div className=" flex flex-col gap-6">

                                    {/* Stats Cards Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <StatsCard
                                            title="Total Registered Students"
                                            value={studentCount.toString()}
                                            trend="2.4%"
                                            trendDirection="up"
                                            onClick={() => navigate('/registered-users?type=all_students')}
                                        />
                                        <StatsCard
                                            title="Inactive Students"
                                            value="0"
                                            trend="1.8%"
                                            trendDirection="up"
                                            trendText="vs last week"
                                            onClick={() => navigate('/registered-users?type=inactive_students')}
                                        />
                                        <StatsCard
                                            title="Total Courses"
                                            value={courseCount.toString()}
                                            trend="5%"
                                            trendDirection="down"
                                            trendText="vs last month"
                                            onClick={() => navigate('/registered-users')}
                                        />
                                        <StatsCard
                                            title="Total Moderator"
                                            value={moderatorCount.toString()}
                                            trend="8.2%"
                                            trendDirection="up"
                                            trendText="vs last month"
                                            onClick={() => navigate('/registered-users?type=moderators')}
                                        />
                                    </div>

                                    <div className="flex gap-6 flex-col lg:flex-row">
                                        <HoursSpentCard className="w-full lg:w-[60%] xl:w-full shadow-sm " name="Moderator Performance" />
                                        <PerformanceCard name="Course completion rate" className="w-[60%]" />
                                    </div>

                                    {/* Courses Enrollment Overview */}
                                    {courseStats.length > 0 && (
                                        <CoursesEnrollmentOverview
                                            courseStats={courseStats}
                                            limit={12}
                                            onViewAllClick={() => navigate('/admin-courses')}
                                        />
                                    )}
                                </div>

                                {/* User Cards Demo Section */}
                                {/* <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
                                        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center">
                                        <UserCard />
                                        <UserCard
                                            name="Sarah Johnson"
                                            id="748291"
                                            image="https://randomuser.me/api/portraits/women/44.jpg"
                                            performance="92%"
                                            email="sarah.j@gmail.com"
                                            status="offline"
                                        />
                                        <UserCard
                                            name="Ali Ahmed"
                                            id="839102"
                                            image="https://randomuser.me/api/portraits/men/85.jpg"
                                            performance="75%"
                                            joiningDate="5/11/2025"
                                            phone="(555) 123-4567"
                                        />
                                        <UserCard
                                            name="Ayesha Khan"
                                            id="992811"
                                            image="https://randomuser.me/api/portraits/women/65.jpg"
                                            performance="98%"
                                            joiningDate="12/09/2025"
                                            email="ayesha.k@hotmail.com"
                                        />
                                    </div>
                                </div> */}

                            </div>

                            <SharedStudentTable
                                students={students}
                                loading={loadingStudents}
                                pagination={pagination}
                                onPageChange={fetchStudentsTable}
                                title="Student Table"
                                showDropdown={true}
                            />
                        </div>

                    </main>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />
            </div>
        </div>
    );
};

export default AdminDashboard;