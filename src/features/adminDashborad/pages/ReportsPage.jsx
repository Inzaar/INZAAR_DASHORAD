import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, Calendar as CalendarIcon, MoreVertical, X, ChevronDown } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import MetricCard from '@/components/shared/MetricCard';
import OverviewCard from '@/components/shared/OverviewCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import SharedStudentTable from '@/components/shared/SharedStudentTable';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/context/AuthContext';

const ReportsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchType, setSearchType] = useState('NAME');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // API Data State
    const [students, setStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState({ count: 0, trend: '+2.7%' });
    const [overview, setOverview] = useState({ successRate: '0%', inProgress: '0', activeStatus: 'Active' });
    const [performance, setPerformance] = useState({ percentage: 0, trendingUp: 5.2 });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Filter State
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Bottom table filters (separate from top)
    const [tableSearch, setTableSearch] = useState('');
    const [tableSearchType, setTableSearchType] = useState('NAME');
    const [tableFrom, setTableFrom] = useState('');
    const [tableTo, setTableTo] = useState('');
    const [tableStatus, setTableStatus] = useState('');
    const [isTableFilterOpen, setIsTableFilterOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Session Activity Data (Line Chart)
    const [sessionData, setSessionData] = useState([
        { day: 'Mon', value: 0 },
        { day: 'Tue', value: 0 },
        { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 0 },
        { day: 'Sun', value: 0 },
    ]);

    // Fetch report data from API
    const fetchReport = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', 5);

            if (user?.role === 'moderator' && user?.gender) {
                params.append('gender', user.gender);
            }

            // Apply table filters
            if (tableStatus) params.append('status', tableStatus);
            if (tableFrom) params.append('from', tableFrom);
            if (tableTo) params.append('to', tableTo);
            if (tableSearch.trim()) {
                params.append('search', tableSearch.trim());
                params.append('searchType', tableSearchType);
            }

            const res = await axiosInstance.get(`/admin/reports/students?${params.toString()}`);
            const data = res.data.data;

            setStudents(data.studentsList || []);
            setTotalStudents(data.totalStudents || { count: 0, trend: '+2.7%' });
            setOverview(data.overview || { successRate: '0%', inProgress: '0', activeStatus: 'Active' });
            setPerformance(data.overallPerformance || { percentage: 0, trendingUp: 5.2 });
            setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
            if (data.sessionActivity) {
                setSessionData(data.sessionActivity);
            }
        } catch (err) {
            console.error('Failed to fetch students report:', err);
        } finally {
            setLoading(false);
        }
    }, [tableStatus, tableFrom, tableTo, tableSearch, tableSearchType]);

    // Real-time search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReport(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [tableSearch, tableSearchType, tableStatus, tableFrom, tableTo, fetchReport]);

    // Handle top filter search
    const handleTopSearch = () => {
        // Sync top filters to table filters
        setTableStatus(filterStatus);
        setTableFrom(filterFrom);
        setTableTo(filterTo);
        setTableSearch(searchQuery);
        setTableSearchType(searchType);
        setIsFilterDropdownOpen(false);
        // Fetch will be triggered by fetchReport call below
        setTimeout(() => fetchReport(1), 0);
    };

    // Handle top clear filter
    const handleTopClear = () => {
        setFilterStatus('');
        setFilterFrom('');
        setFilterTo('');
        setSearchQuery('');
        setTableStatus('');
        setTableFrom('');
        setTableTo('');
        setTableSearch('');
        setTimeout(() => fetchReport(1), 0);
    };

    // Handle table filter search
    const handleTableSearch = () => {
        fetchReport(1);
    };

    // Handle table clear filter
    const handleTableClear = () => {
        setTableStatus('');
        setTableFrom('');
        setTableTo('');
        setTableSearch('');
        setTimeout(() => {
            fetchReport(1);
        }, 0);
    };

    // Handle table clear (uses the ref-less approach)  
    useEffect(() => {
        // This runs when table filters change via clear
    }, [tableStatus, tableFrom, tableTo, tableSearch]);

    // Pagination handler
    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchReport(page);
        }
    };

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const total = pagination.totalPages;
        const current = pagination.page;
        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                pages.push(i);
            }
            if (current < total - 2) pages.push('...');
            pages.push(total);
        }
        return pages;
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />

                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative min-h-0 pb-4'>

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

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10 min-h-0">
                        <div className="py-4 pr-2">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-[24px] font-bold text-gray-900 mb-1">{t("students_reports", "Students Reports")}</h2>
                                <p className="text-gray-500 text-[16px]">{t("manage_students_reports", "Manage All Your Students Reports")}</p>
                            </div>

                            {/* Top Filters */}
                            <div className="flex flex-wrap items-end justify-between xl:justify-start gap-4 mb-6 relative w-full">

                                {/* Desktop Inline Filters (Hidden on Mobile/Tablet) */}
                                <div className="hidden xl:flex flex-wrap gap-4 items-end flex-1 w-full">
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">{t("all_students_filter", "All Students")}</option>
                                            <option value="active">{t("active_students", "Active Students")}</option>
                                            <option value="inactive">{t("inactive_students", "Inactive Students")}</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                        <div className="relative w-full">
                                            <input
                                                type="date"
                                                value={filterFrom}
                                                onChange={(e) => setFilterFrom(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                        <div className="relative w-full">
                                            <input
                                                type="date"
                                                value={filterTo}
                                                onChange={(e) => setFilterTo(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Shared Search & Clear Buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    <GradiantButton
                                        className="h-[42px] px-6 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                                        onClick={handleTopSearch}
                                    >
                                        <Search className="w-4 h-4" />
                                        Search
                                    </GradiantButton>
                                    <button
                                        className="h-[42px] px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                                        onClick={handleTopClear}
                                    >
                                        <BiFilterAlt className="w-4 h-4" />
                                        Clear Filter
                                    </button>
                                </div>

                                {/* Mobile 3-Dots Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                    className="xl:hidden p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>

                                {/* Mobile Dropdown Popup */}
                                {isFilterDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsFilterDropdownOpen(false)}
                                        />
                                        <div className="xl:hidden absolute top-full right-0 mt-2 w-[260px] p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col gap-4">
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                                <select
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">{t("all_students_filter", "All Students")}</option>
                                                    <option value="active">{t("active_students", "Active Students")}</option>
                                                    <option value="inactive">{t("inactive_students", "Inactive Students")}</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={filterFrom}
                                                        onChange={(e) => setFilterFrom(e.target.value)}
                                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={filterTo}
                                                        onChange={(e) => setFilterTo(e.target.value)}
                                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>


                            {/* Stats & Charts Row 1 */}
                            <div className="flex flex-col xl:flex-row gap-6 w-full pb-4">
                                <div className="w-full flex flex-col gap-6 justify-between flex-1 min-w-0">
                                    <div className="w-full">
                                        <MetricCard
                                            title={t("total_students", "Total Students")}
                                            value={String(totalStudents.count)}
                                            trendValue={totalStudents.trend?.replace('+', '') || "2.7%"}
                                            trendLabel={t("improvement_from_last_week", "Improvement From last Week")}
                                            className="w-full h-[140px]"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <OverviewCard
                                            className="w-full max-w-full shadow-sm"
                                            statsOverride={{
                                                col1: { value: overview.successRate, label: t("success_rate", "Success Rate"), color: "#22C55E" },
                                                col2: { value: overview.inProgress, label: t("in_progress", "In-progress"), color: "#3758EE" },
                                                col3: { value: overview.activeStatus, label: t("status", "Status"), color: "#A855F7" },
                                            }}
                                        />
                                    </div>
                                </div>
                                <PerformanceCard
                                    className="shadow-sm w-full xl:w-[40%] 2xl:w-[35%] min-w-0"
                                    name={t("overall_performance", "Overall Performance")}
                                    percentageOverride={performance.percentage}
                                    trendOverride={performance.trendingUp}
                                />
                            </div>

                            {/* Charts Row 2 */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 w-full">
                                {/* Session Activity Chart */}
                                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[350px] min-w-0">
                                    <h3 className="text-gray-900 font-medium mb-6">{t("session_activity", "Session Activity")}</h3>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={sessionData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#E5E7EB" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Moderator Performance Chart */}
                                <HoursSpentCard name={t("moderator_performance", "Moderator Performance")} />
                            </div>

                            {/* Students List Table */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col flex-1 min-h-[600px]">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t("students_list", "Students List")}</h3>
                                </div>

                                {/* Filters - Desktop */}
                                <div className="hidden xl:flex flex-row gap-4 mb-8">
                                    <div className='flex-1 flex gap-2 flex-col'>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">{t("advanced_search", "ADVANCED SEARCH")}</p>
                                        <div className="flex relative bg-gray-50 border border-gray-200 rounded transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder={tableSearchType === "NAME" ? t("search_by_name", "Search by name") : t("search_by_phone", "Search by phone")}
                                                className="w-full pl-10 pr-32 py-2.5 bg-transparent text-sm focus:outline-none"
                                                value={tableSearch}
                                                onChange={(e) => setTableSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleTableSearch()}
                                            />
                                            <div className="flex items-center p-1 gap-2 border-l border-gray-200 ml-2">
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'PHONE') {
                                                            setTableSearchType('PHONE');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`px-4 py-2.5 text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${tableSearchType === 'PHONE' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-md' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'NAME') {
                                                            setTableSearchType('NAME');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`px-4 py-2.5 text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${tableSearchType === 'NAME' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-md' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("from", "From")}</span>
                                        <input
                                            type="date"
                                            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none"
                                            value={tableFrom}
                                            onChange={(e) => setTableFrom(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("to", "To")}</span>
                                        <input
                                            type="date"
                                            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none"
                                            value={tableTo}
                                            onChange={(e) => setTableTo(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("status", "Status")}</span>
                                        <div className="relative">
                                            <select
                                                value={tableStatus}
                                                onChange={(e) => setTableStatus(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">{t("select", "Select")}</option>
                                                <option value="active">{t("active", "Active")}</option>
                                                <option value="inactive">{t("inactive", "Inactive")}</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleTableClear}
                                        className="flex items-center gap-2 px-4 h-10 self-end bg-gray-200 text-gray-500 font-bold text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap"
                                    >
                                        <BiFilterAlt className="w-4 h-4" />
                                        Clear
                                    </button>
                                </div>

                                {/* Filters - Responsive (Mobile Only) */}
                                <div className="flex xl:hidden flex-col gap-6 mb-8 relative">
                                    <div className='flex flex-col gap-4'>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("advanced_search", "ADVANCED SEARCH")}</p>
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={handleTableClear}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                                            >
                                                <BiFilterAlt className="w-4 h-4" />
                                                Clear Filter
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsTableFilterOpen(!isTableFilterOpen)}
                                                    className={`w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 transition-all ${isTableFilterOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400'}`}
                                                >
                                                    {isTableFilterOpen ? <X size={20} /> : <MoreVertical size={20} />}
                                                </button>

                                                {isTableFilterOpen && (
                                                    <div className="absolute right-0 top-full mt-3 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-5 z-[50]">
                                                        <div className="space-y-5">
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("status", "Status")}</label>
                                                                <div className="relative">
                                                                    <select
                                                                        value={tableStatus}
                                                                        onChange={(e) => setTableStatus(e.target.value)}
                                                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer font-medium"
                                                                    >
                                                                        <option value="">{t("select", "Select")}</option>
                                                                        <option value="active">{t("active", "Active")}</option>
                                                                        <option value="inactive">{t("inactive", "Inactive")}</option>
                                                                    </select>
                                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("from", "From")}</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none font-medium"
                                                                    value={tableFrom}
                                                                    onChange={(e) => setTableFrom(e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("to", "To")}</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none font-medium"
                                                                    value={tableTo}
                                                                    onChange={(e) => setTableTo(e.target.value)}
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
                                                    placeholder={tableSearchType === "NAME" ? t("search_by_name", "Search by name") : t("search_by_phone", "Search by phone")}
                                                    className="w-full bg-transparent text-[15px] font-medium text-gray-700 focus:outline-none placeholder:text-gray-300"
                                                    value={tableSearch}
                                                    onChange={(e) => setTableSearch(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleTableSearch()}
                                                />
                                            </div>
                                            <div className="flex items-center p-2 gap-2 bg-[#F8FAFF]">
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'PHONE') {
                                                            setTableSearchType('PHONE');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${tableSearchType === 'PHONE' ? 'bg-[#4E60FF] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'NAME') {
                                                            setTableSearchType('NAME');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${tableSearchType === 'NAME' ? 'bg-[#6366F1] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <SharedStudentTable
                                    students={students}
                                    loading={loading}
                                    pagination={pagination}
                                    onPageChange={goToPage}
                                    title={t("students_list", "Students List")}
                                    showDropdown={false}
                                    hasContainer={false}
                                    showTitle={false}
                                />
                            </div>
                        </div>
                    </main>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}} />
                </div>
            </div >
        </div >
    );
};

export default ReportsPage;
