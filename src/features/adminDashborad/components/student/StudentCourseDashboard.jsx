import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import MetricCard from '@/components/shared/MetricCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { CustomPagination } from '@/components/ui/Pagination';
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, X, MoreHorizontal, Edit2, Trash2, Smile, Square, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import CoursesPage from '../../../../assets/images/coursespage.jpg';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentCourseStats } from '@/api/user';
import { getComments, createComment, updateComment, deleteComment, reactToComment } from '@/api/comments';
import { createNotification } from '@/api/notification';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const StudentCourseDashboard = ({ profileData }) => {
    const { t } = useTranslation();

    const { id: userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const enrolledCourses = profileData?.enrolledCourses || [];

    const searchParams = new URLSearchParams(window.location.search);
    const targetCourseId = searchParams.get("courseId");
    const targetLectureId = searchParams.get("lectureId");

    // Default to target course or first course if available
    const [selectedCourseId, setSelectedCourseId] = useState(targetCourseId || enrolledCourses[0]?.courseId || "");
    const [selectedCourseData, setSelectedCourseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [selectedLectureForComments, setSelectedLectureForComments] = useState(null);
    const [lectureComments, setLectureComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [activeReactionPopup, setActiveReactionPopup] = useState(null);
    const [commentToDelete, setCommentToDelete] = useState(null);

    const EMOJIS = ['👍', '❤️', '😂', '🔥', '🤔'];

    // Selection mode state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedComments, setSelectedComments] = useState([]);

    const handleEditComment = async (commentId) => {
        if (!editingText.trim()) return;
        try {
            const res = await updateComment(commentId, { content: editingText });
            if (res?.data?.data) {
                setLectureComments(prev => prev.map(c => c._id === commentId ? res.data.data : c));
                setEditingCommentId(null);
                setEditingText("");
            }
        } catch (error) {
            toast.error("Failed to update comment");
        }
    };

    const handleDeleteComment = (commentId) => {
        setCommentToDelete(commentId);
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;
        try {
            await deleteComment(commentToDelete);
            setLectureComments(prev => prev.filter(c => c._id !== commentToDelete));
            toast.success("Comment deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete comment");
        } finally {
            setCommentToDelete(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedComments.length === 0) return;
        
        try {
            await Promise.all(selectedComments.map(id => deleteComment(id)));
            setLectureComments(prev => prev.filter(c => !selectedComments.includes(c._id)));
            setSelectedComments([]);
            setIsSelectionMode(false);
            toast.success(`${selectedComments.length} comments deleted successfully`);
        } catch (error) {
            console.error("Failed to delete comments:", error);
            toast.error('Failed to delete some comments');
        }
    };

    const handleToggleCommentSelection = (commentId) => {
        setSelectedComments(prev => 
            prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
        );
    };

    const handleReactToComment = async (commentId, emoji) => {
        try {
            const res = await reactToComment(commentId, emoji);
            if (res?.data?.data) {
                setLectureComments(prev => prev.map(c => c._id === commentId ? res.data.data : c));
            }
            setActiveReactionPopup(null);
        } catch (error) {
            toast.error("Failed to add reaction");
        }
    };

    const handleAddComment = async (e) => {
        if ((e.type === 'click' || e.key === 'Enter') && newCommentText.trim()) {
            const lectureId = selectedLectureForComments?.id || selectedLectureForComments?._id;
            if (!lectureId) {
                toast.error("Lecture ID not found.");
                return;
            }
            try {
                const res = await createComment({ lectureId, studentId: userId, content: newCommentText });
                if (res?.data?.data) {
                    setLectureComments([...lectureComments, res.data.data]);
                    setNewCommentText("");

                    createNotification({
                        title: `New Reply from Admin`,
                        type: "app",
                        message: `Admin replied to your comment in ${selectedLectureForComments?.title}`,
                        link: `/course-view?id=${selectedCourseId}&lectureId=${lectureId}`,
                        sendto: userId,
                        sendfrom: user?._id || user?.id,
                    })
                    .then(res => console.log("Notification created:", res))
                    .catch(err => {
                        console.error("Notification failed", err);
                        toast.error(`Notification failed: ${err.message}`);
                    });
                } else {
                    toast.error("Failed to post comment");
                }
            } catch (error) {
                console.error("Error saving comment:", error);
                toast.error(error?.response?.data?.message || "Failed to post comment");
            }
        }
    };

    const handleViewComments = async (lecture) => {
        setSelectedLectureForComments(lecture);
        setIsCommentsModalOpen(true);
        setLoadingComments(true);
        try {
            const res = await getComments(lecture.id, userId);
            if (res?.data?.data) {
                setLectureComments(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
            setLectureComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

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

    // Handle deep linking for lecture comments
    useEffect(() => {
        if (targetLectureId && selectedCourseData && !isCommentsModalOpen) {
            const rawLectures = selectedCourseData.lectures || [];
            const lec = rawLectures.find(l => (l.id || l._id) === targetLectureId);
            if (lec) {
                // Remove the lectureId from URL to prevent reopening on refresh or close
                const newUrl = new URL(window.location);
                newUrl.searchParams.delete("lectureId");
                window.history.replaceState({}, "", newUrl);
                
                handleViewComments({ ...lec, type: 'Lecture', id: lec.id || lec._id });
            }
        }
    }, [targetLectureId, selectedCourseData]);

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

    const itemsPerPage = 5;
    const totalPages = Math.ceil(lectures.length / itemsPerPage);
    const paginatedLectures = lectures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
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
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6 mt-2">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Lecture List</h3>
                            <p className="text-xs text-gray-400 mt-1">View performance for each lecture</p>
                        </div>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                            <tr className="text-[12px] font-bold text-gray-900 uppercase tracking-wider">
                                <th className="px-6 py-4">Lecture No</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4 text-center">Progress & Score</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">{t("status", "Status")}</th>
                                <th className="px-6 py-4 text-center">Comments</th>
                                <th className="px-6 py-4 text-center">{t("action", "Action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedLectures.length > 0 ? paginatedLectures.map((lecture, i) => (
                                <tr key={i} className="text-sm text-gray-600 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{lecture.no}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {lecture.title}
                                        {lecture.type !== 'Lecture' && (
                                            <span className="ml-2 text-[10px] uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                {lecture.type}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[#3758EE] font-bold">{lecture.progress}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{lecture.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[11px] font-bold",
                                            lecture.status === 'Completed' ? 'text-emerald-500 bg-emerald-50' : 'text-blue-500 bg-blue-50'
                                        )}>
                                            {lecture.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            className="text-[#3758EE] underline font-medium text-[12px] hover:text-blue-800 transition-colors"
                                            onClick={() => handleViewComments(lecture)}
                                        >
                                            View Comments
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <GradiantButton 
                                            className="bg-[#3758EE] text-white text-[11px] font-bold px-4 py-1.5 rounded-[4px] hover:bg-blue-600 transition-colors"
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
                {totalPages > 1 && (
                    <div className="flex justify-end items-center p-4 border-t border-gray-100 w-full">
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </div>
                )}
            </div>

            {isCommentsModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            {isSelectionMode ? (
                                <div className="flex items-center gap-3 w-full bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                                    <button onClick={() => { setIsSelectionMode(false); setSelectedComments([]); }} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                                        <X size={18} />
                                    </button>
                                    <span className="font-medium text-blue-700">{selectedComments.length} Selected</span>
                                    <div className="flex-1"></div>
                                    <button 
                                        onClick={() => {
                                            if (window.confirm(`Delete ${selectedComments.length} comments?`)) {
                                                handleBulkDelete();
                                            }
                                        }}
                                        disabled={selectedComments.length === 0}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Lecture Comments</h3>
                                        <p className="text-sm text-gray-500 mt-1">{selectedLectureForComments?.title}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setIsSelectionMode(true)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Select
                                        </button>
                                        <button onClick={() => setIsCommentsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="p-6 pb-12 overflow-y-auto flex-1 bg-[#F8F9FA] custom-scrollbar-thin flex flex-col">
                            {loadingComments ? (
                                <div className="flex justify-center items-center h-32 flex-1">
                                    <div className="w-8 h-8 border-4 border-[#3758EE] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : lectureComments && lectureComments.length > 0 ? (
                                <div className="flex flex-col gap-4 flex-1">
                                    {lectureComments.map(comment => {
                                        const senderIdStr = String(comment.senderId?._id || comment.senderId?.id || comment.senderId);
                                        const isStudent = senderIdStr === String(userId);
                                        const isMe = senderIdStr === String(user?._id || user?.id);
                                        const canEdit = isMe || user?.role === 'admin';
                                        const isSelected = selectedComments.includes(comment._id);
                                        
                                        return (
                                            <div key={comment._id} className={cn("relative flex items-center gap-3 w-full group hover:z-[100]", !isMe ? "justify-start" : "justify-end")}>
                                                {isSelectionMode && !isMe && (
                                                    <button onClick={() => handleToggleCommentSelection(comment._id)} className="text-gray-400 hover:text-blue-600 transition-colors shrink-0">
                                                        {isSelected ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                                                    </button>
                                                )}
                                                <div className={cn("flex flex-col max-w-[90%]", !isMe ? "items-start" : "items-end")}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {(!isSelectionMode && isMe) && (
                                                            <>
                                                                <div className="relative">
                                                                    <button onClick={() => setActiveReactionPopup(activeReactionPopup === comment._id ? null : comment._id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                        <Smile size={14} />
                                                                    </button>
                                                                    {activeReactionPopup === comment._id && (
                                                                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-full px-2 py-1 flex items-center gap-1 z-10">
                                                                            {EMOJIS.map(emoji => (
                                                                                <button key={emoji} onClick={() => handleReactToComment(comment._id, emoji)} className="text-lg hover:scale-125 transition-transform px-1">
                                                                                    {emoji}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {canEdit && (
                                                                    <button onClick={() => { setEditingCommentId(comment._id); setEditingText(comment.content); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                )}
                                                                <button onClick={() => handleDeleteComment(comment._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={cn("px-4 py-2.5 rounded-2xl shadow-sm flex flex-col gap-0.5 relative", !isMe ? "bg-white border border-gray-200 rounded-bl-none" : "bg-[#3758EE] text-white rounded-br-none")}>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="font-bold text-xs opacity-90">
                                                            {comment.senderId?.firstname} {comment.senderId?.lastname}
                                                            {!isStudent && <span className="text-[9px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full ml-2">{comment.senderId?.role}</span>}
                                                            {isStudent && <span className="text-[9px] font-bold uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-2">Student</span>}
                                                        </span>
                                                        <span className="text-[10px] opacity-70 font-medium whitespace-nowrap">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                    
                                                    {editingCommentId === comment._id ? (
                                                        <div className="mt-2 flex flex-col gap-2">
                                                            <textarea 
                                                                className="w-full text-sm text-gray-800 p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[60px]" 
                                                                value={editingText} 
                                                                onChange={(e) => setEditingText(e.target.value)} 
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        handleEditComment(comment._id);
                                                                    } else if (e.key === 'Escape') {
                                                                        setEditingCommentId(null);
                                                                    }
                                                                }}
                                                                autoFocus
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm leading-relaxed mt-1">{comment.content}</p>
                                                    )}

                                                    {comment.reactions && comment.reactions.length > 0 && (
                                                        <div className={cn("absolute -bottom-3 flex items-center gap-1", !isMe ? "right-2" : "left-2")}>
                                                            <div className="bg-white border border-gray-100 shadow-sm rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1">
                                                                {Array.from(new Set(comment.reactions.map(r => r.emoji))).map(e => (
                                                                    <span key={e}>{e}</span>
                                                                ))}
                                                                <span className="text-gray-500 font-bold ml-0.5">{comment.reactions.length}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                                                    {(!isSelectionMode && !isMe) && (
                                                        <>
                                                            <div className="relative">
                                                                <button onClick={() => setActiveReactionPopup(activeReactionPopup === comment._id ? null : comment._id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                    <Smile size={14} />
                                                                </button>
                                                                {activeReactionPopup === comment._id && (
                                                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-full px-2 py-1 flex items-center gap-1 z-10">
                                                                        {EMOJIS.map(emoji => (
                                                                            <button key={emoji} onClick={() => handleReactToComment(comment._id, emoji)} className="text-lg hover:scale-125 transition-transform px-1">
                                                                                {emoji}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {canEdit && (
                                                                <button onClick={() => { setEditingCommentId(comment._id); setEditingText(comment.content); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                    <Edit2 size={14} />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleDeleteComment(comment._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelectionMode && isMe && (
                                                <button onClick={() => handleToggleCommentSelection(comment._id)} className="text-gray-400 hover:text-blue-600 transition-colors shrink-0">
                                                    {isSelected ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 flex-1">
                                    <p className="italic font-medium">No comments found for this lecture.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('add_reply_placeholder', 'Write a reply... (Press Enter to post)')}
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    onKeyDown={handleAddComment}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all pl-4 pr-12"
                                />
                                <button 
                                    onClick={handleAddComment}
                                    disabled={!newCommentText.trim()}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3758EE] hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Send Reply"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {commentToDelete && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-sans text-left">
                    <div className="bg-white w-full max-w-[450px] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-50 flex-shrink-0">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shadow-sm">
                                <Trash2 className="text-red-600 w-5 h-5" />
                            </div>
                            <h2 className="text-[22px] font-bold text-gray-800">Confirm Deletion</h2>
                        </div>
                        <div className="px-8 py-6 flex-1 text-gray-600 text-sm">
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </div>
                        <div className="px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50 flex-shrink-0 bg-white">
                            <button onClick={() => setCommentToDelete(null)} className="w-full sm:w-auto px-10 py-3 bg-[#F5F5F5] text-gray-600 rounded-[12px] font-bold text-sm hover:bg-gray-200 transition-all active:scale-95">
                                No, Cancel
                            </button>
                            <button onClick={confirmDeleteComment} className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-[#FF4E4E] to-[#E52222] text-white rounded-[12px] font-bold text-sm shadow-lg shadow-red-500/30 hover:opacity-90 transition-all active:scale-95">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
