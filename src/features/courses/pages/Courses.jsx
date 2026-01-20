import React from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/Navbar';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { useNavigate } from 'react-router-dom';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import CardCourse from '../components/CardCourse';
import course from "../../../assets/images/course2.png"
import icon from "../../../assets/logos/Abu_Yahya.png"

const Courses = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = React.useState('all');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(20); // Default to desktop (4 cols * 5 rows)

    // Calculate items per page based on screen width
    React.useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1280) { // xl: 4 cols
                setItemsPerPage(20); // 5 rows * 4 cols
            } else if (width >= 1024) { // lg: 3 cols
                setItemsPerPage(15); // 5 rows * 3 cols
            } else if (width >= 640) { // sm: 2 cols
                setItemsPerPage(10); // 5 rows * 2 cols
            } else { // mobile: 1 col
                setItemsPerPage(5); // 5 rows * 1 col
            }
        };

        // Initial call
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate more mock data
    const baseCourses = [
        {
            id: 1,
            title: "Akhrat Kay Dalail Aur Ahwal E Akhrat Course",
            time: "10 Lectures (3 Hours, 23 Minutes, 24 Seconds)",
            description: "Course Explains Day Of Judgment Using Quranic Verses And Authentic Ahadith.",
            thumbnail: course,
            icon: icon,
            date: "5 Feb 2024",
            isNew: true,
            link: "/course-view"
        },
        {
            id: 2,
            title: "Dora Quran Course (Only In Ramzan)",
            time: "54 Lectures (24 Hours, 24 Minutes, 5 Seconds)",
            description: "Dora-E-Quran Course Covers Quranic Subjects Taught By Sir Abu Yahya.",
            thumbnail: course,
            icon: icon,
            date: "5 Feb 2024",
            isNew: true,
            link: "/course-view"
        },
        {
            id: 3,
            title: "Imaniyaat Course – Nijat Ka Rasta (Path To Eternal Success) Series",
            time: "7 Lectures + Q&A (6 Hours, 53 Minutes, 41 Seconds)",
            description: "Course Guiding To Eternal Success Through Qur'an And Prophet's Authentic Teachings.",
            thumbnail: course,
            icon: icon,
            date: "5 Feb 2024",
            link: "/course-view"
        },
        {
            id: 4,
            title: "Stress Management Course",
            time: "9 Lectures (3 Hours, 26 Minutes, 24 Seconds)",
            description: "Course Teaches Managing Stress, Finding Peace Amidst Life's Hardships And Worries.",
            thumbnail: course,
            icon: icon,
            date: "5 Feb 2024",
            link: "/course-view"
        },
        {
            id: 5,
            title: "Dora Quran Course (Only In Ramzan)",
            time: "54 Lectures (24 Hours, 24 Minutes, 5 Seconds)",
            description: "Dora-E-Quran Course Covers Quranic Subjects Taught By Sir Abu Yahya.",
            thumbnail: course,
            icon: icon,
            date: "5 Feb 2024",
            link: "/course-view"
        },
        {
            id: 6,
            title: "Akhrat Kay Dalail Aur Ahwal E Akhrat Course",
            time: "10 Lectures (3 Hours, 23 Minutes, 24 Seconds)",
            description: "Course Explains Day Of Judgment Using Quranic Verses And Authentic Ahadith.",
            thumbnail: course,
            icon: icon,
            date: "5 Feb 2024",
            link: "/course-view"
        },
        {
            id: 7,
            title: "Stress Management Course",
            time: "9 Lectures (3 Hours, 26 Minutes, 24 Seconds)",
            description: "Course Teaches Managing Stress, Finding Peace Amidst Life's Hardships And Worries.",
            thumbnail: course,
            icon: icon,
            date: "5 Feb 2024",
            link: "/course-view"
        },
        {
            id: 8,
            title: "Imaniyaat Course – Nijat Ka Rasta (Path To Eternal Success) Series",
            time: "7 Lectures + Q&A (6 Hours, 53 Minutes, 41 Seconds)",
            description: "Course Guiding To Eternal Success Through Qur'an And Prophet's Authentic Teachings.",
            thumbnail: course,
            icon: icon,
            date: "5 Feb 2024",
            link: "/course-view"
        }
    ];

    // Create a larger dataset (e.g. 120 items to verify pagination)
    const allCoursesData = Array.from({ length: 120 }, (_, i) => {
        const base = baseCourses[i % baseCourses.length];
        // Make every 3rd item 'New' for variety if not already set in base
        const isNew = base.isNew || (i % 3 === 0);
        return {
            ...base,
            id: i + 1,
            title: `${base.title} ${Math.floor(i / 8) + 1}`,
            isNew: isNew
        };
    });

    // Filter Logic
    const filteredCourses = activeTab === 'new'
        ? allCoursesData.filter(c => c.isNew)
        : allCoursesData;

    // Pagination Logic
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to first page
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Optionally scroll to top of grid
            // window.scrollTo(0, 0); 
        }
    };

    // Helper to generate pagination items
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
        /* 1. Added 'h-screen' and 'overflow-hidden' to the wrapper to prevent double scrollbars */
        <div className="h-screen  w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative'>

                    {/* Mobile Sidebar Overlay */}
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

                    {/* 2. Used 'scrollbar-hide' and custom inline styles to ensure it's gone in all browsers */}
                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',  /* IE and Edge */
                        scrollbarWidth: 'none'    /* Firefox */
                    }}>
                        {/* Inner content wrapper */}
                        <div className="py-4 pr-2">
                            <div className="flex bg-gray-200 w-full max-w-[500px] rounded-lg p-1 mb-8">
                                {activeTab === 'all' ? (
                                    <GradiantButton className="w-[50%] px-4 py-3 rounded-lg shadow-sm">
                                        All Courses
                                    </GradiantButton>
                                ) : (
                                    <div
                                        onClick={() => handleTabChange('all')}
                                        className="w-[50%] px-4 py-3 rounded-lg flex items-center justify-center cursor-pointer text-gray-500 font-medium hover:text-gray-900 transition-colors"
                                    >
                                        All Courses
                                    </div>
                                )}

                                {activeTab === 'new' ? (
                                    <GradiantButton className="w-[50%] px-4 py-3 rounded-lg shadow-sm">
                                        New Courses
                                    </GradiantButton>
                                ) : (
                                    <div
                                        onClick={() => handleTabChange('new')}
                                        className="w-[50%] px-4 py-3 rounded-lg flex items-center justify-center cursor-pointer text-gray-500 font-medium hover:text-gray-900 transition-colors"
                                    >
                                        New Courses
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {activeTab === 'new' ? 'New Courses' : 'All Courses'}
                                </h2>
                                <p className="text-gray-500">
                                    {activeTab === 'new'
                                        ? 'Check out the latest additions to our curriculum.'
                                        : 'We know the best things for You. Top picks for You.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 place-items-center">
                                {currentCourses.map((course) => (
                                    <CardCourse key={course.id} course={course} />
                                ))}
                            </div>

                            {/* </div> */}
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

                {/* 3. Global CSS to hide scrollbars for Chrome/Safari */}
                <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            </div>
        </div>
    );
};

export default Courses;