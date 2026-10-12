import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layouts/NavBar';
import Sidebar from '@/components/layouts/SideBar';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import axiosInstance from '@/api/axiosInstance';
import { Loader2 } from 'lucide-react';
import { TfiArrowTopRight } from "react-icons/tfi";

// Cohesive System Palette (matching Navbar, buttons, and theme)
const SYSTEM_PALETTE = [
    '#4E60FF',
    '#8E6BFF',
    '#00C896',
    '#FFB020',
    '#FF6B6B',
    '#38BDF8',
    '#EC4899',
    '#8B9CF1'
];

// Custom Bar Tooltip
const CustomBarTooltip = ({ active, payload, label, unit = '' }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-gray-100 px-3.5 py-2.5 rounded-xl shadow-lg text-xs z-50">
                <div className="font-semibold text-gray-800">{label || payload[0].payload?.name}</div>
                <div className="text-[#4E60FF] font-bold mt-0.5">
                    {payload[0].value?.toLocaleString()} {unit}
                </div>
            </div>
        );
    }
    return null;
};

// Custom Donut Tooltip
const CustomDonutTooltip = ({ active, payload, total }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const pct = total && total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-gray-100 px-3.5 py-2.5 rounded-xl shadow-lg text-xs z-50">
                <div className="font-semibold text-gray-800">{data.name}</div>
                <div className="text-gray-600 mt-0.5">
                    <span className="font-bold text-[#4E60FF]">{data.value?.toLocaleString()}</span> signups ({pct}%)
                </div>
            </div>
        );
    }
    return null;
};

const ManagementDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [genderFilter, setGenderFilter] = useState('Male');
    const [loading, setLoading] = useState(true);
    const [cohortData, setCohortData] = useState({
        totalRegistrations: 0,
        uniqueStudents: 0,
        supporterWillingnessPercent: '0.0',
        willingSupportersCount: 0,
        topEnrolledCourse: 'No Enrolled Courses',
        topCourseStudentsCount: 0,
        courseDemand: [],
        courseMaxX: 4,
        courseTicks: [0, 1, 2, 3, 4],
        qualifications: [],
        qualMaxX: 4,
        qualTicks: [0, 1, 2, 3, 4],
        acquisitionChannels: [],
        ageDistribution: [],
        ageMaxY: 4,
        ageTicks: [0, 1, 2, 3, 4],
    });

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Fetch real analytics from backend
    const fetchRealData = useCallback(async (gender) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/admin/management-cohort-analytics?gender=${gender}`);
            if (res?.data?.data) {
                // Ensure acquisition channels use system palette colors
                const data = res.data.data;
                if (data.acquisitionChannels) {
                    data.acquisitionChannels = data.acquisitionChannels.map((ch, idx) => ({
                        ...ch,
                        color: SYSTEM_PALETTE[idx % SYSTEM_PALETTE.length]
                    }));
                }
                setCohortData(data);
            }
        } catch (err) {
            console.error('Failed to load management cohort analytics:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRealData(genderFilter);
    }, [genderFilter, fetchRealData]);

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#F8F9FA]">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                {/* System Navbar */}
                <Navbar onMenuClick={toggleSidebar} />

                <div className="flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4">
                    {/* Mobile Sidebar Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* System Sidebar */}
                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`
                            transition-transform duration-300 ease-in-out z-40
                            lg:translate-x-0 lg:static lg:block
                            fixed left-0 top-0 shadow-2xl
                            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        `}
                    />

                    {/* Single Page Interactive Management Dashboard */}
                    <main
                        className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide pr-1"
                        style={{
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}
                    >
                        <div className="w-full flex flex-col gap-4 pb-6">
                            {/* 1. System Gradient Header Banner */}
                            <div className="relative overflow-hidden bg-gradient-to-r from-[#8B9CF1] via-[#A39BF0] to-[#B9A0EF] text-white py-4 px-6 shadow-sm text-center">
                                {/* Subtle white lighting overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none" />

                                <h1 className="relative z-10 text-base sm:text-xl md:text-2xl font-bold tracking-wide uppercase text-white drop-shadow-xs">
                                    INZAAR ACADEMY — INTERACTIVE MANAGEMENT DASHBOARD
                                </h1>
                                <p className="relative z-10 text-xs sm:text-sm text-white/90 italic mt-0.5">
                                    Demographic Cohort Analysis, Volunteer Pipeline &amp; Strategic Action Triggers
                                </p>
                            </div>

                            {/* 2. System Filter Bar */}
                            <div className="bg-white border border-gray-100 rounded-[20px] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="border border-[#EAEDF2] bg-[#F8F9FA] rounded-[12px] px-3.5 py-1.5 flex items-center gap-2 hover:border-[#8B9CF1] transition-all">
                                        <span className="text-gray-700 font-semibold text-xs sm:text-sm whitespace-nowrap">
                                            Filter by Gender:
                                        </span>
                                        <select
                                            value={genderFilter}
                                            onChange={(e) => setGenderFilter(e.target.value)}
                                            className="bg-transparent text-[#3758EE] font-bold text-xs sm:text-sm focus:outline-none cursor-pointer pr-1"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="All">All</option>
                                        </select>
                                    </div>
                                    {loading && (
                                        <div className="flex items-center gap-1.5 text-xs text-[#3758EE] font-medium animate-pulse ml-1">
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Updating real data...</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-gray-400 italic text-xs sm:text-sm">
                                    Dynamic View: Select &apos;All&apos;, &apos;Male&apos;, or &apos;Female&apos; to filter KPIs, charts, and cohort analytics in real time.
                                </div>
                            </div>

                            {/* 3. System KPI Metric Cards (Matching StatsCard Theme) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Total Registrations */}
                                <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[135px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                                            TOTAL REGISTRATIONS
                                        </span>
                                        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                            <TfiArrowTopRight size={14} />
                                        </div>
                                    </div>
                                    <div className="text-[34px] sm:text-[38px] font-bold text-[#18181B] leading-none my-1">
                                        {cohortData.totalRegistrations.toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs mt-auto">
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAEFFF] text-[#3758EE]">
                                            Cohort: {genderFilter}
                                        </span>
                                        <span className="text-gray-400 text-[12px] truncate">Cumulative Signups</span>
                                    </div>
                                </div>

                                {/* Unique Students */}
                                <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[135px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                                            UNIQUE STUDENTS
                                        </span>
                                        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                            <TfiArrowTopRight size={14} />
                                        </div>
                                    </div>
                                    <div className="text-[34px] sm:text-[38px] font-bold text-[#18181B] leading-none my-1">
                                        {cohortData.uniqueStudents.toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs mt-auto">
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F9F4] text-[#00C896]">
                                            Distinct
                                        </span>
                                        <span className="text-gray-400 text-[12px] truncate">Profiles ({genderFilter})</span>
                                    </div>
                                </div>

                                {/* Supporter Willingness */}
                                <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[135px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                                            SUPPORTER WILLINGNESS
                                        </span>
                                        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                            <TfiArrowTopRight size={14} />
                                        </div>
                                    </div>
                                    <div className="text-[34px] sm:text-[38px] font-bold text-[#18181B] leading-none my-1">
                                        {cohortData.supporterWillingnessPercent}%
                                    </div>
                                    <div className="flex items-center gap-2 text-xs mt-auto">
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F3FF] text-[#8E6BFF]">
                                            {cohortData.willingSupportersCount} Supporters
                                        </span>
                                        <span className="text-gray-400 text-[12px] truncate">Willing Volunteers</span>
                                    </div>
                                </div>

                                {/* Top Enrolled Course */}
                                <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[135px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                                            TOP ENROLLED COURSE
                                        </span>
                                        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                            <TfiArrowTopRight size={14} />
                                        </div>
                                    </div>
                                    <div className="text-[20px] sm:text-[22px] font-bold text-[#3758EE] leading-tight my-1 line-clamp-1 truncate" title={cohortData.topEnrolledCourse}>
                                        {cohortData.topEnrolledCourse}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs mt-auto">
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#D97706]">
                                            {cohortData.topCourseStudentsCount} Enrolled
                                        </span>
                                        <span className="text-gray-400 text-[12px] truncate">Students</span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Four Interactive Visual Charts (2x2 Grid) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Top-Left: Course Demand & Intake Volume (Filtered) */}
                                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                                    <h3 className="text-[16px] sm:text-[18px] font-bold text-[#18181B] mb-3">
                                        Course Demand &amp; Intake Volume (Filtered)
                                    </h3>
                                    <div className="w-full h-[320px] min-w-0">
                                        {cohortData.courseDemand && cohortData.courseDemand.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={295}>
                                                <BarChart
                                                    layout="vertical"
                                                    data={cohortData.courseDemand}
                                                    margin={{ top: 5, right: 30, left: 25, bottom: 5 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="courseBarGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#8B9CF1" />
                                                            <stop offset="100%" stopColor="#4E60FF" />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid horizontal={false} vertical={true} stroke="#F1F5F9" />
                                                    <XAxis
                                                        type="number"
                                                        domain={[0, cohortData.courseMaxX || 4]}
                                                        ticks={cohortData.courseTicks}
                                                        tick={{ fill: '#64748B', fontSize: 11 }}
                                                        allowDecimals={false}
                                                    />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="name"
                                                        width={140}
                                                        tick={{ fill: '#334155', fontSize: 11 }}
                                                        interval={0}
                                                    />
                                                    <Tooltip content={<CustomBarTooltip unit="Registrations" />} />
                                                    <Bar
                                                        dataKey="value"
                                                        fill="url(#courseBarGradient)"
                                                        barSize={18}
                                                        radius={[0, 6, 6, 0]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-sm text-gray-400">
                                                No course demand data found for this filter.
                                            </div>
                                        )}
                                        <div className="text-center text-xs font-medium text-gray-400 mt-1">
                                            Total Registrations
                                        </div>
                                    </div>
                                </div>

                                {/* Top-Right: Volunteer Qualification Breakdown (Filtered) */}
                                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                                    <h3 className="text-[16px] sm:text-[18px] font-bold text-[#18181B] mb-3">
                                        Volunteer Qualification Breakdown (Filtered)
                                    </h3>
                                    <div className="w-full h-[320px] min-w-0">
                                        {cohortData.qualifications && cohortData.qualifications.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={295}>
                                                <BarChart
                                                    layout="vertical"
                                                    data={cohortData.qualifications}
                                                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="qualBarGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#B9A0EF" />
                                                            <stop offset="100%" stopColor="#8E6BFF" />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid horizontal={false} vertical={true} stroke="#F1F5F9" />
                                                    <XAxis
                                                        type="number"
                                                        domain={[0, cohortData.qualMaxX || 4]}
                                                        ticks={cohortData.qualTicks}
                                                        tick={{ fill: '#64748B', fontSize: 11 }}
                                                        allowDecimals={false}
                                                    />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="name"
                                                        width={145}
                                                        tick={{ fill: '#334155', fontSize: 11 }}
                                                        interval={0}
                                                    />
                                                    <Tooltip content={<CustomBarTooltip unit="Volunteers" />} />
                                                    <Bar
                                                        dataKey="value"
                                                        fill="url(#qualBarGradient)"
                                                        barSize={18}
                                                        radius={[0, 6, 6, 0]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-sm text-gray-400">
                                                No qualification data found for this filter.
                                            </div>
                                        )}
                                        <div className="text-center text-xs font-medium text-gray-400 mt-1">
                                            Willing Volunteers (Count)
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom-Left: Student Acquisition Channels (Filtered) */}
                                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                                    <h3 className="text-[16px] sm:text-[18px] font-bold text-[#18181B] mb-3">
                                        Student Acquisition Channels (Filtered)
                                    </h3>
                                    <div className="w-full h-[320px] min-w-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        {cohortData.acquisitionChannels && cohortData.acquisitionChannels.length > 0 ? (
                                            <>
                                                <div className="w-full sm:w-[58%] h-full flex items-center justify-center">
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <PieChart>
                                                            <Pie
                                                                data={cohortData.acquisitionChannels}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={65}
                                                                outerRadius={115}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                            >
                                                                {cohortData.acquisitionChannels.map((entry, index) => (
                                                                    <Cell key={`channel-cell-${index}`} fill={entry.color || SYSTEM_PALETTE[index % SYSTEM_PALETTE.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip content={<CustomDonutTooltip total={cohortData.totalRegistrations} />} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="w-full sm:w-[42%] flex flex-col justify-center space-y-2.5 pr-2">
                                                    {cohortData.acquisitionChannels.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2.5 text-xs text-gray-700">
                                                            <span
                                                                className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                                                                style={{ backgroundColor: item.color || SYSTEM_PALETTE[index % SYSTEM_PALETTE.length] }}
                                                            />
                                                            <span className="truncate font-medium">{item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                                                No acquisition channels recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom-Right: Age Distribution of Students (Filtered) */}
                                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                                    <h3 className="text-[16px] sm:text-[18px] font-bold text-[#18181B] mb-3">
                                        Age Distribution of Students (Filtered)
                                    </h3>
                                    <div className="relative w-full h-[320px] min-w-0">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-gray-400 origin-center -ml-3">
                                            Students
                                        </div>
                                        <div className="w-full h-full pl-3">
                                            {cohortData.ageDistribution && cohortData.ageDistribution.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={295}>
                                                    <BarChart
                                                        data={cohortData.ageDistribution}
                                                        margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
                                                    >
                                                        <defs>
                                                            <linearGradient id="ageBarGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#4E60FF" />
                                                                <stop offset="100%" stopColor="#8B9CF1" />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid horizontal={true} vertical={false} stroke="#F1F5F9" />
                                                        <XAxis
                                                            dataKey="ageGroup"
                                                            tick={{ fill: '#64748B', fontSize: 11 }}
                                                        />
                                                        <YAxis
                                                            domain={[0, cohortData.ageMaxY || 4]}
                                                            ticks={cohortData.ageTicks}
                                                            tick={{ fill: '#64748B', fontSize: 11 }}
                                                            allowDecimals={false}
                                                        />
                                                        <Tooltip content={<CustomBarTooltip unit="Students" />} />
                                                        <Bar
                                                            dataKey="count"
                                                            fill="url(#ageBarGradient)"
                                                            barSize={32}
                                                            radius={[6, 6, 0, 0]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                                                    No age records available.
                                                </div>
                                            )}
                                            <div className="text-center text-xs font-medium text-gray-400 mt-1">
                                                Age Group (Years)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ManagementDashboard;