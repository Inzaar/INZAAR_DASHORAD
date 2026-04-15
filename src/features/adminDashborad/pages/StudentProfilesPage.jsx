import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import StatsCard from '../components/StatsCard';
import { Search, Plus, ChevronDown, MoreVertical, X } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { getStudentProfiles } from '@/api/user';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/Pagination";

const StudentProfilesPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('NAME'); // 'NAME' or 'PHONE'
    const [students, setStudents] = useState([]);
    const [statsData, setStatsData] = useState({
        totalRegistered: 0,
        active: 0,
        inactive: 0,
        pending: 0
    });

    // Pagination & Loading
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchStudentsData = async () => {
        try {
            setIsLoading(true);
            const res = await getStudentProfiles(currentPage, 10, searchText, statusFilter, fromDate, toDate, searchType);
            if (res?.data) {
                setStudents(res.data.students || []);
                setTotalPages(res.data.totalPages || 1);
                setStatsData(res.data.stats || {
                    totalRegistered: 0,
                    active: 0,
                    inactive: 0,
                    pending: 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch students data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsData();
    }, [currentPage, statusFilter, fromDate, toDate]);

    const handleSearchClick = () => {
        setCurrentPage(1);
        fetchStudentsData();
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleSearchChange = (val) => {
        if (searchType === 'PHONE') {
            const numericValue = val.replace(/[^0-9+]/g, '');
            setSearchText(numericValue);
        } else {
            setSearchText(val);
        }
    };

    const activeCount = students.filter(s => s.status === 'Active').length;
    const inactiveCount = students.filter(s => s.status === 'Inactive').length;
    const pendingCount = students.filter(s => s.status === 'Pending').length;

    const stats = [
        { title: "Total Registered Students", value: (statsData?.totalRegistered || 0).toString(), trend: "+ 2.4%", trendDirection: "up", trendText: "vs last month", type: "" },
        { title: "Active Students", value: (statsData?.active || 0).toString(), trend: "+ 2.4%", trendDirection: "up", trendText: "vs last month", type: "Active" },
        { title: "Inactive Students", value: (statsData?.inactive || 0).toString(), trend: "- 2.4%", trendDirection: "down", trendText: "vs last month", type: "In-active" },
        { title: "Pending Students", value: (statsData?.pending || 0).toString(), trend: "+ 1.2%", trendDirection: "up", trendText: "vs last month", isGray: true, type: "Pending" },
    ];

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4">
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

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-4 pr-2">
                            {/* Header */}
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-[24px] font-bold text-gray-900 mb-1">Students</h2>
                                    <p className="text-gray-500 text-[16px]">Manage All Your Students</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat, index) => (
                                    <StatsCard
                                        key={index}
                                        {...stat}
                                        trendColor={stat.trendDirection === 'down' ? 'text-red-500' : 'text-green-500'}
                                        iconColor={stat.trendDirection === 'down' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
                                        onClick={() => {
                                            setStatusFilter(stat.type);
                                            setCurrentPage(1);
                                        }}
                                        className={statusFilter === stat.type ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                                    />
                                ))}
                            </div>

                            {/* Main Content Card */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                                <div className="mb-6 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Students List</h3>
                                    <button
                                        onClick={fetchStudentsData}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? "animate-spin" : ""}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                                        Refresh
                                    </button>
                                </div>

                                {/* Filters - Desktop */}
                                <div className="hidden xl:flex flex-row gap-4 mb-8">
                                    <div className='flex-1 flex gap-2 flex-col'>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">ADVANCED SEARCH</p>
                                        <div className="flex relative bg-gray-50 border border-gray-200 rounded transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder={`Search by ${searchType.toLowerCase()}`}
                                                className="w-full pl-10 pr-32 py-2.5 bg-transparent text-sm focus:outline-none"
                                                value={searchText}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                onKeyDown={handleSearchKeyDown}
                                            />
                                            <div className="flex items-center p-1 gap-2 border-l border-gray-200 ml-2">
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'PHONE') {
                                                            setSearchType('PHONE');
                                                            setSearchText('');
                                                        } else if (searchText.trim()) {
                                                            handleSearchClick();
                                                        }
                                                    }}
                                                    className={`px-4 py-2.5 text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${searchType === 'PHONE' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-md' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'NAME') {
                                                            setSearchType('NAME');
                                                            setSearchText('');
                                                        } else if (searchText.trim()) {
                                                            handleSearchClick();
                                                        }
                                                    }}
                                                    className={`px-4 py-2.5 text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${searchType === 'NAME' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-md' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">From</span>
                                        <input
                                            type="date"
                                            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">To</span>
                                        <input
                                            type="date"
                                            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                                        <div className="relative">
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="Active">Active</option>
                                                <option value="In-active">Inactive</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSearchText("");
                                            setStatusFilter("");
                                            setFromDate("");
                                            setToDate("");
                                            setCurrentPage(1);
                                        }}
                                        className="flex items-center gap-2 px-4 h-10 self-end bg-gray-200 text-gray-500 font-bold text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap"
                                    >
                                        <BiFilterAlt className="w-4 h-4" />
                                        Clear
                                    </button>
                                </div>

                                {/* Filters - Responsive (Mobile Only) */}
                                <div className="flex xl:hidden flex-col gap-6 mb-8 relative">
                                    <div className='flex flex-col gap-4'>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">ADVANCED SEARCH</p>
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => {
                                                    setSearchText("");
                                                    setStatusFilter("");
                                                    setFromDate("");
                                                    setToDate("");
                                                    setCurrentPage(1);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                                            >
                                                <BiFilterAlt className="w-4 h-4" />
                                                Clear Filter
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                                    className={`w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 transition-all ${isFilterOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400'}`}
                                                >
                                                    {isFilterOpen ? <X size={20} /> : <MoreVertical size={20} />}
                                                </button>

                                                {isFilterOpen && (
                                                    <div className="absolute right-0 top-full mt-3 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-5 z-[50]">
                                                        <div className="space-y-5">
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                                                                <div className="relative">
                                                                    <select
                                                                        value={statusFilter}
                                                                        onChange={(e) => setStatusFilter(e.target.value)}
                                                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer font-medium"
                                                                    >
                                                                        <option value="">All Statuses</option>
                                                                        <option value="Active">Active</option>
                                                                        <option value="In-active">Inactive</option>
                                                                        <option value="Pending">Pending</option>
                                                                    </select>
                                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">From</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none font-medium"
                                                                    value={fromDate}
                                                                    onChange={(e) => setFromDate(e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">To</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none font-medium"
                                                                    value={toDate}
                                                                    onChange={(e) => setToDate(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Search Segment UI as per request */}
                                    <div className='flex flex-col gap-3'>
                                        <div className="flex flex-col bg-white border border-[#4E60FF] rounded-xl transition-all duration-200 shadow-sm overflow-hidden">
                                            <div className="flex items-center px-4 py-3 border-b border-gray-100">
                                                <Search className="text-gray-400 w-5 h-5 mr-3" />
                                                <input
                                                    type="text"
                                                    placeholder={`Search by ${searchType.toLowerCase()}`}
                                                    className="w-full bg-transparent text-[15px] font-medium text-gray-700 focus:outline-none placeholder:text-gray-300"
                                                    value={searchText}
                                                    onChange={(e) => handleSearchChange(e.target.value)}
                                                    onKeyDown={handleSearchKeyDown}
                                                />
                                            </div>
                                            <div className="flex items-center p-2 gap-2 bg-[#F8FAFF]">
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'PHONE') {
                                                            setSearchType('PHONE');
                                                            setSearchText('');
                                                        } else if (searchText.trim()) {
                                                            handleSearchClick();
                                                        }
                                                    }}
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${searchType === 'PHONE' ? 'bg-[#4E60FF] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'NAME') {
                                                            setSearchType('NAME');
                                                            setSearchText('');
                                                        } else if (searchText.trim()) {
                                                            handleSearchClick();
                                                        }
                                                    }}
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${searchType === 'NAME' ? 'bg-[#6366F1] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Students Table */}
                                <div className="overflow-x-auto relative min-h-[400px]">
                                    {isLoading && (
                                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 border-4 border-[#3758EE] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm font-medium text-gray-600">Loading...</span>
                                            </div>
                                        </div>
                                    )}
                                    <table className="w-full min-w-[1000px]">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left font-bold text-[13px] text-gray-800 pb-4 pl-4 uppercase">Student</th>
                                                <th className="text-left font-bold text-[13px] text-gray-800 pb-4 uppercase">Contact Info</th>
                                                <th className="text-center font-bold text-[13px] text-gray-800 pb-4 uppercase">Enrollments</th>
                                                <th className="text-center font-bold text-[13px] text-gray-800 pb-4 uppercase">Avg. Progress</th>
                                                <th className="text-center font-bold text-[13px] text-gray-800 pb-4 uppercase">Last Active</th>
                                                <th className="text-center font-bold text-[13px] text-gray-800 pb-4 uppercase">Status</th>
                                                <th className="text-center font-bold text-[13px] text-gray-800 pb-4 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {students.length === 0 ? (
                                                !isLoading && (
                                                    <tr>
                                                        <td colSpan="7" className="py-20 text-center">
                                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                                <Search size={48} className="opacity-20" />
                                                                <p className="font-medium text-[16px]">No students found matching your criteria</p>
                                                                <button
                                                                    onClick={() => { setSearchText(""); setStatusFilter(""); fetchStudentsData(); }}
                                                                    className="text-blue-500 text-sm font-bold hover:underline"
                                                                >
                                                                    Clear all filters
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            ) : (
                                                students.map((student) => (
                                                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                                                        <td className="py-5 pl-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200 overflow-hidden shadow-sm">
                                                                    {student.profileImageUrl ? (
                                                                        <img src={student.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        (student.name || "S").charAt(0).toUpperCase()
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{student.name}</span>
                                                                    <span className="text-[11px] text-gray-400 font-medium">ID: {student.id.toString().slice(-6).toUpperCase()}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-5">
                                                            <div className="flex flex-col gap-[2px]">
                                                                <div className="flex items-center gap-1.5">
                                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                                    <span className="text-[13px] font-medium text-gray-700">{student.email}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                                    <span className="text-[13px] text-gray-500">{student.phone}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 text-center">
                                                            <div className="flex flex-col gap-1 items-center">
                                                                {!student.enrollments || student.enrollments.length === 0 ? (
                                                                    <span className="text-gray-400 text-[11px] font-bold">Not Enrolled</span>
                                                                ) : (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-[14px] text-blue-600 font-[900] hover:underline cursor-pointer decoration-2 underline-offset-2">
                                                                            {student.enrollments.length} {student.enrollments.length === 1 ? 'Course' : 'Courses'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-5 text-center">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className="text-[14px] font-bold text-gray-800">{student.progress || '0%'}</span>
                                                                <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${parseInt(student.progress) > 80 ? 'bg-green-500' :
                                                                                parseInt(student.progress) > 40 ? 'bg-blue-500' : 'bg-orange-400'
                                                                            }`}
                                                                        style={{ width: student.progress || '0%' }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 text-center">
                                                            <span className="text-[13px] font-medium text-gray-700 whitespace-nowrap">{student.lastLogin}</span>
                                                        </td>
                                                        <td className="py-5 text-center">
                                                            <span className={`
                                                                text-[12px] font-[900] uppercase tracking-widest transition-all duration-300
                                                                ${student.status === 'Active' ? 'text-[#10B981]' :
                                                                    student.status === 'Pending' ? 'text-[#F97316]' :
                                                                        'text-[#EF4444]'}
                                                            `}>
                                                                {student.status === 'In-active' ? 'IN-ACTIVE' : student.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="py-5 text-center">
                                                            <button
                                                                onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white text-[12px] font-medium rounded-md hover:opacity-90 transition-all shadow-sm"
                                                            >
                                                                View Profile
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-end items-center mt-12">
                                    <Pagination className="mx-0 w-auto">
                                        <PaginationContent className="gap-2">
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => !isLoading && currentPage > 1 && setCurrentPage(prev => prev - 1)}
                                                    className={`cursor-pointer border-none hover:bg-transparent ${currentPage === 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-900 font-medium'}`}
                                                />
                                            </PaginationItem>

                                            {[...Array(totalPages)].map((_, i) => {
                                                const pageNum = i + 1;
                                                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                                    const isActive = currentPage === pageNum;
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationLink
                                                                onClick={() => !isLoading && setCurrentPage(pageNum)}
                                                                isActive={isActive}
                                                                className={`cursor-pointer w-10 h-10 border-none rounded-lg text-[14px] font-medium transition-all ${isActive ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-md hover:text-white hover:opacity-90' : 'text-gray-900 hover:bg-gray-100'}`}
                                                            >
                                                                {pageNum}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationEllipsis />
                                                        </PaginationItem>
                                                    );
                                                }
                                                return null;
                                            })}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => !isLoading && currentPage < totalPages && setCurrentPage(prev => prev + 1)}
                                                    className={`cursor-pointer border-none hover:bg-transparent ${currentPage === totalPages ? 'text-gray-300 pointer-events-none' : 'text-gray-900 font-medium'}`}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
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

export default StudentProfilesPage;
