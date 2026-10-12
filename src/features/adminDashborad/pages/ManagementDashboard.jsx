import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Interactive & Responsive Horizontal Bar Chart showing 5 items comfortably with a custom scrollbar for excess items
const ScrollableHorizontalBarChart = ({
    title,
    data = [],
    maxX = 4,
    ticks = [0, 1, 2, 3, 4],
    unit = 'Registrations',
    gradientClass = 'from-[#8B9CF1] to-[#4E60FF]',
    bottomLabel = 'Total Registrations',
    emptyMessage = 'No data available.'
}) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [tooltipPlacement, setTooltipPlacement] = useState('bottom');
    const scrollContainerRef = useRef(null);
    const effectiveMaxX = Math.max(maxX, 1);

    const updatePlacement = (idx, targetEl) => {
        setHoveredIdx(idx);
        if (scrollContainerRef.current && targetEl) {
            const containerRect = scrollContainerRef.current.getBoundingClientRect();
            const rowRect = targetEl.getBoundingClientRect();
            // If the row is within 50px of the container's visible top, show below to prevent clipping
            if (rowRect.top - containerRect.top < 50) {
                setTooltipPlacement('bottom');
            } else {
                setTooltipPlacement('top');
            }
        } else {
            setTooltipPlacement(idx === 0 ? 'bottom' : 'top');
        }
    };

    const handleMouseEnter = (idx, e) => {
        updatePlacement(idx, e.currentTarget);
    };

    const handleScroll = () => {
        if (hoveredIdx !== null && scrollContainerRef.current) {
            const rowEl = scrollContainerRef.current.querySelector(`[data-chart-row="${hoveredIdx}"]`);
            if (rowEl) {
                updatePlacement(hoveredIdx, rowEl);
            }
        }
    };

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[380px] h-full">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-[16px] sm:text-[18px] font-bold text-[#18181B] truncate" title={title}>
                    {title}
                </h3>
                {data.length > 5 && (
                    <span className="text-[11px] font-semibold text-[#3758EE] bg-[#EAEFFF] px-2.5 py-0.5 rounded-full shrink-0">
                        Top 5 shown • Scroll for more ({data.length})
                    </span>
                )}
            </div>

            {/* Content Area */}
            {data && data.length > 0 ? (
                <div className="flex-1 flex flex-col justify-between min-h-0">
                    {/* Rows Area: Max 240px displays exactly 5 rows (48px each). If > 5, cleanly scrolls with sleek scrollbar */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="relative flex-1 max-h-[240px] overflow-y-auto dashboard-scrollbar pr-1"
                    >
                        {/* Background Vertical Grid Lines */}
                        <div className="absolute inset-0 left-[130px] sm:left-[170px] md:left-[200px] pointer-events-none">
                            {ticks.map((tick, i) => {
                                const pct = (tick / effectiveMaxX) * 100;
                                return (
                                    <div
                                        key={i}
                                        className="absolute top-0 bottom-0 w-[1px] bg-[#F1F5F9]"
                                        style={{ left: `${pct}%` }}
                                    />
                                );
                            })}
                        </div>

                        {/* Chart Rows */}
                        <div className="flex flex-col">
                            {data.map((item, idx) => {
                                const pct = Math.min(100, (item.value / effectiveMaxX) * 100);
                                const isHovered = hoveredIdx === idx;

                                return (
                                    <div
                                        key={idx}
                                        data-chart-row={idx}
                                        onMouseEnter={(e) => handleMouseEnter(idx, e)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                        className={`relative flex items-center h-[48px] py-1 gap-2.5 hover:bg-gray-50/70 rounded-xl px-1.5 transition-colors group cursor-default ${
                                            isHovered ? 'z-30' : 'z-0'
                                        }`}
                                    >
                                        {/* Label (Course/Qualification Name) */}
                                        <div
                                            className="w-[130px] sm:w-[170px] md:w-[200px] shrink-0 text-right text-xs sm:text-[13px] font-medium text-gray-700 truncate pr-2 select-none"
                                            title={item.name}
                                        >
                                            {item.name}
                                        </div>

                                        {/* Bar Track */}
                                        <div className="flex-1 relative h-6 flex items-center">
                                            {/* Animated Bar */}
                                            <div
                                                className={`h-[18px] rounded-r-md bg-gradient-to-r ${gradientClass} transition-all duration-300 relative flex items-center justify-end group-hover:brightness-110 shadow-xs`}
                                                style={{
                                                    width: item.value > 0 ? `${Math.max(pct, 5)}%` : '0%',
                                                }}
                                            >
                                                {/* Inside Bar Value Badge (if wide enough) */}
                                                {item.value > 0 && pct >= 12 && (
                                                    <span className="text-[10px] font-bold text-white px-1.5 drop-shadow-xs">
                                                        {item.value}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Outside Bar Value Badge (if bar is small but > 0) */}
                                            {item.value > 0 && pct < 12 && (
                                                <span className="ml-1.5 text-[11px] font-bold text-gray-700">
                                                    {item.value}
                                                </span>
                                            )}

                                            {/* Hover Floating Tooltip */}
                                            {isHovered && (
                                                <div
                                                    className={`absolute left-1/2 -translate-x-1/2 z-40 pointer-events-none bg-gray-900/95 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap transition-all duration-150 ${
                                                        tooltipPlacement === 'bottom'
                                                            ? 'top-full mt-2'
                                                            : 'bottom-full mb-2'
                                                    }`}
                                                >
                                                    {/* Pointer Arrow */}
                                                    <div
                                                        className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/95 rotate-45 pointer-events-none ${
                                                            tooltipPlacement === 'bottom' ? '-top-1' : '-bottom-1'
                                                        }`}
                                                    />
                                                    <div className="relative z-10 font-semibold text-[11px] max-w-[240px] truncate">{item.name}</div>
                                                    <div className="relative z-10 text-[#8B9CF1] font-bold text-[12px] mt-0.5">
                                                        {item.value.toLocaleString()} {unit}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pinned Bottom Scale & X-Axis */}
                    <div className="pt-2 mt-2 border-t border-gray-100 flex flex-col">
                        <div className="flex items-center gap-2.5">
                            {/* Left Spacer matching label width */}
                            <div className="w-[130px] sm:w-[170px] md:w-[200px] shrink-0" />
                            {/* Ticks */}
                            <div className="flex-1 relative h-4 text-xs text-[#64748B]">
                                {ticks.map((tick, i) => {
                                    const pct = (tick / effectiveMaxX) * 100;
                                    return (
                                        <span
                                            key={i}
                                            className="absolute -translate-x-1/2 font-medium"
                                            style={{ left: `${pct}%` }}
                                        >
                                            {tick}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Bottom Label */}
                        <div className="text-center text-xs font-medium text-gray-400 mt-1">
                            {bottomLabel}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                    {emptyMessage}
                </div>
            )}
        </div>
    );
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
                                <ScrollableHorizontalBarChart
                                    title="Course Demand & Intake Volume (Filtered)"
                                    data={cohortData.courseDemand}
                                    maxX={cohortData.courseMaxX || 4}
                                    ticks={cohortData.courseTicks || [0, 1, 2, 3, 4]}
                                    unit="Registrations"
                                    gradientClass="from-[#8B9CF1] to-[#4E60FF]"
                                    bottomLabel="Total Registrations"
                                    emptyMessage="No course demand data found for this filter."
                                />

                                {/* Top-Right: Volunteer Qualification Breakdown (Filtered) */}
                                <ScrollableHorizontalBarChart
                                    title="Volunteer Qualification Breakdown (Filtered)"
                                    data={cohortData.qualifications}
                                    maxX={cohortData.qualMaxX || 4}
                                    ticks={cohortData.qualTicks || [0, 1, 2, 3, 4]}
                                    unit="Volunteers"
                                    gradientClass="from-[#B9A0EF] to-[#8E6BFF]"
                                    bottomLabel="Willing Volunteers (Count)"
                                    emptyMessage="No qualification data found for this filter."
                                />

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