import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import MetricCard from '@/components/shared/MetricCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import CoursesPage from '../../../../assets/images/coursespage.jpg';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentCourseStats } from '@/api/user';

const StudentCourseDashboard = ({ profileData }) => {
    const { t } = useTranslation();

    const { id: userId } = useParams();
    const navigate = useNavigate();
    const enrolledCourses = profileData?.enrolledCourses || [];

    // Default to the first course if available
    const [selectedCourseId, setSelectedCourseId] = useState(enrolledCourses[0]?.courseId || "");
    const [selectedCourseData, setSelectedCourseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (!selectedCourseId && enrolledCourses.length > 0) {
            setSelectedCourseId(enrolledCourses[0].courseId);
        }
    }, [enrolledCourses]);

    const fetchCourseStats = async () => {
        if (!userId || !selectedCourseId) return;
        try {
            setLoading(true);
            const res = await getStudentCourseStats(userId, selectedCourseId);
            if (res?.data) {
                setSelectedCourseData(res.data);
            }
        } catch (error) {
            console.error("Error fetching course stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseStats();
    }, [selectedCourseId]);

    const currentCourse = enrolledCourses.find(c => c.courseId === selectedCourseId) || enrolledCourses[0] || {};
    const stats = selectedCourseData?.stats || {
        progress: "0%",
        quizScore: "0%",
        lecturesCompleted: 0,
        timeSpent: "0h 0m",
        overallPerformance: 0,
        improvement: "0%"
    };
    const rawLectures = selectedCourseData?.lectures || [];
    const lectures = rawLectures.reduce((acc, l) => {
        acc.push({ ...l, type: 'Lecture', id: l.id || l._id });
        return acc;
    }, []);
    const overviewStats = [
        { label: "Quiz Score", value: stats.quizScore, color: "emerald", labelColor: "text-emerald-500", dotColor: "bg-emerald-500", lineColor: "bg-emerald-400" },
        { label: "lecture Completed", value: stats.lecturesCompleted.toString(), color: "blue", labelColor: "text-blue-600", dotColor: "bg-blue-600", lineColor: "bg-blue-500" },
        { label: "Time Spent Last week", value: stats.timeSpent, color: "purple", labelColor: "text-violet-500", dotColor: "bg-violet-500", lineColor: "bg-violet-400" }
    ];

    const userCoursesData = {
        hoursSpent: { sun: 0.8, mon: 1.2, tue: 1.5, wed: 2.0, thu: 1.0, fri: 0.5, sat: 0.8 },
        stats: { totalEnrolled: stats.progress, improvement: stats.improvement }
    };

    return (
        <div className="flex flex-col gap-6 font-sans py-2 relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-xl">
                    <div className="w-10 h-10 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Header: Course Selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
                <h2 className="text-[20px] font-bold text-gray-900">{selectedCourseData?.courseTitle || currentCourse.title || "No Course Selected"}</h2>
                <div className="relative inline-block w-full sm:w-auto">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center justify-between gap-3 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-sm font-medium w-full sm:w-[320px] hover:bg-blue-600 transition-all shadow-md group"
                    >
                        <span className="truncate">{selectedCourseData?.courseTitle || "Select Course"}</span>
                        <ChevronDown size={18} className={cn("transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-full sm:w-[320px] bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                            {enrolledCourses.length > 0 ? enrolledCourses.map((course) => (
                                <button
                                    key={course.courseId}
                                    onClick={() => {
                                        setSelectedCourseId(course.courseId);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 flex items-center gap-3",
                                        selectedCourseId === course.courseId ? "text-[#6366F1] font-bold bg-blue-50/50" : "text-gray-600 font-medium"
                                    )}
                                >
                                    <div className={cn("w-1.5 h-1.5 rounded-full", selectedCourseId === course.courseId ? "bg-[#6366F1]" : "bg-gray-200")} />
                                    <span className="truncate">{course.title}</span>
                                </button>
                            )) : (
                                <div className="px-4 py-3 text-sm text-gray-400 italic">No courses found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Row 1: Progress+Overview (left) | Performance (right) */}
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex flex-col gap-6 flex-1 min-w-0">
                    <MetricCard
                        title="Progress"
                        value={stats.progress}
                        trendValue={stats.improvement}
                        trendLabel="Improvement From last Week"
                        className="bg-white border rounded-[16px] p-6 shadow-sm"
                    />

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

                <div className="xl:w-[400px] shrink-0">
                    <PerformanceCard
                        name="Overall Performance"
                        percentageOverride={stats.overallPerformance}
                        trendOverride={stats.improvement?.replace('%', '')}
                        className="border rounded-[16px] h-full w-full"
                    />
                </div>
            </div>

            {/* Row 2: Hours Spent (left) | Student Info (right) */}
            <div className="flex flex-col xl:flex-row gap-6 h-[400px]">
                <div className="flex-1 min-w-0 h-full">
                    <HoursSpentCard
                        name="Hours Spent"
                        userCourses={userCoursesData}
                        className="h-full border rounded-[16px]"
                    />
                </div>

                <div className="xl:w-[400px] shrink-0 h-full bg-white border border-[#EAEDF2] rounded-[16px] p-6 shadow-sm relative min-w-0 overflow-hidden flex flex-col">
                    <div className="absolute top-4 right-4 text-gray-400 cursor-pointer">
                        <MoreVertical size={20} />
                    </div>

                    {selectedCourseData?.moderator ? (
                        <>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden p-0.5 shrink-0 border-2 border-blue-100">
                                    <img
                                        src={selectedCourseData.moderator.profileImageUrl || CoursesPage}
                                        alt="moderator"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col min-w-0 pr-6">
                                    <h4 className="text-[16px] font-bold text-gray-900 truncate">
                                        {selectedCourseData.moderator.name}
                                    </h4>
                                    <span className="text-gray-400 text-sm">#{selectedCourseData.moderator.id?.slice(-6) || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 rounded-xl p-4 flex flex-col gap-3 mb-4">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-blue-600 font-bold uppercase tracking-tight">Course Moderator</span>
                                    <span className="text-blue-800 font-bold">Joining Date</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] font-bold">
                                    <span className="text-blue-900 truncate pr-2">Active Official</span>
                                    <span className="text-blue-900">
                                        {selectedCourseData.moderator.joiningDate ? new Date(selectedCourseData.moderator.joiningDate).toLocaleDateString() : "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 mt-2 min-w-0 border-t border-blue-100/50 pt-2">
                                    <div className="flex items-center gap-2 text-[11px] text-blue-600 font-medium min-w-0">
                                        <span className="truncate">{selectedCourseData.moderator.email || "No email available"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-blue-600 font-medium">
                                        <span>{selectedCourseData.moderator.phone || "No phone available"}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-gray-900 font-bold">No Moderator Found</h4>
                                <p className="text-xs text-gray-400 max-w-[200px]">There is no instructor assigned to this course batch yet.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center mt-auto">
                        <GradiantButton
                            disabled={!selectedCourseData?.moderator}
                            onClick={() => selectedCourseData?.moderator?.id && navigate(`/moderator-details/${selectedCourseData.moderator.id}`, { state: { moderator: selectedCourseData.moderator } })}
                            className={cn(
                                "w-full py-2.5 rounded-lg text-sm font-bold transition-all uppercase tracking-wide",
                                selectedCourseData?.moderator
                                    ? "bg-[#6366F1] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            View Profile
                        </GradiantButton>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Lecture List Table */}
            <div className="bg-white border rounded-[16px] shadow-sm overflow-hidden mt-2">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Lecture List</h3>
                            <p className="text-xs text-gray-400">View performance for each lecture</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-gray-400 font-bold uppercase border-b border-gray-50">
                                    <th className="text-left py-4 px-4">Lecture No</th>
                                    <th className="text-left py-4 px-4">Title</th>
                                    <th className="text-left py-4 px-4 text-center">Progress & Score</th>
                                    <th className="text-left py-4 px-4">Date</th>
                                    <th className="text-left py-4 px-4">{t("status", "Status")}</th>
                                    <th className="text-left py-4 px-4 text-right">{t("action", "Action")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {lectures.length > 0 ? lectures.map((lecture, i) => (
                                    <tr key={i} className="hover:bg-gray-50/30 transition-colors text-sm text-gray-600">
                                        <td className="py-4 px-4 font-medium">{lecture.no}</td>
                                        <td className="py-4 px-4 font-medium text-gray-800">
                                            {lecture.title}
                                            {lecture.type !== 'Lecture' && (
                                                <span className="ml-2 text-[10px] uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                    {lecture.type}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center font-medium">{lecture.progress}</td>
                                        <td className="py-4 px-4">{lecture.date}</td>
                                        <td className="py-4 px-4">
                                            <span className={cn(
                                                "text-[12px] font-bold transition-colors px-3 py-1 rounded-full",
                                                lecture.status === 'Completed' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 bg-gray-50'
                                            )}>
                                                {lecture.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <GradiantButton 
                                                className="px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                                                onClick={() => navigate(`/admin-course-play?id=${selectedCourseId}&userId=${userId}&lectureId=${lecture.id}`)}
                                            >
                                                View Detail
                                            </GradiantButton>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-10 text-center text-gray-400 italic">No lectures available for this course.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar-thin::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}} />
        </div>
    );
};

export default StudentCourseDashboard;
