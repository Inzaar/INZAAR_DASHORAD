import { useTranslation } from 'react-i18next';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import MetricCard from '@/components/shared/MetricCard';
import OverviewCard from '@/components/shared/OverviewCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getModeratorStudents } from '@/api/user';
import { useParams, useNavigate } from 'react-router-dom';

export default function ModeratorRecordComponent({ profileData, onEditClick, initialCourse }) {
    const { t } = useTranslation();

    const { id } = useParams();
    const navigate = useNavigate();
    const user = profileData?.user || {};
    const apiStats = profileData?.stats || {};

    // Extract unique courses from assigned batches
    const courses = useMemo(() => {
        const assignedBatches = profileData?.assignedBatches || [];
        const uniqueCoursesArr = Array.from(new Set(assignedBatches.map(b => b.courseId?.title).filter(Boolean)));
        return uniqueCoursesArr.length > 0 ? uniqueCoursesArr : ["Stress Management Course", "Imaniyaat Course", "Namaz Course"];
    }, [profileData]);

    const [selectedCourse, setSelectedCourse] = useState(initialCourse || courses[0]);
    useEffect(() => {
        if (initialCourse && courses.includes(initialCourse)) {
            setSelectedCourse(initialCourse);
        } else if (courses.length > 0 && (!selectedCourse || !courses.includes(selectedCourse))) {
            setSelectedCourse(courses[0]);
        }
    }, [courses, selectedCourse, initialCourse]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Pagination and table state
    const [students, setStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [filteredStats, setFilteredStats] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch students based on course and pagination
    useEffect(() => {
        const fetchStudents = async () => {
            if (!id || !selectedCourse) return;
            try {
                setLoadingStudents(true);
                const res = await getModeratorStudents(id, selectedCourse, currentPage, 5);
                if (res?.data) {
                    setStudents(res.data.students);
                    setTotalPages(res.data.totalPages);
                    setFilteredStats(res.data.stats);
                }
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [id, selectedCourse, currentPage]);

    // Reset pagination when course changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCourse]);

    // Combine API data with fallback mocks
    const moderatorStats = {
        totalEnrolled: filteredStats?.totalEnrolled ?? apiStats.totalEnrolled ?? 0,
        activeStudents: filteredStats?.activeStudents ?? apiStats.activeStudents ?? 0,
        inActiveStudents: filteredStats?.inActiveStudents ?? apiStats.inActiveStudents ?? 0,
        averageSpendRate: filteredStats?.averageSpendRate ?? apiStats.averageSpendRate ?? "0%",
        completionRate: filteredStats?.completionRate ?? apiStats.completionRate ?? 0,
        trend: filteredStats?.weeklyTrendPercentage ?? 0
    };

    return (
        <div className="w-full font-sans bg-white pb-8 mt-[20px] rounded-[10px]">
            {/* Header section with course title and dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-4 sm:mb-6 gap-2.5 sm:gap-4 mt-[10px]">
                <h2 className="text-base sm:text-lg lg:text-[20px] font-bold text-gray-800 leading-snug">
                    {selectedCourse}
                </h2>

                <div className="relative w-full sm:w-auto min-w-0" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full sm:w-auto bg-[#8B5CF6] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-[8px] flex items-center justify-between gap-2 text-xs sm:text-sm font-medium shadow-[0_2px_10px_rgba(139,92,246,0.2)] hover:bg-[#7c3aed] transition-colors"
                    >
                        <span className="truncate text-left max-w-[220px] sm:max-w-[180px] md:max-w-none">{selectedCourse}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute left-0 sm:left-auto right-0 top-full mt-1.5 w-full sm:w-auto sm:min-w-[220px] bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                            {courses.map((course) => (
                                <button
                                    key={course}
                                    onClick={() => {
                                        setSelectedCourse(course);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`block w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors ${selectedCourse === course ? 'text-[#8B5CF6] bg-purple-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {course}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Stats Cards Grid - MODERATOR EXCLUSIVE LABELS */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 pb-6">
                <div className='w-full flex flex-col gap-6 justify-between flex-1'>
                    {/* Total Enrolled Students Card */}
                    <div className='w-full'>
                        <MetricCard
                            className="w-full"
                            title="Total Enrolled Students"
                            value={moderatorStats.totalEnrolled.toString()}
                            trendValue={`${moderatorStats.trend}%`}
                            trendLabel="Improvement From last Week"
                        />
                    </div>
                    {/* Overview Card with Moderator Labels and Decorative Circles */}
                    <div className="w-full">
                        <OverviewCard
                            className="w-full max-w-full shadow-sm"
                            showCircles={true}
                            statsOverride={{
                                col1: { value: moderatorStats.activeStudents, label: "Active Students", shortLabel: "Active", color: "#22C55E" },
                                col2: { value: moderatorStats.inActiveStudents, label: "In Active Students", shortLabel: "Inactive", color: "#3758EE" },
                                col3: { value: moderatorStats.averageSpendRate, label: "Average spend rate", shortLabel: "Avg Spend", color: "#B666E7" }
                            }}
                        />
                    </div>
                </div>
                
                {/* Performance Card with Moderator Name */}
                <PerformanceCard
                    className="shadow-sm w-full lg:w-[40%] xl:w-[35%] shrink-0"
                    name="Course Completion Rate"
                    percentageOverride={moderatorStats.completionRate}
                    trendOverride={moderatorStats.trend}
                />
            </div>

            {/* Student Table Section */}
            <div className="w-full">
                <h3 className="text-base sm:text-[17px] font-semibold text-gray-800 mb-3 sm:mb-4 px-1">{t("student_table", "Student Table")}</h3>

                <div className="bg-white rounded-[12px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full overflow-hidden relative">
                    {loadingStudents && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {students.length > 0 ? (
                        <>
                            {/* Mobile Card List (< 768px) */}
                            <div className="block md:hidden p-3 space-y-3">
                                {students.map((student) => (
                                    <div key={student.id} className="bg-[#F8F9FA] rounded-[10px] p-3.5 flex flex-col gap-2.5 shadow-xs border border-gray-100">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-gray-800 truncate" title={student.name}>
                                                    {student.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 truncate mt-0.5" title={student.email}>
                                                    {student.email}
                                                </p>
                                                {student.phone && (
                                                    <p className="text-[11px] text-gray-400 truncate">
                                                        {student.phone}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {student.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-200/60 pt-2 text-gray-600">
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Progress</span>
                                                <span className="font-semibold text-gray-800">{student.progress}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Last Login</span>
                                                <span className="text-gray-700">{student.lastLogin}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                            className="w-full h-8 text-xs font-semibold text-white rounded-[6px] bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7c3aed] hover:to-[#4f46e5] transition-all shadow-xs mt-1"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop & Tablet Table (>= 768px) */}
                            <div className="hidden md:block overflow-x-auto w-full custom-scrollbar-thin">
                                <table className="w-full min-w-[750px] xl:min-w-full text-left border-separate border-spacing-y-3">
                                    <thead>
                                        <tr>
                                            <th className="pb-2 px-6 text-[13px] font-bold w-[15%] text-gray-500 uppercase tracking-wider">{t("name", "Name")}</th>
                                            <th className="pb-2 px-6 text-[13px] font-bold w-[25%] text-gray-500 uppercase tracking-wider">{t("contact", "Contact")}</th>
                                            <th className="pb-2 px-6 text-[13px] font-bold text-center w-[15%] text-gray-500 uppercase tracking-wider">{t("progress", "Progress")}</th>
                                            <th className="pb-2 px-6 text-[13px] font-bold w-[15%] text-gray-500 uppercase tracking-wider">{t("last_login", "Last Login")}</th>
                                            <th className="pb-2 px-6 text-[13px] font-bold w-[15%] text-gray-500 uppercase tracking-wider">{t("status", "Status")}</th>
                                            <th className="pb-2 px-6 text-[13px] font-bold text-center w-[15%] text-gray-500 uppercase tracking-wider">{t("action", "Action")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="before:block before:h-2">
                                        {students.map((student) => (
                                            <tr key={student.id} className="bg-[#F8F9FA] hover:bg-gray-100 transition-colors shadow-sm">
                                                <td className="py-4 px-6 text-[13px] font-medium text-gray-700 rounded-l-[8px]">
                                                    <span className="block max-w-[140px] truncate" title={student.name}>{student.name}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-[2px]">
                                                        <span className="text-[13px] font-medium text-gray-700 block max-w-[160px] truncate" title={student.email}>{student.email}</span>
                                                        <span className="text-[12px] text-gray-500 block max-w-[130px] truncate" title={student.phone}>{student.phone}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-[13px] text-gray-700 text-center font-medium whitespace-nowrap">{student.progress}</td>
                                                <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{student.lastLogin}</td>
                                                <td className="py-4 px-6 text-[13px] font-medium whitespace-nowrap">
                                                    <span className={student.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center rounded-r-[8px]">
                                                    <GradiantButton
                                                        onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                                        className="bg-[#8B5CF6] text-white px-5 py-2 rounded-[6px] text-[12px] font-medium hover:bg-[#7c3aed] transition-colors shadow-sm w-[110px] mx-auto"
                                                    >
                                                        View Profile
                                                    </GradiantButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        !loadingStudents && (
                            <div className="text-center py-10 sm:py-12 px-4 text-gray-500 font-medium text-sm flex flex-col items-center justify-center gap-2">
                                <svg className="w-9 h-9 sm:w-10 sm:h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-xs sm:text-sm text-gray-500">No students found for this course.</span>
                            </div>
                        )
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center sm:justify-end items-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 px-1 flex-wrap">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || loadingStudents}
                            className={`flex items-center gap-1 text-xs sm:text-[13px] font-medium transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-[13px] rounded-lg transition-colors ${currentPage === pageNum ? 'font-bold text-white bg-[#6366F1] shadow-sm' : 'font-medium text-gray-600 hover:bg-gray-100'}`}
                            >
                                {pageNum}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || loadingStudents || totalPages === 0}
                            className={`flex items-center gap-1 text-xs sm:text-[13px] font-medium transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            {t("next", "Next")}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}