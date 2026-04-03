import React, { useState } from 'react';
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

const ModeratorReportsPage = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchType, setSearchType] = useState('NAME');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Session Activity Data (Line Chart)
    const sessionData = [
        { day: 'Mon', value: -15 },
        { day: 'Tue', value: -10 },
        { day: 'Wed', value: -5 },
        { day: 'Thu', value: -3 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 5 },
    ];

    const moderators = [
        { id: 1, name: 'Zain', email: 'zain@gmail.com', phone: '0322 123456', batches: ['S-24', 'W-24'], progress: '40%', lastLogin: '05-Feb-2025', status: 'In-active' },
        { id: 2, name: 'Majid', email: 'majid@gmail.com', phone: '0322 123456', batches: ['S-24', 'W-24'], progress: '90%', lastLogin: '14-Sep-2025', status: 'Active' },
        { id: 3, name: 'Usama', email: 'usama@gmail.com', phone: '0300 123222', batches: ['S-24', 'W-24'], progress: '40%', lastLogin: '01-Sep-2025', status: 'In-active' },
        { id: 4, name: 'Majid', email: 'majid@gmail.com', phone: '0322 123456', batches: ['S-24', 'W-24'], progress: '90%', lastLogin: '14-Sep-2025', status: 'Active' },
        { id: 5, name: 'Noman', email: 'majid@gmail.com', phone: '0322 123456', batches: ['S-24', 'W-24'], progress: '70%', lastLogin: '19-Sep-2025', status: 'Active' },
        { id: 6, name: 'Noman', email: 'majid@gmail.com', phone: '0322 123456', batches: ['S-24', 'W-24'], progress: '70%', lastLogin: '19-Sep-2025', status: 'Active' },
    ];

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />

                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative min-h-0'>

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

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10 min-h-0">
                        <div className="py-4 pr-2">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-[24px] font-bold text-gray-900 mb-1">Moderators Reports</h2>
                                <p className="text-gray-500 text-[16px]">Manage All Your Moderators Reports</p>
                            </div>

                            {/* Top Filters */}
                            <div className="flex flex-wrap items-end justify-between xl:justify-start gap-4 mb-6 relative w-full">

                                {/* Desktop Inline Filters (Hidden on Mobile/Tablet) */}
                                <div className="hidden xl:flex flex-wrap gap-4 items-end flex-1 w-full">
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">STATUS</span>
                                        <select className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                                            <option>Active Students</option>
                                            <option>Inactive Students</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">FROM</span>
                                        <div className="relative w-full">
                                            <input type="date" className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" defaultValue="2024-04-12" />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">TO</span>
                                        <div className="relative w-full">
                                            <input type="date" className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" defaultValue="2024-04-20" />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Shared Search & Clear Buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    <GradiantButton className="h-[42px] px-6 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                        <Search className="w-4 h-4" />
                                        Search
                                    </GradiantButton>
                                    <button className="h-[42px] px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
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
                                                <span className="text-xs font-bold text-gray-400 uppercase">STATUS</span>
                                                <select className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                                                    <option>Active Students</option>
                                                    <option>Inactive Students</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">FROM</span>
                                                <div className="relative">
                                                    <input type="date" className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" defaultValue="2024-04-12" />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">TO</span>
                                                <div className="relative">
                                                    <input type="date" className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" defaultValue="2024-04-20" />
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
                                            value="47"
                                            trendValue="2.7%"
                                            trendLabel="Improvement From last Week"
                                            className="w-full h-[140px]"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <OverviewCard
                                            className="w-full max-w-full shadow-sm"
                                            statsOverride={{
                                                col1: { value: "82%", label: "Success Rate", color: "#22C55E" },
                                                col2: { value: "12", label: "In-progress", color: "#3758EE" },
                                                col3: { value: "Active", label: "Status", color: "#A855F7" },
                                            }}
                                        />
                                    </div>
                                </div>
                                <PerformanceCard
                                    className="shadow-sm w-full xl:w-[40%] 2xl:w-[35%] min-w-0"
                                    name="Overall Performance"
                                    percentageOverride={82}
                                    trendOverride={5.2}
                                />
                            </div>

                            {/* Charts Row 2 */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 w-full">
                                {/* Session Activity Chart */}
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

                                {/* Moderator Performance Chart */}
                                <HoursSpentCard name="Moderator Performance" />
                            </div>

                            {/* Moderators List Table */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Moderators List</h3>
                                </div>

                                {/* Filter Bar */}
                                <div className="flex flex-col xl:flex-row xl:items-end gap-4 mb-8">
                                    {/* Advanced Search */}
                                    <div className='flex-1 flex gap-2 flex-col min-w-0'>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">ADVANCED SEARCH</p>
                                        <div className={`flex flex-col sm:flex-row relative bg-gray-50 border rounded transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 border-gray-200`}>
                                            <div className="relative flex-1 w-full sm:w-auto min-w-0">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    placeholder={`Search by ${searchType.toLowerCase()}`}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center p-2 sm:p-1 gap-2 border-t sm:border-t-0 border-gray-200 justify-center">
                                                <button
                                                    onClick={() => setSearchType('PHONE')}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-all duration-200 ${searchType === 'PHONE' ? 'bg-[#A78BFA] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => setSearchType('NAME')}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-all duration-200 ${searchType === 'NAME' ? 'bg-[#A78BFA] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* From */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase">From</span>
                                        <input type="date" className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none" defaultValue="2024-04-12" />
                                    </div>

                                    {/* To */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase">To</span>
                                        <input type="date" className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none" defaultValue="2024-04-20" />
                                    </div>

                                    {/* Status */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                                        <select className="pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none appearance-none cursor-pointer">
                                            <option>Select</option>
                                            <option>Active</option>
                                            <option>Inactive</option>
                                        </select>
                                    </div>

                                    {/* Clear Filter */}
                                    <button className="flex items-center justify-center gap-2 px-4 h-10 shrink-0 bg-gray-200 text-gray-500 font-bold text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap">
                                        <BiFilterAlt className="w-4 h-4" />
                                        Clear Filter
                                    </button>
                                </div>

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
                                                            {moderator.batches.map((batch, idx) => (
                                                                <span key={idx} className="text-[12px] text-blue-500 underline cursor-pointer hover:text-blue-700">
                                                                    {batch}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="text-[14px] font-medium text-gray-700">{moderator.progress}</span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="text-[14px] font-medium text-gray-700">{moderator.lastLogin}</span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className={`text-[13px] px-2 py-1 rounded-full ${moderator.status === 'Active'
                                                            ? 'text-[#00C896]'
                                                            : 'text-red-500'
                                                            }`}>
                                                            {moderator.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <GradiantButton
                                                            className="text-[12px] px-4 py-2 rounded shadow-none font-medium bg-[#6366F1]"
                                                            onClick={() => navigate(`/moderator-details/${moderator.id}`)}
                                                        >
                                                            View Profile
                                                        </GradiantButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex flex-wrap justify-between min-[600px]:justify-end items-center gap-2 mt-8">
                                    <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">1</button>
                                        <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#6366F1] rounded-lg shadow-sm">2</button>
                                        <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">3</button>
                                        <span className="text-gray-400">...</span>
                                    </div>
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
            </div >
        </div >
    );
};

export default ModeratorReportsPage;
