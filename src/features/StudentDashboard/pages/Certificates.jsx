import React, { useState } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import { Search, MoreHorizontal, Bell, Globe } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const Certificates = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Metric Data
    const metrics = [
        { label: "Total Courses Completed", value: "8", sub: "Courses", change: "+12%", desc: "All courses you have successfully finished." },
        { label: "Certificates Available", value: "5", sub: "Certificates", change: "+2%", desc: "Certificates ready for you to download and share." },
        { label: "Courses In Progress", value: "3", sub: "Courses In Progress", change: "+10%", desc: "Courses you are currently enrolled in but not yet completed." },
        { label: "Locked Certificates", value: "2", sub: "Locked Certificates", change: "", desc: "Certificates that will unlock upon 100% completion of their course." }
    ];

    // Mock Certificates Data
    const allCertificates = [
        { id: 1, course: "Dora Quran Course (Only in Ramzan)", title: "Introduction", startDate: "05-Feb-2025", endDate: "05-May-2025", progress: 88, status: "Completed" },
        { id: 2, course: "Stress Management Course", title: "Conclusion", startDate: "05-Feb-2025", endDate: "05-May-2025", progress: 90, status: "Completed" },
        { id: 3, course: "Akhrat kay Dalail aur Ahwal e Akhrat Course", title: "Introduction", startDate: "05-Feb-2025", endDate: "05-May-2025", progress: 44, status: "Active" },
        { id: 4, course: "Stress Management Course", title: "Summary", startDate: "05-Feb-2025", endDate: "05-May-2025", progress: 65, status: "Active" },
        { id: 5, course: "Seerat un Nabi Course", title: "Chapter 1", startDate: "01-Jan-2025", endDate: "01-Apr-2025", progress: 100, status: "Completed" },
        { id: 6, course: "Tajweed Course", title: "Basics", startDate: "10-Feb-2025", endDate: "10-May-2025", progress: 20, status: "Active" },
        { id: 7, course: "Fiqh Basics", title: "Salah", startDate: "15-Feb-2025", endDate: "15-May-2025", progress: 10, status: "Active" },
    ];

    const totalPages = Math.ceil(allCertificates.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = allCertificates.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Simplified logic for brevity
            pages.push(1, 2, 3, '...', totalPages);
        }
        return pages;
    };


    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
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

                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className="py-4 pr-2 flex flex-col gap-6">

                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {metrics.map((metric, index) => (
                                    <div key={index} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                                        <div>
                                            <h3 className="text-gray-900 font-semibold mb-2">{metric.label}</h3>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                                                <span className="text-xs font-medium text-gray-500">{metric.sub}</span>
                                                {metric.change && (
                                                    <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                        {metric.change}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-[11px] leading-tight">{metric.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Certificates Table Section */}
                            <div className="bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm">
                                <div className="flex flex-col justify-between mb-6 gap-4">
                                    <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Certificates List</h2>
                                            <p className="text-gray-500 text-sm">Manage your Certificates</p>
                                        </div>

                                        <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            <div className="relative w-full md:w-[300px]">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Search certificate by Course name"
                                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <GradiantButton className={"py-2 px-4 rounded"}>
                                                <Search className="h-4 w-4" />
                                                Search
                                            </GradiantButton>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <div className="min-w-[900px]">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 pb-4 mb-4 text-sm font-semibold text-gray-900 text-center">
                                            <div className="col-span-3 text-left pl-4">Courses</div>
                                            <div className="col-span-2">Title</div>
                                            <div className="col-span-2">Start & End Date</div>
                                            <div className="col-span-2">Progress</div>
                                            <div className="col-span-2">Status</div>
                                            <div className="col-span-1">Action</div>
                                        </div>

                                        {/* Table Rows */}
                                        <div className="flex flex-col gap-2">
                                            {currentData.map((item) => (
                                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center py-4 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                                    <div className="col-span-3 text-left pl-4 font-medium text-gray-800">{item.course}</div>
                                                    <div className="col-span-2 text-center">{item.title}</div>
                                                    <div className="col-span-2 text-center flex flex-col text-xs text-gray-500">
                                                        <span>{item.startDate}</span>
                                                        <span>{item.endDate}</span>
                                                    </div>
                                                    <div className="col-span-2 text-center font-medium">{item.progress}%</div>
                                                    <div className="col-span-2 text-center">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.status === 'Completed' ? 'text-blue-500' : 'text-[#00C896]'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-1 flex justify-center cursor-pointer text-gray-400 hover:text-gray-600">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Pagination */}
                                <PaginationContent className="w-full h-10 mt-6 flex items-center justify-end">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            className={`cursor-pointer ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                                        />
                                    </PaginationItem>
                                    {getPageNumbers().map((page, index) => (
                                        <PaginationItem key={index}>
                                            {page === '...' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => handlePageChange(page)}
                                                    isActive={page === currentPage}
                                                    className={`cursor-pointer ${page === currentPage ? "bg-gradient-to-r from-[#A892FF] to-[#6C5DDC] text-white hover:bg-[#6C5DDC] hover:text-white" : ""}`}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            className={`cursor-pointer ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </div>

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

export default Certificates;