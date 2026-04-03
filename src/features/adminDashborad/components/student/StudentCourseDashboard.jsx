import React, { useState } from 'react';
import MetricCard from '@/components/shared/MetricCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { FaGraduationCap } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import CoursesPage from '../../../../assets/images/coursespage.jpg'
const StudentCourseDashboard = ({ profileData }) => {
    const [selectedCourse, setSelectedCourse] = useState("Quran Recitation (Tajweed)");

    const courses = [
        "Quran Recitation (Tajweed)",
        "Translation (Lafzi Tarjuma)",
        "Tafseer (Quranic Wisdom)"
    ];

    // Mock data based on the screenshot
    const overviewStats = [
        { label: "Quiz Score", value: "82%", color: "emerald", labelColor: "text-emerald-500", dotColor: "bg-emerald-500", lineColor: "bg-emerald-400" },
        { label: "lecture Completed", value: "12", color: "blue", labelColor: "text-blue-600", dotColor: "bg-blue-600", lineColor: "bg-blue-500" },
        { label: "Time Spent Last week", value: "42h 30m", color: "purple", labelColor: "text-violet-500", dotColor: "bg-violet-500", lineColor: "bg-violet-400" }
    ];

    const lectures = [
        { no: "#01", title: "Introduction", date: "05-Feb-2025", progress: "88%", status: "Completed", action: "N/A" },
        { no: "#02", title: "Conclusion", date: "05-Feb-2025", progress: "90%", status: "Completed", action: "N/A" },
        { no: "Quiz", title: "Introduction", date: "05-Feb-2025", progress: "10", status: "Unlocked", action: "View Details" },
        { no: "Assignment", title: "Summary", date: "05-Feb-2025", progress: "N/A", status: "Submitted", action: "View Assignment" },
    ];

    const userCoursesData = {
        hoursSpent: {
            sun: 0.8,
            mon: 1.2,
            tue: 1.5,
            wed: 2.0,
            thu: 1.0,
            fri: 0.5,
            sat: 0.8
        },
        stats: {
            totalEnrolled: "47%",
            improvement: "2.7%"
        }
    };

    return (
        <div className="flex flex-col gap-6 font-sans">
            {/* Header: Course Selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
                <h2 className="text-[20px] font-bold text-gray-900">{selectedCourse}</h2>
                <div className="relative inline-block w-full sm:w-auto">
                    <button className="flex items-center justify-between gap-3 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-sm font-medium w-full sm:w-[260px]">
                        <span>{selectedCourse}</span>
                        <ChevronDown size={18} />
                    </button>
                    {/* Course list dropdown could be implemented here */}
                </div>
            </div>

            {/* Row 1: Progress+Overview (left) | Performance (right) */}
            <div className="flex flex-col xl:flex-row gap-6">

                {/* Left: Progress + Overview stacked */}
                <div className="flex flex-col gap-6 flex-1 min-w-0">
                    <MetricCard
                        title="Progress"
                        value="47%"
                        trendValue="2.7%"
                        trendLabel="Improvement From last Week"
                        className="bg-white border rounded-[16px] p-6 shadow-sm"
                    />

                    {/* Overview Card */}
                    <div className="bg-white border border-gray-100 rounded-[16px] p-6 shadow-sm flex flex-col gap-6 min-w-0">
                        <p className="text-gray-400 text-sm font-medium">Overview</p>
                        <div className="overflow-x-auto no-scrollbar">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-x-10 lg:gap-x-16 min-w-max md:min-w-0">
                                {overviewStats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="flex flex-col items-center h-14 w-2 shrink-0">
                                            <div className={cn("w-2 h-2 rounded-full shrink-0", stat.lineColor)} />
                                            <div className={cn("flex-1 w-[2px]", stat.lineColor)} />
                                            <div className={cn("w-2 h-2 rounded-full shrink-0", stat.lineColor)} />
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <span className="text-3xl font-medium text-gray-900 tracking-tight whitespace-nowrap">{stat.value}</span>
                                            <div className={cn("flex items-center gap-2 text-sm font-bold whitespace-nowrap", stat.labelColor)}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", stat.dotColor)} />
                                                {stat.label}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Performance Card */}
                <div className="xl:w-[300px] 2xl:w-[400px] shrink-0">
                    <PerformanceCard
                        name="Overall Performance"
                        percentageOverride={88}
                        trendOverride="5.2"
                        className="border rounded-[16px] h-full w-full"
                    />
                </div>
            </div>

            {/* Row 2: Hours Spent (left) | Student Info (right) — same row */}
            <div className="flex flex-col xl:flex-row gap-6">

                {/* Hours Spent Chart */}
                <HoursSpentCard
                    name="Hours Spent"
                    userCourses={userCoursesData}
                    className="flex-1 border rounded-[16px]"
                />

                {/* Student Info Card */}
                <div className="xl:w-[300px] 2xl:w-[400px] shrink-0 bg-white border border-[#EAEDF2] rounded-[16px] p-6 shadow-sm relative min-w-0 overflow-hidden">
                    <div className="absolute top-4 right-4 text-gray-400 cursor-pointer">
                        <MoreVertical size={20} />
                    </div>
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden p-0.5 shrink-0">
                            <img src={CoursesPage} alt="avatar" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0 pr-6">
                            <h4 className="text-[16px] font-bold text-gray-900 truncate">{profileData?.user?.firstname} {profileData?.user?.lastname}</h4>
                            <span className="text-gray-400 text-sm">#{profileData?.user?._id?.slice(-6) || '635261'}</span>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl p-4 flex flex-col gap-3 mb-4">
                        <div className="flex justify-between items-center text-[12px]">
                            <span className="text-blue-600 font-medium whitespace-nowrap">Performance</span>
                            <span className="text-blue-800 font-bold whitespace-nowrap">Joining Date</span>
                        </div>
                        <div className="flex justify-between items-center text-[12px] font-bold">
                            <span className="text-blue-900">88%</span>
                            <span className="text-blue-900">7/10/2025</span>
                        </div>
                        <div className="flex flex-col gap-1 mt-2 min-w-0">
                            <div className="flex items-center gap-2 text-[12px] text-blue-600 font-medium min-w-0">
                                <span className="truncate">{profileData?.user?.email || 'Mudassar123@gmail.com'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-blue-600 font-medium">
                                <span>(229) 555-0109</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button className="bg-[#6366F1] text-white px-8 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                            View
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Lecture List Table */}
            <div className="bg-white border rounded-[16px] shadow-sm overflow-hidden mt-2">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Lecture List</h3>
                            <p className="text-xs text-gray-400">Manage your lecture</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-grow sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by lecture no"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <button className="bg-[#6366F1] text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                                <Search size={16} /> <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-gray-400 font-bold uppercase border-b border-gray-50">
                                    <th className="text-left py-4 px-4 font-bold">Lecture No</th>
                                    <th className="text-left py-4 px-4 font-bold">Title</th>
                                    <th className="text-left py-4 px-4 font-bold">Date</th>
                                    <th className="text-left py-4 px-4 font-bold text-center">Progress & Score</th>
                                    <th className="text-left py-4 px-4 font-bold">Status</th>
                                    <th className="text-left py-4 px-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {lectures.map((lecture, i) => (
                                    <tr key={i} className="hover:bg-gray-50/30 transition-colors text-sm text-gray-600">
                                        <td className="py-4 px-4 font-medium">{lecture.no}</td>
                                        <td className="py-4 px-4 font-medium text-gray-800">{lecture.title}</td>
                                        <td className="py-4 px-4">{lecture.date}</td>
                                        <td className="py-4 px-4 text-center font-medium">{lecture.progress}</td>
                                        <td className="py-4 px-4">
                                            <span className={cn(
                                                "text-[12px] font-medium transition-colors",
                                                lecture.status === 'Completed' ? 'text-blue-500' : 'text-gray-400'
                                            )}>
                                                {lecture.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right underline text-[#3758EE] text-[12px] cursor-pointer font-medium whitespace-nowrap">
                                            {lecture.action}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-end items-center gap-2 mt-8">
                        <button className="flex items-center gap-1 text-[13px] font-medium text-gray-400 hover:text-gray-600">
                            <ChevronLeft size={16} /> Previous
                        </button>
                        {[1, 2, 3].map((page) => (
                            <button
                                key={page}
                                className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-all",
                                    page === 2 ? "bg-[#6366F1] text-white shadow-lg shadow-blue-500/30" : "text-gray-400 hover:bg-gray-100"
                                )}
                            >
                                {page}
                            </button>
                        ))}
                        <span className="text-gray-300">...</span>
                        <button className="flex items-center gap-1 text-[13px] font-medium text-gray-600 hover:text-gray-900">
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default StudentCourseDashboard;
