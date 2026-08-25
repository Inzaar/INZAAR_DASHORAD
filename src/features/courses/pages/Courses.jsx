import React, { useEffect } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useTranslation } from 'react-i18next';
import { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllCourses, getEnrolledCoursesByUserId } from '@/api/course';
import { useAuth } from '@/context/AuthContext';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import CardCourse from '../components/CardCourse';
import course from "../../../assets/images/course2.png"
import icon from "../../../assets/logos/Abu_Yahya.png"

const Courses = () => {
    const { user } = useAuth();
    const [enrolledCourseIds, setEnrolledCourseIds] = React.useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const courseIdParam = searchParams.get('courseId');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = React.useState('all');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(20);
    const [courses, setCourses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const fetchEnrolled = async () => {
            if (user?.role === 'guest' || !user) return;
            try {
                const res = await getEnrolledCoursesByUserId();
                if (res.data?.success) {
                    const ids = res.data.data.map(c => c.courseId || c._id);
                    setEnrolledCourseIds(ids);
                }
            } catch (error) {
                console.error("Failed to fetch enrolled courses:", error);
            }
        };
        fetchEnrolled();
    }, [user]);

    // Sync tab with URL parameter
    useEffect(() => {
        if (tabParam === 'new') {
            setActiveTab('new');
        }
    }, [tabParam]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await getAllCourses({ status: 'published' });
                if (res.data?.success) {
                    setCourses(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Handle deep linking/scrolling
    useEffect(() => {
        if (!loading && courseIdParam && courses.length > 0) {
            // Find the course and its index in the current filtered view
            const filtered = (activeTab === 'new' ? courses.filter(c => c.isNewCourse) : courses);
            const courseIndex = filtered.findIndex(c => c._id === courseIdParam);

            if (courseIndex !== -1) {
                // Calculate which page it's on
                const targetPage = Math.floor(courseIndex / itemsPerPage) + 1;
                setCurrentPage(targetPage);

                // Scroll to it after a short delay to ensure rendering
                setTimeout(() => {
                    const element = document.getElementById(`course-${courseIdParam}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add a temporary highlight effect
                        element.classList.add('ring-4', 'ring-purple-400', 'ring-offset-4', 'rounded-2xl');
                        setTimeout(() => {
                            element.classList.remove('ring-4', 'ring-purple-400', 'ring-offset-4');
                        }, 3000);
                    }
                }, 500);
            }
        }
    }, [loading, courseIdParam, courses, activeTab, itemsPerPage]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1024) { // lg and above: 4 cols
                setItemsPerPage(12); // 3 rows * 4 cols
            } else if (width >= 640) { // sm: 2 cols
                setItemsPerPage(10); // 5 rows * 2 cols
            } else { // mobile: 1 col
                setItemsPerPage(4); // 4 rows * 1 col
            }
        };

        // Initial call
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Helper to format course data for Card
    const formatCourseForCard = (courseData) => ({
        id: courseData._id,
        title: courseData.title,
        time: `${courseData.totalLectures || 0} ${t('lectures', 'Lectures')} (${courseData.duration || 'N/A'})`,
        description: courseData.description || "Course description unavailable",
        thumbnail: courseData.thumbnail || course, // Fallback image if needed
        icon: icon, // Using static icon for now as per design
        date: new Date(courseData.createdAt).toLocaleDateString(),
        isNew: courseData.isNewCourse,
        link: `/course-details/${courseData._id}`,
        isEnrolled: enrolledCourseIds.includes(courseData._id)
    });

    const filteredCourses = (activeTab === 'new'
        ? [...courses]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
        : courses
    ).map(formatCourseForCard);

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to first page
        // Clean URL params when manually switching tabs
        navigate('/courses', { replace: true });
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Max visible page buttons (excluding prev/next)

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis-start');
            }

            // Logic for middle pages
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust window if close to boundaries
            if (currentPage <= 3) {
                end = 4;
            }
            if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            for (let i = start; i <= end; i++) {
                if (i > 1 && i < totalPages) {
                    pages.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis-end');
            }

            // Always show last page
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="h-screen  w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-white font-sans text-slate-800 h-screen overflow-hidden gap-4">
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

                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className="py-4 pr-2">
                            <div className="flex bg-gray-200 w-full max-w-[500px] rounded-lg p-1 mb-8">
                                {activeTab === 'all' ? (
                                    <GradiantButton className="w-[50%] px-4 py-3 rounded-lg shadow-sm">
                                        {t('all_courses', 'All Courses')}
                                    </GradiantButton>
                                ) : (
                                    <div
                                        onClick={() => handleTabChange('all')}
                                        className="w-[50%] px-4 py-3 rounded-lg flex items-center justify-center cursor-pointer text-gray-500 font-medium hover:text-gray-900 transition-colors"
                                    >
                                        {t('all_courses', 'All Courses')}
                                    </div>
                                )}

                                {activeTab === 'new' ? (
                                    <GradiantButton className="w-[50%] px-4 py-3 rounded-lg shadow-sm">
                                        {t('new_courses', 'New Courses')}
                                    </GradiantButton>
                                ) : (
                                    <div
                                        onClick={() => handleTabChange('new')}
                                        className="w-[50%] px-4 py-3 rounded-lg flex items-center justify-center cursor-pointer text-gray-500 font-medium hover:text-gray-900 transition-colors"
                                    >
                                        {t('new_courses', 'New Courses')}
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {activeTab === 'new' ? t('new_courses', 'New Courses') : t('all_courses', 'All Courses')}
                                </h2>
                                <p className="text-gray-500">
                                    {activeTab === 'new'
                                        ? t('latest_additions_desc', 'Check out the latest additions to our curriculum.')
                                        : t('top_picks_desc', 'We know the best things for You. Top picks for You.')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 items-start justify-items-center">
                                {currentCourses.map((course) => (
                                    <div key={course.id} id={`course-${course.id}`} className="w-full max-w-[340px] transition-all duration-500">
                                        <CardCourse course={course} />
                                    </div>
                                ))}
                            </div>

                            <PaginationContent className="w-full flex items-center justify-center lg:justify-end mt-8 gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>

                                {getPageNumbers().map((page, index) => (
                                    <PaginationItem key={index}>
                                        {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                onClick={() => handlePageChange(page)}
                                                isActive={page === currentPage}
                                                className={page === currentPage ? "bg-gradient-to-r from-[#A892FF] to-[#6C5DDC] text-white cursor-pointer" : "cursor-pointer hover:bg-gray-100"}
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
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

export default Courses;