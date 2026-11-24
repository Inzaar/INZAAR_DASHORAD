import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '@/components/shared/MetricCard';
import OverviewCard from '@/components/shared/OverviewCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import CourseCard from '@/components/shared/CourseCard';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { CustomPagination } from '@/components/ui/Pagination';
import performance from '@/assets/images/performance.png';

const StudentPerformance = ({ profileData }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const user = profileData?.user || {};
    const enrolledCourses = profileData?.enrolledCourses || [];

    const completedCount = profileData?.stats?.completed ?? enrolledCourses.filter(c => c.isCompleted).length;
    const inProgressCount = profileData?.stats?.inProgress ?? enrolledCourses.filter(c => !c.isCompleted).length;

    const stats = profileData?.stats || {
        totalEnrolled: enrolledCourses.length,
        completed: completedCount,
        inProgress: inProgressCount,
        performance: 0,
        improvement: "0%",
        timeSpent: "0h 0m"
    };

    const tableData = enrolledCourses.map(e => ({
        id: e.id,
        courseId: e.courseId,
        courseName: e.title,
        moderators: e.moderators || [],
        startDate: "08-Jan-2025", // Placeholder
        endDate: "05-June-2025",
        lectures: `${e.completedLectures}/${e.totalLectures}`,
        quizzes: "0-Quizzes",
        assignments: "0-Assignments",
        performance: `${e.progress}%`,
        status: e.isCompleted ? "Completed" : "Active"
    }));

    const userCoursesData = {
        hoursSpent: {
            sun: 15,
            mon: 24,
            tue: 12,
            wed: 20,
            thu: 15,
            fri: 22,
            sat: 15
        }
    };

    const itemsPerPage = 5;
    const totalPages = Math.ceil(tableData.length / itemsPerPage);
    const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex flex-col gap-4 sm:gap-6 py-2 sm:py-4">
            {/* Top Row: Stats, Performance Overview */}
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
                <div className="w-full flex flex-col gap-4 sm:gap-6 justify-between flex-1 min-w-0">
                    <div className="w-full">
                        <MetricCard
                            title="Total Enrolled Courses"
                            value={stats.totalEnrolled.toString()}
                            trendValue={`${stats.weeklyTrendPercentage ?? 0}%`}
                            trendLabel="Improvement From last Week"
                            className="w-full"
                        />
                    </div>

                    {/* Overview Card */}
                    <div className="w-full">
                        <OverviewCard
                            className="w-full max-w-full shadow-sm"
                            statsOverride={{
                                col1: {
                                    value: completedCount,
                                    label: "Completed",
                                    shortLabel: "Completed",
                                    color: "#22C55E"
                                },
                                col2: {
                                    value: inProgressCount,
                                    label: "In Progress",
                                    shortLabel: "In Progress",
                                    color: "#3758EE"
                                },
                                col3: {
                                    value: stats.timeSpent || "12h 30m",
                                    label: "Time Spent Last week",
                                    shortLabel: "Time Spent",
                                    color: "#B666E7"
                                }
                            }}
                        />
                    </div>
                </div>

                <PerformanceCard
                    className="shadow-sm w-full xl:w-[400px] shrink-0"
                    name="Performance Overview"
                    percentageOverride={stats.performance}
                    trendOverride={stats.weeklyTrendPercentage !== undefined ? stats.weeklyTrendPercentage : 0}
                />
            </div>

            {/* Middle Section: Enrolled Courses Horizontal Scroll and Hours Spent Chart */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                <div className="flex flex-col gap-3 sm:gap-4 flex-[0.65] min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 shrink-0">Enrolled Courses</h3>
                    <div className="overflow-x-auto pb-2 custom-scrollbar-thin">
                        <div className="flex gap-3 sm:gap-4 min-w-max pb-1">
                            {enrolledCourses.length > 0 ? enrolledCourses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    title={course.title}
                                    completed={course.completedLectures}
                                    total={course.totalLectures}
                                    image={course.thumbnail || performance}
                                    className="w-[230px] sm:w-[270px] shrink-0 h-auto"
                                />
                            )) : (
                                <div className="w-full py-8 sm:py-10 text-center text-gray-400 bg-white rounded-xl border border-dashed text-xs sm:text-sm">
                                    No courses enrolled yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="lg:flex-[0.35] lg:min-w-[320px] xl:min-w-[350px] flex flex-col gap-3 sm:gap-4 shrink-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 shrink-0">Hours Spent</h3>
                    <HoursSpentCard
                        className="h-full"
                        name="Hours Spent"
                        userCourses={userCoursesData}
                    />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-thin::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}} />

            {/* Bottom Section: Enrolled Courses Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="p-3.5 sm:p-5 border-b border-gray-100">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Enrolled Courses Table</h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar-thin">
                    <table className="w-full min-w-[580px] xl:min-w-full text-left border-collapse">
                        <thead className="bg-[#FCFCFD] border-b border-gray-100 sticky top-0 z-10">
                            <tr className="text-[10px] sm:text-[11px] xl:text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-2.5 sm:px-3.5 xl:px-5 py-2.5 sm:py-3.5 min-w-[130px] sm:min-w-[170px]">Course Name</th>
                                <th className="px-2 sm:px-3 xl:px-4 py-2.5 sm:py-3.5">Moderators</th>
                                <th className="px-2 sm:px-3 xl:px-4 py-2.5 sm:py-3.5 whitespace-nowrap">Start & End Date</th>
                                <th className="px-2 sm:px-3 xl:px-4 py-2.5 sm:py-3.5 text-center">Lectures</th>
                                <th className="px-2 sm:px-3 xl:px-4 py-2.5 sm:py-3.5 text-center">Performance</th>
                                <th className="px-2 sm:px-3 xl:px-4 py-2.5 sm:py-3.5 text-center">{t("status", "Status")}</th>
                                <th className="px-2 sm:px-3 xl:px-4 py-2.5 sm:py-3.5 text-center">{t("action", "Action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.length > 0 ? paginatedData.map((row) => (
                                <tr key={row.id} className="text-[11px] min-[360px]:text-xs sm:text-[13px] xl:text-sm text-gray-600 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-2.5 sm:px-3.5 xl:px-5 py-2 sm:py-2.5 xl:py-3.5 font-semibold text-gray-800 leading-snug">
                                        <div className="max-w-[180px] sm:max-w-none">{row.courseName}</div>
                                    </td>
                                    <td className="px-2 sm:px-3 xl:px-4 py-2 sm:py-2.5 xl:py-3.5">
                                        <div className="flex flex-col">
                                            {row.moderators.length > 0 ? row.moderators.map((mod, i) => {
                                                const modName = typeof mod === 'string' ? mod : (mod?.firstname || mod?.lastname ? `${mod.firstname || ""} ${mod.lastname || ""}`.trim() : (mod?.name || mod?.username || "Unknown"));
                                                return (
                                                    <span key={i} className="text-[#3758EE] underline hover:text-blue-700 transition-colors cursor-pointer text-[11px] sm:text-xs">
                                                        {modName}
                                                    </span>
                                                );
                                            }) : <span className="text-gray-400 italic text-[11px]">None</span>}
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-3 xl:px-4 py-2 sm:py-2.5 xl:py-3.5 whitespace-nowrap">
                                        <div className="flex flex-col text-[10px] sm:text-[11px] leading-tight">
                                            <span className="font-medium text-gray-700">{row.startDate}</span>
                                            <span className="text-gray-400">{row.endDate}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-3 xl:px-4 py-2 sm:py-2.5 xl:py-3.5 font-medium text-gray-900 text-center whitespace-nowrap">{row.lectures}</td>
                                    <td className="px-2 sm:px-3 xl:px-4 py-2 sm:py-2.5 xl:py-3.5 text-center whitespace-nowrap">
                                        <span className="text-[#3758EE] font-bold">{row.performance}</span>
                                    </td>
                                    <td className="px-2 sm:px-3 xl:px-4 py-2 sm:py-2.5 xl:py-3.5 text-center whitespace-nowrap">
                                        <span className={`inline-flex px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${row.status === 'Active' ? 'text-emerald-500 bg-emerald-50' : 'text-blue-500 bg-blue-50'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-2 sm:px-3 xl:px-4 py-2 sm:py-2.5 xl:py-3.5 text-center whitespace-nowrap">
                                        <GradiantButton
                                            onClick={() => navigate(`/admin-course-play?id=${row.courseId || row.id}&userId=${user._id || user.id}`)}
                                            className="bg-[#3758EE] text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md hover:bg-blue-600 transition-colors shadow-xs"
                                        >
                                            View Details
                                        </GradiantButton>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-gray-400 italic text-xs sm:text-sm">No enrollment data found in table.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-end items-center p-3 sm:p-4 border-t border-gray-100 w-full">
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPerformance;
