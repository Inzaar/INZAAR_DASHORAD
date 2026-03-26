import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import StatsCard from '../components/StatsCard';
import CoursesEnrollmentOverview from '../components/CoursesEnrollmentOverview';
import CardCourse from '@/features/courses/components/CardCourse';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses } from '@/api/course';
import { getAllEnrollments } from '@/api/enrollment';

const AdminCoursesPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [courses, setCourses] = useState([]);
    const [courseStats, setCourseStats] = useState([]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const fetchCoursesData = async () => {
            let coursesData = [];
            let enrollmentsData = [];

            try {
                const coursesRes = await getAllCourses();
                coursesData = coursesRes?.data?.data || [];
                console.log("coursesData fetched:", coursesData.length);
            } catch (err) {
                console.error("Error fetching courses:", err);
            }

            try {
                const enrollmentsRes = await getAllEnrollments();
                enrollmentsData = enrollmentsRes?.data || [];
                console.log("enrollmentsData fetched:", enrollmentsData?.length);
            } catch (err) {
                console.error("Error fetching enrollments:", err);
            }

            if (coursesData.length > 0) {
                const mappedCourses = coursesData.map(course => ({
                    id: course._id,
                    title: course.title,
                    date: new Date(course.createdAt || Date.now()).toLocaleDateString(),
                    lecturesCount: `${course.totalLectures || 0} Lectures`,
                    duration: course.duration || "N/A",
                    time: course.duration || "N/A",
                    description: course.description || "Learn the concepts step-by-step.",
                    thumbnail: course.thumbnail || null,
                    status: course.status === "draft" ? "Draft" : "Active"
                }));
                setCourses(mappedCourses);

                const statsMatrix = coursesData.map(course => {
                    const count = Array.isArray(enrollmentsData)
                        ? enrollmentsData.filter(e => e.courseId && e.courseId._id === course._id).length
                        : 0;
                    return {
                        count,
                        trend: '0%',
                        trendDirection: count > 0 ? 'up' : 'down',
                        name: course.title
                    };
                });
                setCourseStats(statsMatrix);
            }
        };
        fetchCoursesData();
    }, []);

    const activeCount = courses.filter(c => c.status === 'Active').length;
    const inactiveCount = courses.filter(c => c.status === 'Inactive').length;
    const draftCount = courses.filter(c => c.status === 'Draft').length;

    const stats = [
        { title: "Total Registered Courses", value: courses.length.toString(), trend: "2.4%", trendDirection: "up", trendText: "vs last month" },
        { title: "Active Courses", value: activeCount.toString(), trend: "2.4%", trendDirection: "up", trendText: "vs last month" },
        { title: "Inactive Courses", value: inactiveCount.toString(), trend: "2.4%", trendDirection: "down", trendText: "vs last month" },
        { title: "Draft Courses", value: draftCount.toString(), trend: "2.4%", trendDirection: "up", trendText: "vs last month" },
    ];



    const filteredCourses = activeTab === 'All'
        ? courses
        : courses.filter(course => {
            if (activeTab === 'Active Courses') return course.status === 'Active';
            if (activeTab === 'Inactive Courses') return course.status === 'Inactive';
            if (activeTab === 'Draft Courses') return course.status === 'Draft';
            return true;
        });

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />

                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative'>

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
                        fixed left-0 top-0 h-full lg:max-h-[800px] shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-4 pr-2">
                            {/* Header */}
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-[24px] font-bold text-gray-900 mb-1">Courses</h2>
                                    <p className="text-gray-500 text-[16px]">Manage All Your Courses</p>
                                </div>
                                <GradiantButton
                                    onClick={() => navigate('/admin-add-course')}
                                    className="px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex gap-2 items-center"
                                >
                                    <Plus size={18} className="bg-white text-[#3758EE] rounded-full p-0.5" />
                                    Add New Course
                                </GradiantButton>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat, index) => (
                                    <StatsCard
                                        key={index}
                                        {...stat}
                                        trendColor={stat.trendDirection === 'down' ? 'text-red-500' : 'text-green-500'}
                                        iconColor={stat.trendDirection === 'down' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
                                    />
                                ))}
                            </div>

                            {/* Enrollment Overview */}
                            {courseStats.length > 0 && <CoursesEnrollmentOverview courseStats={courseStats} />}

                            {/* Main Content Card */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">All Courses</h3>

                                    <div className="relative">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                            Sort
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-lg w-fit">
                                    {['All', 'Active Courses', 'Inactive Courses', 'Draft Courses'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === tab
                                                ? 'bg-[#A78BFA] text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                        >
                                            {tab === 'All' ? 'All Registered Courses' : tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Courses Grid */}
                                {filteredCourses.length === 0 ? (
                                    <div className="w-full py-16 flex items-center justify-center text-gray-500 font-medium text-lg">
                                        There is no any course registered for now
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredCourses.map((course) => (
                                            <CardCourse
                                                key={course.id}
                                                course={course}
                                                isAdmin={true}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                <div className="flex justify-end items-center gap-2 mt-8">
                                    <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                                        Previous
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">1</button>
                                    <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#6366F1] rounded-lg shadow-sm">2</button>
                                    <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">3</button>
                                    <span className="text-gray-400">...</span>
                                    <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                                        Next
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}} />
                </div>
            </div>
        </div>
    );
};

export default AdminCoursesPage;
