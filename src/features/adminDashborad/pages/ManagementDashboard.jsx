import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
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

const ManagementDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const firstName = localStorage.getItem('firstName');
    const [studentCount, setStudentCount] = useState(0);
    const [moderatorCount, setModeratorCount] = useState(0);
    const [courseCount, setCourseCount] = useState(0);
    const [courseStats, setCourseStats] = useState([]);
    const [moderatorsData, setModeratorsData] = useState([]);
    const [coursesList, setCoursesList] = useState([]);
    const [activeTable, setActiveTable] = useState('students');

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
                    
                    const mods = users.filter(u => u.role === 'moderator');
                    setModeratorCount(mods.length);
                    setModeratorsData(mods);
                }
            } catch (err) { console.error('Error fetching users:', err); }

            try {
                const coursesRes = await getAllCourses();
                if (coursesRes?.data?.data) {
                    setCourseCount(coursesRes.data.data.length);
                }
                const courses = coursesRes?.data?.data || [];
                setCoursesList(courses);

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

    const fetchStudentsTable = async (page = 1, status = 'Active') => {
        setLoadingStudents(true);
        try {
            const statusQuery = status === 'Inactive' ? '&status=Inactive' : '';
            const res = await axiosInstance.get(`/admin/reports/students?page=${page}&limit=5${statusQuery}`);
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
        if (activeTable === 'students') {
            fetchStudentsTable(1, 'Active');
        } else if (activeTable === 'inactive') {
            fetchStudentsTable(1, 'Inactive');
        }
    }, [activeTable]);

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
                                    <h2 className="text-[20px] min-[430px]:text-[24px] min-[641px]:text-3xl font-medium text-gray-500 mb-1">Aslam Alaikum {firstName}</h2>
                                    <p className="text-gray-500 text-[11px] min-[641px]:text-[16px]">Here is your management overview!</p>
                                </div>
                            </div>

                            <div className="gap-6">
                                <div className=" flex flex-col gap-6">

                                    {/* Stats Cards Section */}
                                    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-thin md:overflow-visible">
                                        <StatsCard
                                            title="Total Registered Students"
                                            value={studentCount.toString()}
                                            trend="2.4%"
                                            trendDirection="up"
                                            onClick={() => setActiveTable('students')}
                                        />
                                        <StatsCard
                                            title="Inactive Students"
                                            value="0"
                                            trend="1.8%"
                                            trendDirection="up"
                                            trendText="vs last week"
                                            onClick={() => setActiveTable('inactive')}
                                        />
                                        <StatsCard
                                            title="Total Courses"
                                            value={courseCount.toString()}
                                            trend="5%"
                                            trendDirection="down"
                                            trendText="vs last month"
                                            onClick={() => setActiveTable('courses')}
                                        />
                                        <StatsCard
                                            title="Total Moderator"
                                            value={moderatorCount.toString()}
                                            trend="8.2%"
                                            trendDirection="up"
                                            trendText="vs last month"
                                            onClick={() => setActiveTable('moderators')}
                                        />
                                    </div>

                                    <div className="flex gap-6 flex-col lg:flex-row">
                                        <HoursSpentCard className="w-full lg:w-[68%] shadow-sm" name="Moderator Performance" moderators={moderatorsData} />
                                        <PerformanceCard name="Course completion rate" className="w-full lg:w-[32%]" />
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
                            </div>

                            {activeTable === 'students' || activeTable === 'inactive' ? (
                                <SharedStudentTable
                                    students={students}
                                    loading={loadingStudents}
                                    pagination={pagination}
                                    onPageChange={(page) => fetchStudentsTable(page, activeTable === 'inactive' ? 'Inactive' : 'Active')}
                                    title={activeTable === 'inactive' ? "Inactive Students Table" : "Student Table"}
                                    showDropdown={true}
                                />
                            ) : activeTable === 'courses' ? (
                                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8 mt-6 flex flex-col flex-1 min-h-[600px]">
                                    <div className="mb-6 flex justify-between items-center">
                                        <h3 className="text-[20px] font-bold text-gray-900 mb-1">Courses Table</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[900px]">
                                            <thead>
                                                <tr className="border-b border-gray-50 uppercase text-[12px] font-bold text-gray-800">
                                                    <th className="text-left pb-4 pl-4 font-bold">Course Title</th>
                                                    <th className="text-center pb-4 font-bold">Lectures</th>
                                                    <th className="text-center pb-4 font-bold">Duration</th>
                                                    <th className="text-center pb-4 font-bold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50/50">
                                                {coursesList.length === 0 ? <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-medium">No courses found.</td></tr> : coursesList.map((course) => (
                                                    <tr key={course.id || course._id} className="hover:bg-gray-50/40 transition-colors">
                                                        <td className="py-6 pl-4 font-medium text-gray-800">{course.title}</td>
                                                        <td className="py-6 text-center text-gray-700 font-medium">{course.lectures}</td>
                                                        <td className="py-6 text-center text-gray-700 font-medium">{course.duration}</td>
                                                        <td className="py-6 text-center">
                                                            <span className={course.status === 'Active' ? "text-emerald-500 font-medium" : "text-gray-400 font-medium"}>{course.status || 'Active'}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8 mt-6 flex flex-col flex-1 min-h-[600px]">
                                    <div className="mb-6 flex justify-between items-center">
                                        <h3 className="text-[20px] font-bold text-gray-900 mb-1">Moderators Table</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[900px]">
                                            <thead>
                                                <tr className="border-b border-gray-50 uppercase text-[12px] font-bold text-gray-800">
                                                    <th className="text-left pb-4 pl-4 font-bold">Name</th>
                                                    <th className="text-left pb-4 font-bold">Email</th>
                                                    <th className="text-center pb-4 font-bold">Phone Number</th>
                                                    <th className="text-center pb-4 font-bold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50/50">
                                                {moderatorsData.length === 0 ? <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-medium">No moderators found.</td></tr> : moderatorsData.map((mod) => (
                                                    <tr key={mod.id || mod._id} className="hover:bg-gray-50/40 transition-colors">
                                                        <td className="py-6 pl-4 font-medium text-gray-800">{mod.firstname} {mod.lastname}</td>
                                                        <td className="py-6 text-left text-gray-500">{mod.email}</td>
                                                        <td className="py-6 text-center text-gray-700 font-medium">{mod.phone}</td>
                                                        <td className="py-6 text-center">
                                                            <span className={mod.status === 'Active' ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>{mod.status || 'Active'}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
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

export default ManagementDashboard;