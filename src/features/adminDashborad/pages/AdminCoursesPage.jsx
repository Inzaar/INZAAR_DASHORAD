import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import StatsCard from '../components/StatsCard';
import CoursesEnrollmentOverview from '../components/CoursesEnrollmentOverview';
import CardCourse from '@/features/courses/components/CardCourse';
import { Plus, ChevronDown, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllCourses } from '@/api/course';
import { getAllEnrollments } from '@/api/enrollment';
import { useTranslation } from 'react-i18next';

const AdminCoursesPage = () => {
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const courseIdParam = searchParams.get('courseId');
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('All');
    const [courses, setCourses] = useState([]);
    const [courseStats, setCourseStats] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 640 ? 4 : 12);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 640 ? 4 : 12);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const fetchCoursesData = async () => {
            setLoading(true);
            let coursesData = [];
            let enrollmentsData = [];

            try {
                const coursesRes = await getAllCourses();
                coursesData = coursesRes?.data?.data || [];
            } catch (err) {
                console.error("Error fetching courses:", err);
            }

            try {
                const enrollmentsRes = await getAllEnrollments();
                enrollmentsData = enrollmentsRes?.data || [];
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
                    status: (course.status || '').toLowerCase() === 'draft' ? 'Draft' : 
                            (course.status || '').toLowerCase() === 'inactive' ? 'Inactive' : 'Active'
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
            setLoading(false);
        };
        fetchCoursesData();
    }, []);

    // Handle deep linking/scrolling
    useEffect(() => {
        if (!loading && courseIdParam && courses.length > 0) {
            // Find the course
            const courseIndex = courses.findIndex(c => c.id === courseIdParam);

            if (courseIndex !== -1) {
                const targetCourse = courses[courseIndex];

                // Set the correct tab based on course status
                if (targetCourse.status === 'Draft') setActiveTab('Draft Courses');
                else if (targetCourse.status === 'Active') setActiveTab('Active Courses');
                else setActiveTab('All');

                // Calculate page
                const filtered = targetCourse.status === 'Draft' ? courses.filter(c => c.status === 'Draft') :
                    targetCourse.status === 'Active' ? courses.filter(c => c.status === 'Active') : courses;
                const filteredIndex = filtered.findIndex(c => c.id === courseIdParam);
                const targetPage = Math.floor(filteredIndex / itemsPerPage) + 1;
                setCurrentPage(targetPage);

                // Scroll and highlight
                setTimeout(() => {
                    const element = document.getElementById(`admin-course-${courseIdParam}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('ring-4', 'ring-[#5D5FEF]', 'ring-offset-4', 'rounded-2xl', 'scale-105');
                        setTimeout(() => {
                            element.classList.remove('ring-4', 'ring-[#5D5FEF]', 'ring-offset-4', 'scale-105');
                        }, 3000);
                    }
                }, 600);
            }
        }
    }, [loading, courseIdParam, courses, itemsPerPage]);

    const activeCount = courses.filter(c => c.status === 'Active').length;
    const inactiveCount = courses.filter(c => c.status === 'Inactive').length;
    const draftCount = courses.filter(c => c.status === 'Draft').length;

    const stats = [
        { title: t('total_registered_courses', 'Total Registered Courses'), value: courses.length.toString(), trend: "2.4%", trendDirection: "up", trendText: t('vs_last_month', 'vs last month') },
        { title: t('active_courses', 'Active Courses'), value: activeCount.toString(), trend: "2.4%", trendDirection: "up", trendText: t('vs_last_month', 'vs last month') },
        { title: t('inactive_courses', 'Inactive Courses'), value: inactiveCount.toString(), trend: "2.4%", trendDirection: "down", trendText: t('vs_last_month', 'vs last month') },
        { title: t('draft_courses', 'Draft Courses'), value: draftCount.toString(), trend: "2.4%", trendDirection: "up", trendText: t('vs_last_month', 'vs last month') },
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
                        lg:translate-x-0 lg:static lg:block lg:h-full lg:shrink-0
                        fixed left-0 top-0 shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-4 pr-2">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8 gap-4">
                                <div>
                                    <h2 className="text-[24px] font-bold text-gray-900 mb-1">{t('courses', 'Courses')}</h2>
                                    <p className="text-gray-500 text-[16px]">{t('manage_all_your_courses', 'Manage All Your Courses')}</p>
                                </div>
                                <button
                                    onClick={() => navigate('/admin-add-course')}
                                    className="w-11 h-11 sm:w-auto sm:px-5 sm:py-2.5 bg-[#8B5CF6] text-white font-medium rounded-xl sm:rounded-lg hover:bg-purple-600 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <div className="flex items-center justify-center bg-white rounded-full p-0.5">
                                        <Plus size={16} strokeWidth={3} className="text-[#8B5CF6]" />
                                    </div>
                                    <span className="hidden sm:block text-[14px]">{t('add_new_course', 'Add New Course')}</span>
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat, index) => {
                                    return (
                                        <StatsCard
                                            key={index}
                                            {...stat}
                                            trendColor={stat.trendDirection === 'down' ? 'text-red-500' : 'text-green-500'}
                                            iconColor={stat.trendDirection === 'down' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
<<<<<<< Updated upstream
                                            onClick={() => navigate(`/registered-courses?type=${stat.type}`)}
=======
                                            onClick={() => {
                                                const types = ['all', 'active', 'inactive', 'draft'];
                                                if (types[index]) {
                                                    navigate(`/registered-courses?type=${types[index]}`);
                                                }
                                            }}
>>>>>>> Stashed changes
                                        />
                                    );
                                })}
                            </div>

                            {/* Enrollment Overview */}
                            {courseStats.length > 0 && (
                                <CoursesEnrollmentOverview
                                    courseStats={courseStats}
                                    limit={12}
                                    showViewAll={false}
                                    showViewMore={true}
                                />
                            )}

                            {/* Main Content Card */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">{t('all_courses', 'All Courses')}</h3>

                                    <div className="relative">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                            {t('sort', 'Sort')}
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Desktop Tabs */}
                                <div className="hidden sm:flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-lg w-fit">
                                    {['All', 'Active Courses', 'Inactive Courses', 'Draft Courses'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => {
                                                setActiveTab(tab);
                                                setCurrentPage(1);
                                                navigate('/admin-courses', { replace: true });
                                            }}
                                            className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === tab
                                                ? 'bg-[#A78BFA] text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                        >
                                            {tab === 'All' ? t('all_registered_courses', 'All Registered Courses') : t(tab.toLowerCase().replace(' ', '_'), tab)}
                                        </button>
                                    ))}
                                </div>

                                {/* Mobile Filter Dropdown */}
                                <div className="sm:hidden mb-8 relative">
                                    <div className="relative">
                                        <select
                                            value={activeTab}
                                            onChange={(e) => {
                                                setActiveTab(e.target.value);
                                                setCurrentPage(1);
                                                navigate('/admin-courses', { replace: true });
                                            }}
                                            className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none appearance-none cursor-pointer shadow-sm"
                                        >
                                            <option value="All">{t('all_registered_courses', 'All Registered Courses')}</option>
                                            <option value="Active Courses">{t('active_courses', 'Active Courses')}</option>
                                            <option value="Inactive Courses">{t('inactive_courses', 'Inactive Courses')}</option>
                                            <option value="Draft Courses">{t('draft_courses', 'Draft Courses')}</option>
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Courses Grid */}
                                {loading ? (
                                    <div className="w-full py-24 flex items-center justify-center">
                                        <Loader className="w-10 h-10 text-[#3758EE] animate-spin" />
                                    </div>
                                ) : filteredCourses.length === 0 ? (
                                    <div className="w-full py-16 flex items-center justify-center text-gray-500 font-medium text-lg">
                                        {t('no_course_registered', 'There is no any course registered for now')}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 items-start justify-items-center">
                                        {filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((course) => (
                                            <div key={course.id} id={`admin-course-${course.id}`} className="w-full max-w-[340px] transition-all duration-500">
                                                <CardCourse
                                                    course={course}
                                                    isAdmin={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Enhanced Pagination */}
                                {filteredCourses.length > itemsPerPage && (
                                    <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-2 mt-10 pb-6">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className={`flex items-center gap-1 px-2 sm:px-3 py-2 text-sm font-medium transition-colors ${currentPage === 1
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:text-[#7C3AED]'
                                                }`}
                                        >
                                            <ChevronLeft size={18} />
                                            <span className="hidden sm:inline">Previous</span>
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {(() => {
                                                const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
                                                const pages = [];
                                                const maxVisible = window.innerWidth < 640 ? 3 : 5;
                                                let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                                let end = Math.min(totalPages, start + maxVisible - 1);
                                                if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

                                                for (let i = start; i <= end; i++) {
                                                    pages.push(
                                                        <button
                                                            key={i}
                                                            onClick={() => setCurrentPage(i)}
                                                            className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-[12px] transition-all ${currentPage === i
                                                                ? 'bg-gradient-to-br from-[#A5A6FF] to-[#7C3AED] text-white shadow-lg shadow-purple-200'
                                                                : 'text-gray-500 hover:text-[#7C3AED] hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {i}
                                                        </button>
                                                    );
                                                }
                                                return pages;
                                            })()}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredCourses.length / itemsPerPage), prev + 1))}
                                            disabled={currentPage === Math.ceil(filteredCourses.length / itemsPerPage)}
                                            className={`flex items-center gap-1 px-2 sm:px-3 py-2 text-sm font-medium transition-colors ${currentPage === Math.ceil(filteredCourses.length / itemsPerPage)
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:text-[#7C3AED]'
                                                }`}
                                        >
                                            <span className="hidden sm:inline">{t("next", "Next")}</span>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
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
