import { useTranslation } from 'react-i18next';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '@/components/shared/MetricCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import CourseCard from '@/components/shared/CourseCard';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import performance from '@/assets/images/performance.png';

const StudentPerformance = ({ profileData }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const user = profileData?.user || {};
    const stats = profileData?.stats || {
        totalEnrolled: 0,
        completed: 0,
        inProgress: 0,
        performance: 0,
        improvement: "0%",
        timeSpent: "0h 0m"
    };

    const enrolledCourses = profileData?.enrolledCourses || [];

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

    return (
        <div className="flex flex-col gap-6 py-4">
            {/* Top Row: Stats, Performance Overview */}
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex flex-col gap-6 flex-1">
                    <MetricCard
                        title="Total Enrolled Courses"
                        value={stats.totalEnrolled.toString()}
                        trendValue={stats.improvement || "2.7%"}
                        trendLabel="Improvement From last Week"
                        className="h-full"
                    />

                    {/* Overview items row */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm flex flex-col gap-2">
                        <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Overview</span>
                        <div className="flex flex-wrap items-center justify-between gap-6 sm:gap-12 mt-4 w-full">
                            <div className="flex flex-col items-start gap-1 min-w-fit">
                                <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none">{stats.completed}</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-emerald-500 text-[10px] sm:text-xs font-medium">Completed</span>
                                </div>
                            </div>
                            <div className="hidden sm:block w-[2px] h-10 bg-[#3758EE]/20 rounded-full"></div>
                            <div className="flex flex-col items-start gap-1 min-w-fit">
                                <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none">{stats.inProgress}</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#3758EE]"></div>
                                    <span className="text-[#3758EE] text-[10px] sm:text-xs font-medium">In Progress</span>
                                </div>
                            </div>
                            <div className="hidden sm:block w-[2px] h-10 bg-[#B666E7]/20 rounded-full"></div>
                            <div className="flex flex-col items-start gap-1 min-w-fit">
                                <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none">{stats.timeSpent || "12h 30m"}</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#B666E7]"></div>
                                    <span className="text-[#B666E7] text-[10px] sm:text-xs font-medium truncate">Time Spent Last week</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <PerformanceCard
                    className="xl:w-[400px]"
                    name="Performance Overview"
                    percentageOverride={stats.performance}
                    trendOverride="2.7"
                />
            </div>

            {/* Middle Section: Enrolled Courses Horizontal Scroll and Hours Spent Chart */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex flex-col gap-4 flex-[0.65] min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 shrink-0">Enrolled Courses</h3>
                    <div className="overflow-x-auto pb-4 custom-scrollbar-thin">
                        <div className="flex gap-5 min-w-max pb-2">
                            {enrolledCourses.length > 0 ? enrolledCourses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    title={course.title}
                                    completed={course.completedLectures}
                                    total={course.totalLectures}
                                    image={course.thumbnail || performance}
                                    className="w-[280px] shrink-0 h-auto"
                                />
                            )) : (
                                <div className="w-full py-10 text-center text-gray-400 bg-white rounded-xl border border-dashed">
                                    No courses enrolled yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="lg:flex-[0.35] lg:min-w-[350px] flex flex-col gap-4 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 shrink-0">Hours Spent</h3>
                    <HoursSpentCard
                        className="h-full"
                        name="Hours Spent"
                        userCourses={userCoursesData}
                    />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar-thin::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}} />

            {/* Bottom Section: Enrolled Courses Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Enrolled Courses Table</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                            <tr className="text-[12px] font-bold text-gray-900 uppercase tracking-wider">
                                <th className="px-6 py-4">Course Name</th>
                                <th className="px-6 py-4">Moderators</th>
                                <th className="px-6 py-4">Start & End Date</th>
                                <th className="px-6 py-4">Lectures</th>
                                <th className="px-6 py-4 text-center">Performance</th>
                                <th className="px-6 py-4">{t("status", "Status")}</th>
                                <th className="px-6 py-4 text-center">{t("action", "Action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tableData.length > 0 ? tableData.map((row) => (
                                <tr key={row.id} className="text-sm text-gray-600 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.courseName}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            {row.moderators.length > 0 ? row.moderators.map((mod, i) => (
                                                <span key={i} className="text-[#3758EE] underline cursor-pointer">{mod}</span>
                                            )) : <span className="text-gray-400 italic">None</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[11px]">
                                            <span>{row.startDate}</span>
                                            <span className="text-gray-400">{row.endDate}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.lectures}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[#3758EE] font-bold">{row.performance}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${row.status === 'Active' ? 'text-emerald-500 bg-emerald-50' : 'text-blue-500 bg-blue-50'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <GradiantButton 
                                            onClick={() => navigate(`/admin-course-play?id=${row.courseId || row.id}&userId=${user._id || user.id}`)}
                                            className="bg-[#3758EE] text-white text-[11px] font-bold px-4 py-1.5 rounded-[4px] hover:bg-blue-600 transition-colors"
                                        >
                                            View Details
                                        </GradiantButton>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center text-gray-400 italic">No enrollment data found in table.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentPerformance;
