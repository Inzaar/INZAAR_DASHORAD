import GradiantButton from '@/components/ui/buttons/GradiantButton';
import MetricCard from '@/components/shared/MetricCard';
import OverviewCard from '@/components/shared/OverviewCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getModeratorStudents } from '@/api/user';
import { useParams, useNavigate } from 'react-router-dom';

export default function ModeratorRecordComponent({ profileData }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = profileData?.user || {};
    const apiStats = user.stats || {};

    // Extract unique courses from assigned batches
    const courses = useMemo(() => {
        const assignedBatches = user.assignedBatches || [];
        const uniqueCoursesArr = Array.from(new Set(assignedBatches.map(b => b.courseId?.title).filter(Boolean)));
        return uniqueCoursesArr.length > 0 ? uniqueCoursesArr : ["Stress Management Course", "Imaniyaat Course", "Namaz Course"];
    }, [user]);

    const [selectedCourse, setSelectedCourse] = useState(courses[0]);
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
        trend: filteredStats?.improvement ?? apiStats.improvement ?? "2.7%"
    };

    return (
        <div className="w-full font-sans bg-white pb-8 mt-[20px] rounded-[10px]">
            {/* Header section with course title and dropdown */}
            <div className="flex flex-row justify-between items-center w-full mb-6 gap-1 sm:gap-4 mt-[10px]">
                <h2 className="text-[12px] min-[480px]:text-[16px] sm:text-[20px] font-semibold text-gray-800 whitespace-nowrap flex-shrink-0">
                    {selectedCourse}
                </h2>

                <div className="flex items-center justify-end gap-1 min-[400px]:gap-2 min-w-0">
                    <div className="relative flex-shrink min-w-0" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="bg-[#8B5CF6] text-white px-2.5 py-1.5 min-[400px]:px-3 min-[400px]:py-2 sm:px-4 sm:py-2.5 rounded-[4px] sm:rounded-[6px] flex items-center justify-between gap-1 sm:gap-2 text-[10px] min-[400px]:text-[12px] sm:text-[14px] font-medium shadow-[0_2px_10px_rgba(139,92,246,0.2)] hover:bg-[#7c3aed] transition-colors max-w-full"
                        >
                            <span className="truncate block max-w-[90px] min-[400px]:max-w-[120px] sm:max-w-[150px] md:max-w-none text-left">{selectedCourse}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-2.5 h-2.5 min-[400px]:w-3 min-[400px]:h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-full min-w-[170px] bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                                {courses.map((course) => (
                                    <button
                                        key={course}
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2.5 text-[12px] sm:text-sm transition-colors ${selectedCourse === course ? 'text-[#8B5CF6] bg-purple-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {course}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Stats Cards Grid - MODERATOR EXCLUSIVE LABELS */}
            <div className="flex max-[973px]:flex-col gap-6 pb-6">
                <div className='w-full flex flex-col gap-6 justify-between flex-1'>
                    {/* Total Enrolled Students Card */}
                    <div className='w-full'>
                        <MetricCard
                            className="w-full"
                            title="Total Enrolled Students"
                            value={moderatorStats.totalEnrolled}
                            trendValue={moderatorStats.trend}
                            trendLabel="Improvement From last Week"
                        />
                    </div>
                    {/* Overview Card with Moderator Labels and Decorative Circles */}
                    <div className="w-full">
                        <OverviewCard
                            className="w-full max-w-full shadow-sm"
                            showCircles={true}
                            statsOverride={{
                                col1: { value: moderatorStats.activeStudents, label: "Active Students", color: "#22C55E" },
                                col2: { value: moderatorStats.inActiveStudents, label: "In Active Students", color: "#3758EE" },
                                col3: { value: moderatorStats.averageSpendRate, label: "Average spend rate", color: "#B666E7" }
                            }}
                        />
                    </div>
                </div>
                
                {/* Performance Card with Moderator Name */}
                <PerformanceCard
                    className="shadow-sm w-full min-[973px]:w-[40%] min-[1250px]:w-[35%]"
                    name="Course Completion Rate"
                    percentageOverride={moderatorStats.completionRate}
                    trendOverride={moderatorStats.trend?.replace('%', '') || 2.7}
                />
            </div>

            {/* Student Table Section */}
            <div className="w-full">
                <h3 className="text-[17px] font-semibold text-gray-800 mb-4 px-2">Student Table</h3>

                <div className="bg-white rounded-[12px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full overflow-hidden relative">
                    {loadingStudents && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[800px] text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr>
                                    <th className="pb-2 px-6 text-[13px] font-bold w-[15%] text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold w-[25%] text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold text-center w-[15%] text-gray-500 uppercase tracking-wider">Progress</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold w-[15%] text-gray-500 uppercase tracking-wider">Last Login</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold w-[15%] text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold text-center w-[15%] text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="before:block before:h-2">
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="bg-[#F8F9FA] hover:bg-gray-100 transition-colors shadow-sm">
                                            <td className="py-4 px-6 text-[13px] font-medium text-gray-700 rounded-l-[8px]">{student.name}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-[2px]">
                                                    <span className="text-[13px] font-medium text-gray-700">{student.email}</span>
                                                    <span className="text-[12px] text-gray-500">{student.phone}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-[13px] text-gray-700 text-center font-medium">{student.progress}</td>
                                            <td className="py-4 px-6 text-[13px] text-gray-600">{student.lastLogin}</td>
                                            <td className="py-4 px-6 text-[13px] font-medium">
                                                <span className={student.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center rounded-r-[8px]">
                                                <GradiantButton 
                                                    onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                                    className="bg-[#8B5CF6] text-white px-5 py-2 rounded-[6px] text-[12px] font-medium hover:bg-[#7c3aed] transition-colors shadow-sm w-[110px]"
                                                >
                                                    View Profile
                                                </GradiantButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    !loadingStudents && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-gray-500 font-medium">
                                                No students found for this course.
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-end items-center gap-2 mt-6 px-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || loadingStudents}
                        className={`flex items-center gap-1 text-[13px] font-medium transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center text-[13px] rounded-lg transition-colors ${currentPage === pageNum ? 'font-bold text-white bg-[#6366F1] shadow-sm' : 'font-medium text-gray-600 hover:bg-gray-100'}`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || loadingStudents || totalPages === 0}
                        className={`flex items-center gap-1 text-[13px] font-medium transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Next
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}