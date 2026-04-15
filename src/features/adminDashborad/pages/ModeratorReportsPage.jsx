import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, Calendar as CalendarIcon, MoreVertical } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import MetricCard from '@/components/shared/MetricCard';
import OverviewCard from '@/components/shared/OverviewCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import axiosInstance from '@/api/axiosInstance';

const ModeratorReportsPage = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // API Data State
    const [moderators, setModerators] = useState([]);
    const [totalModerators, setTotalModerators] = useState({ count: 0, trend: '+2.7%' });
    const [overview, setOverview] = useState({ successRate: '0%', inProgress: '0', activeStatus: 'Active' });
    const [performance, setPerformance] = useState({ percentage: 0, trendingUp: 5.2 });
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 });

    // Top Filter State
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');

    // Table Filter State
    const [tableSearch, setTableSearch] = useState('');
    const [tableSearchType, setTableSearchType] = useState('NAME');
    const [tableFrom, setTableFrom] = useState('');
    const [tableTo, setTableTo] = useState('');
    const [tableStatus, setTableStatus] = useState('');

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
            if (tableStatus) params.append('status', tableStatus);
            if (tableFrom) params.append('from', tableFrom);
            if (tableTo) params.append('to', tableTo);
            if (tableSearch.trim()) {
                params.append('search', tableSearch.trim());
                params.append('searchType', tableSearchType);
            }

            const res = await axiosInstance.get(`/admin/reports/moderators?${params.toString()}`);
            const data = res.data.data;

            setModerators(data.moderatorsList || []);
            setTotalModerators(data.totalModerators || { count: 0, trend: '+2.7%' });
            setOverview(data.overview || { successRate: '0%', inProgress: '0', activeStatus: 'Active' });
            setPerformance(data.overallPerformance || { percentage: 0, trendingUp: 5.2 });
            setPagination(data.pagination || { page: 1, limit: 5, total: 0, totalPages: 0 });
            if (data.sessionActivity) {
                setSessionData(data.sessionActivity);
            }
        } catch (err) {
            console.error('Failed to fetch moderators report:', err);
        } finally {
            setLoading(false);
        }
    }, [tableStatus, tableFrom, tableTo, tableSearch, tableSearchType]);

    // Initial load
    useEffect(() => { fetchReport(1); }, []);

    // Top filter handlers
    const handleTopSearch = () => {
        setTableStatus(filterStatus);
        setTableFrom(filterFrom);
        setTableTo(filterTo);
        setIsFilterDropdownOpen(false);
        setTimeout(() => fetchReport(1), 0);
    };
    const handleTopClear = () => {
        setFilterStatus(''); setFilterFrom(''); setFilterTo('');
        setTableStatus(''); setTableFrom(''); setTableTo(''); setTableSearch('');
        setTimeout(() => fetchReport(1), 0);
    };

    // Table filter handlers
    const handleTableSearch = () => fetchReport(1);
    const handleTableClear = () => {
        setTableStatus(''); setTableFrom(''); setTableTo(''); setTableSearch('');
        setTimeout(() => fetchReport(1), 0);
    };

    // Pagination
    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.totalPages) fetchReport(page);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    const getPageNumbers = () => {
        const pages = [];
        const total = pagination.totalPages;
        const current = pagination.page;
        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
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
                                <h2 className="text-[24px] font-bold text-gray-900 mb-1">Moderators Reports</h2>
                                <p className="text-gray-500 text-[16px]">Manage All Your Moderators Reports</p>
                            </div>

                            {/* Top Filters */}
                            <div className="flex flex-wrap items-end justify-between xl:justify-start gap-4 mb-6 relative w-full">
                                <div className="hidden xl:flex flex-wrap gap-4 items-end flex-1 w-full">
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">STATUS</span>
                                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                                            <option value="">All Moderators</option>
                                            <option value="active">Active Moderators</option>
                                            <option value="inactive">Inactive Moderators</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">FROM</span>
                                        <div className="relative w-full">
                                            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">TO</span>
                                        <div className="relative w-full">
                                            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <GradiantButton className="h-[42px] px-6 rounded-lg text-sm font-medium flex items-center justify-center gap-2" onClick={handleTopSearch}>
                                        <Search className="w-4 h-4" />
                                        Search
                                    </GradiantButton>
                                    <button className="h-[42px] px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors" onClick={handleTopClear}>
                                        <BiFilterAlt className="w-4 h-4" />
                                        Clear Filter
                                    </button>
                                </div>

                                <button type="button" onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="xl:hidden p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>

                                {isFilterDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsFilterDropdownOpen(false)} />
                                        <div className="xl:hidden absolute top-full right-0 mt-2 w-[260px] p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col gap-4">
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">STATUS</span>
                                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                                                    <option value="">All Moderators</option>
                                                    <option value="active">Active Moderators</option>
                                                    <option value="inactive">Inactive Moderators</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">FROM</span>
                                                <div className="relative">
                                                    <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">TO</span>
                                                <div className="relative">
                                                    <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
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
                                            title="Total Moderator"
                                            value={String(totalModerators.count)}
                                            trendValue={totalModerators.trend?.replace('+', '') || "2.7%"}
                                            trendLabel="Improvement From last Week"
                                            className="w-full h-[140px]"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <OverviewCard
                                            className="w-full max-w-full shadow-sm"
                                            statsOverride={{
                                                col1: { value: overview.successRate, label: "Success Rate", color: "#22C55E" },
                                                col2: { value: overview.inProgress, label: "In-progress", color: "#3758EE" },
                                                col3: { value: overview.activeStatus, label: "Status", color: "#A855F7" },
                                            }}
                                        />
                                    </div>
                                </div>
                                <PerformanceCard
                                    className="shadow-sm w-full xl:w-[40%] 2xl:w-[35%] min-w-0"
                                    name="Overall Performance"
                                    percentageOverride={performance.percentage}
                                    trendOverride={performance.trendingUp}
                                />
                            </div>

                            {/* Charts Row 2 */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 w-full">
                                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 min-h-[350px] min-w-0">
                                    <h3 className="text-gray-900 font-medium mb-6">Session Activity</h3>
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
                                <HoursSpentCard name="Moderator Performance" />
                            </div>

                            {/* Moderators List Table */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Moderators List</h3>
                                </div>

                                {/* Filter Bar */}
                                <div className="flex flex-col xl:flex-row xl:items-end gap-4 mb-8">
                                    <div className='flex-1 flex gap-2 flex-col min-w-0'>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">ADVANCED SEARCH</p>
                                        <div className={`flex flex-col sm:flex-row relative bg-gray-50 border rounded transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 border-gray-200`}>
                                            <div className="relative flex-1 w-full sm:w-auto min-w-0">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    placeholder={`Search by ${tableSearchType.toLowerCase()}`}
                                                    value={tableSearch}
                                                    onChange={(e) => setTableSearch(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleTableSearch()}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center p-2 sm:p-1 gap-2 border-t sm:border-t-0 border-gray-200 justify-center">
                                                <button onClick={() => setTableSearchType('PHONE')} className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-all duration-200 ${tableSearchType === 'PHONE' ? 'bg-[#A78BFA] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                                    PHONE#
                                                </button>
                                                <button onClick={() => setTableSearchType('NAME')} className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-all duration-200 ${tableSearchType === 'NAME' ? 'bg-[#A78BFA] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 shrink-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase">From</span>
                                        <input type="date" value={tableFrom} onChange={(e) => setTableFrom(e.target.value)} className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none" />
                                    </div>

                                    <div className="flex flex-col gap-2 shrink-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase">To</span>
                                        <input type="date" value={tableTo} onChange={(e) => setTableTo(e.target.value)} className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none" />
                                    </div>

                                    <div className="flex flex-col gap-2 shrink-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                                        <select value={tableStatus} onChange={(e) => setTableStatus(e.target.value)} className="pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none appearance-none cursor-pointer">
                                            <option value="">Select</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <button className="flex items-center justify-center gap-2 px-4 h-10 shrink-0 bg-gray-200 text-gray-500 font-bold text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap" onClick={handleTableClear}>
                                        <BiFilterAlt className="w-4 h-4" />
                                        Clear Filter
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
                                        <span className="ml-3 text-gray-500 text-sm">Loading moderators...</span>
                                    </div>
                                ) : moderators.length === 0 ? (
                                    <div className="flex items-center justify-center py-16">
                                        <span className="text-gray-400 text-sm">No moderators found</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[1000px]">
                                                <thead>
                                                    <tr className="border-b border-gray-100">
                                                        <th className="text-left font-bold text-[13px] text-gray-800 pb-4 pl-4 w-[15%]">Name</th>
                                                        <th className="text-left font-bold text-[13px] text-gray-800 pb-4 w-[20%]">Contact</th>
                                                        <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[15%]">Manage Batch's</th>
                                                        <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[10%]">Progress</th>
                                                        <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[12%]">Last Login</th>
                                                        <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[10%]">Status</th>
                                                        <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[13%]">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {moderators.map((moderator) => (
                                                        <tr key={moderator.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-4 pl-4">
                                                                <span className="text-[14px] font-medium text-gray-700">{moderator.name}</span>
                                                            </td>
                                                            <td className="py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[13px] text-gray-600">{moderator.email}</span>
                                                                    <span className="text-[13px] text-gray-500">{moderator.phone}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 text-center">
                                                                <div className="flex flex-col gap-1 items-center">
                                                                    {(moderator.batches || []).slice(0, 3).map((batch, idx) => (
                                                                        <span key={idx} className="text-[12px] text-blue-500 underline cursor-pointer hover:text-blue-700">
                                                                            {batch}
                                                                        </span>
                                                                    ))}
                                                                    {moderator.batches?.length > 3 && (
                                                                        <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                                                                            + {moderator.batches.length - 3} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 text-center">
                                                                <span className="text-[14px] font-medium text-gray-700">{moderator.progress}</span>
                                                            </td>
                                                            <td className="py-4 text-center">
                                                                <span className="text-[14px] font-medium text-gray-700">{formatDate(moderator.lastLogin)}</span>
                                                            </td>
                                                            <td className="py-4 text-center">
                                                                <span className={`text-[13px] px-2 py-1 rounded-full ${moderator.status === 'Active' ? 'text-[#00C896]' : 'text-red-500'}`}>
                                                                    {moderator.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 text-center">
                                                                <GradiantButton className="text-[12px] px-4 py-2 rounded shadow-none font-medium bg-[#6366F1]" onClick={() => navigate(`/moderator-details/${moderator.id}`)}>
                                                                    View Profile
                                                                </GradiantButton>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Pagination */}
                                        <div className="flex flex-wrap justify-between min-[600px]:justify-end items-center gap-2 mt-8">
                                            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40" disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                                                Previous
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {getPageNumbers().map((p, idx) => (
                                                    p === '...' ? (
                                                        <span key={`dot-${idx}`} className="text-gray-400">...</span>
                                                    ) : p === pagination.page ? (
                                                        <GradiantButton
                                                            key={p}
                                                            onClick={() => goToPage(p)}
                                                            className="w-8 h-8 !p-0 flex items-center justify-center text-sm font-bold rounded-lg shadow-sm"
                                                        >
                                                            {p}
                                                        </GradiantButton>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            onClick={() => goToPage(p)}
                                                            className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                ))}
                                            </div>
                                            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40" disabled={pagination.page >= pagination.totalPages} onClick={() => goToPage(pagination.page + 1)}>
                                                Next
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                            </button>
                                        </div>
                                    </>
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
            </div >
        </div >
    );
};

export default ModeratorReportsPage;
