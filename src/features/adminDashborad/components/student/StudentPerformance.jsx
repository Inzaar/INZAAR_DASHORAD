import React from 'react';
import MetricCard from '@/components/shared/MetricCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import CourseCard from '@/components/shared/CourseCard';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import performance from '@/assets/images/performance.png';

const StudentPerformance = ({ profileData }) => {
    // Mock data based on the provided image
    const stats = {
        totalEnrolled: 10,
        improvement: "2.7%",
        performance: 88,
        completed: 8,
        inProgress: 2,
        timeSpent: "12h 30m"
    };

    const enrolledCourses = [
        { id: 1, title: "Quran Recitation (Tajweed)", completed: 14, total: 20, image: performance },
        { id: 2, title: "Quran Recitation (Tajweed)", completed: 0, total: 20, image: performance }
    ];

    const tableData = [
        {
            id: 1,
            courseName: "Akmal Kay Dalail",
            moderators: ["Usama"],
            startDate: "08-Jan-2025",
            endDate: "05-June-2025",
            lectures: "12/10",
            quizzes: "8-Quizzes",
            assignments: "4-Assignments",
            performance: "77%",
            status: "Active"
        },
        {
            id: 2,
            courseName: "Dora Quran Course",
            moderators: ["Muhammad Zain", "Hanan Lar"],
            startDate: "05-Feb-2025",
            endDate: "20-March-2025",
            lectures: "12/10",
            quizzes: "5-Quizzes",
            assignments: "2-Assignments",
            performance: "34%",
            status: "Active"
        },
        {
            id: 3,
            courseName: "Imaniyat Course",
            moderators: ["Ghazala Khan", "Salman Shah"],
            startDate: "10-Sep-2025",
            endDate: "25-Dec-2025",
            lectures: "12/10",
            quizzes: "6-Quizzes",
            assignments: "2-Assignments",
            performance: "80%",
            status: "Completed"
        }
    ];

    // Mock userCourses data to match the Student Dashboard format
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
                        trendValue={stats.improvement}
                        trendLabel="Improvement From last Week"
                        className="h-full"
                    />

                    {/* Overview items row */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                            <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Overview</span>
                            <div className="flex flex-wrap items-center justify-between sm:justify-between gap-6 sm:gap-12 md:gap-16 lg:gap-24 mt-4 w-full">
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
                                    <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none">{stats.timeSpent}</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#B666E7]"></div>
                                        <span className="text-[#B666E7] text-[10px] sm:text-xs font-medium truncate">Time Spent Last week</span>
                                    </div>
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

            {/* Middle Section: Enrolled Courses Grid and Hours Spent Chart */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex flex-col gap-4 flex-1">
                    <h3 className="text-lg font-bold text-gray-900">Enrolled Courses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {enrolledCourses.map(course => (
                            <CourseCard
                                key={course.id}
                                title={course.title}
                                completed={course.completed}
                                total={course.total}
                                image={course.image}
                                className="w-full max-w-[476px] h-auto md:h-[334px]"
                            />
                        ))}
                    </div>
                    <div className="w-full h-2 mt-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#A892FF] rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `40%` }}
                        />
                    </div>
                </div>
                <div className="lg:w-[45%] flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Hours Spent</h3>
                    <HoursSpentCard
                        className="h-full"
                        name="Hours Spent"
                        userCourses={userCoursesData}
                    />
                </div>
            </div>

            {/* Bottom Section: Enrolled Courses Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Enrolled Courses</h3>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead className="bg-gray-50/50">
                            <tr className="text-[12px] font-bold text-gray-900 uppercase tracking-wider">
                                <th className="px-6 py-4">Course Name</th>
                                <th className="px-6 py-4">Moderators</th>
                                <th className="px-6 py-4">Start & End Date</th>
                                <th className="px-6 py-4">Lectures</th>
                                <th className="px-6 py-4">Quizzes & Assignment</th>
                                <th className="px-6 py-4">Performance</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tableData.map((row) => (
                                <tr key={row.id} className="text-sm text-gray-600 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.courseName}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            {row.moderators.map((mod, i) => (
                                                <span key={i} className="text-[#3758EE] underline cursor-pointer">{mod}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[11px]">
                                            <span>{row.startDate}</span>
                                            <span className="text-gray-400">{row.endDate}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.lectures}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col text-[11px]">
                                            <span>{row.quizzes}</span>
                                            <span>{row.assignments}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[#3758EE] font-bold">{row.performance}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${row.status === 'Active' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-400 bg-gray-50'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <GradiantButton className="bg-[#3758EE] text-white text-[11px] font-bold px-4 py-1.5 rounded-[4px] hover:bg-blue-600 transition-colors">
                                            View Details
                                        </GradiantButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentPerformance;
