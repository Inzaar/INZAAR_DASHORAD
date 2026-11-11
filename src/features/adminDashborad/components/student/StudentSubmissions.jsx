
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getUserSubmissions, gradeSubmission, grantExtraAttempt, extendSubmissionDueDate } from '@/api/user';
import toast from 'react-hot-toast';
import { PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis, PaginationLink } from '@/components/ui/Pagination';

const StudentSubmissions = ({ profileData }) => {
    const enrolledCourses = profileData?.enrolledCourses || [];
    const [selectedCourse, setSelectedCourse] = useState('All Courses');
    const [selectedCourseId, setSelectedCourseId] = useState('all');

    const [typeFilter, setTypeFilter] = useState('All Types');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [searchQuery, setSearchQuery] = useState('');
    const [submissionsData, setSubmissionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!profileData?.user?._id) return;
            try {
                setLoading(true);
                const res = await getUserSubmissions(profileData.user._id);
                if (res?.data?.submissions) {
                    setSubmissionsData(res.data.submissions);
                }
            } catch (error) {
                toast.error("Failed to fetch submissions");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [profileData]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Graded': return 'bg-[#DCFCE7] text-[#16A34A]';
            case 'Pending': return 'bg-[#FEF3C7] text-[#D97706]';
            case 'Late': return 'bg-[#FEE2E2] text-[#EF4444]';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'Assignment': return 'bg-[#F4F1FF] text-[#A855F7]';
            case 'Quiz': return 'bg-[#EFF6FF] text-[#3B82F6]';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [scoreInput, setScoreInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const submissionIdParam = searchParams.get('submissionId');

    // Auto-select submission if submissionId is in search params (deep linked from notification)
    useEffect(() => {
        if (submissionIdParam && submissionsData.length > 0 && !selectedSubmission) {
            for (const courseData of submissionsData) {
                const found = courseData.submissions?.find(
                    s => s.id === submissionIdParam || s.submissionId === submissionIdParam || s.assignmentId === submissionIdParam
                );
                if (found) {
                    handleView(found);
                    break;
                }
            }
        }
    }, [submissionIdParam, submissionsData]);

    const studentFullName = React.useMemo(() => {
        const first = profileData?.user?.firstname || profileData?.user?.firstName || '';
        const last = profileData?.user?.lastname || profileData?.user?.lastName || '';
        const full = `${first} ${last}`.trim();
        if (full) return full;
        return profileData?.user?.username || profileData?.user?.name || 'Student';
    }, [profileData]);

    const studentAvatarUrl = profileData?.user?.profileImageUrl || profileData?.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentFullName)}&background=random`;

    const handleView = (sub) => {
        setSelectedSubmission(sub);
        setScoreInput(sub.rawScore !== undefined ? sub.rawScore : '');
        setFeedbackInput(sub.feedback || '');
    };

    const handleBack = () => {
        setSelectedSubmission(null);
    };

    const handleGrantAttempt = async (increment = 1) => {
        if (!selectedSubmission || !profileData?.user?._id) return;
        try {
            setActionLoading(true);
            const subId = selectedSubmission.submissionId || selectedSubmission.id;
            await grantExtraAttempt(profileData.user._id, subId, { increment });
            toast.success(`Granted +${increment} attempt to student!`);

            // Refetch submissions
            const res = await getUserSubmissions(profileData.user._id);
            if (res?.data?.submissions) {
                setSubmissionsData(res.data.submissions);
                for (const c of res.data.submissions) {
                    const found = c.submissions?.find(s => s.id === selectedSubmission.id || s.submissionId === subId);
                    if (found) {
                        setSelectedSubmission(found);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error("Failed to grant attempt", error);
            toast.error(error?.response?.data?.message || "Failed to grant extra attempt");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExtendDueDate = async ({ days, extendedDueDate, allowLateSubmission }) => {
        if (!selectedSubmission || !profileData?.user?._id) return;
        try {
            setActionLoading(true);
            const subId = selectedSubmission.submissionId || selectedSubmission.id;
            await extendSubmissionDueDate(profileData.user._id, subId, {
                days,
                extendedDueDate,
                allowLateSubmission
            });
            toast.success("Submission due date policy updated!");

            // Refetch submissions
            const res = await getUserSubmissions(profileData.user._id);
            if (res?.data?.submissions) {
                setSubmissionsData(res.data.submissions);
                for (const c of res.data.submissions) {
                    const found = c.submissions?.find(s => s.id === selectedSubmission.id || s.submissionId === subId);
                    if (found) {
                        setSelectedSubmission(found);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error("Failed to update due date", error);
            toast.error(error?.response?.data?.message || "Failed to extend due date");
        } finally {
            setActionLoading(false);
        }
    };

    const handleGradeSubmit = async () => {
        if (!selectedSubmission || selectedSubmission.type !== 'Assignment') return;

        try {
            setIsSubmitting(true);
            const scoreValue = scoreInput ? Number(scoreInput) : null;
            await gradeSubmission(profileData.user._id, selectedSubmission.id, {
                score: scoreValue,
                totalScore: 100,
                feedback: feedbackInput,
                status: 'Graded'
            });

            toast.success("Grade submitted successfully");

            // Refetch submissions to update table and state
            const res = await getUserSubmissions(profileData.user._id);
            if (res?.data?.submissions) {
                setSubmissionsData(res.data.submissions);

                // Update currently viewed submission if it's still open
                let updatedSub = null;
                for (const c of res.data.submissions) {
                    const found = c.submissions?.find(s => s.id === selectedSubmission.id);
                    if (found) {
                        updatedSub = found;
                        break;
                    }
                }
                if (updatedSub) {
                    setSelectedSubmission(updatedSub);
                }
            }
        } catch (error) {
            toast.error("Failed to submit grade");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const coursesList = React.useMemo(() => {
        const list = [];
        const seenTitles = new Set();
        
        // 1. From enrolledCourses
        (enrolledCourses || []).forEach(c => {
            const rawTitle = (c.title || '').trim();
            if (rawTitle && !seenTitles.has(rawTitle.toLowerCase())) {
                seenTitles.add(rawTitle.toLowerCase());
                list.push({
                    courseId: c.courseId || c.id,
                    id: c.id || c.courseId,
                    title: rawTitle
                });
            }
        });

        // 2. From submissionsData
        (submissionsData || []).forEach(s => {
            const rawTitle = (s.courseTitle || s.fullTitle || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
            if (rawTitle && !seenTitles.has(rawTitle.toLowerCase())) {
                seenTitles.add(rawTitle.toLowerCase());
                list.push({
                    courseId: s.courseId || s.realCourseId || s.enrollmentId,
                    id: s.enrollmentId || s.courseId,
                    title: rawTitle
                });
            }
        });

        return list;
    }, [enrolledCourses, submissionsData]);

    // Filter submissions based on course, type, status, and search query
    let filteredSubmissions = [];
    if (selectedCourseId === 'all' || selectedCourse === 'All Courses') {
        submissionsData.forEach(courseData => {
            filteredSubmissions = [...filteredSubmissions, ...(courseData.submissions || [])];
        });
    } else {
        const targetTitle = selectedCourse.trim().toLowerCase();
        const targetId = String(selectedCourseId);

        submissionsData.forEach(courseData => {
            const courseDataTitle = (courseData.courseTitle || '').trim().toLowerCase();
            const courseDataFullTitle = (courseData.fullTitle || '').trim().toLowerCase();

            const isTitleMatch = courseDataTitle === targetTitle ||
                (courseDataFullTitle && courseDataFullTitle.includes(targetTitle)) ||
                targetTitle.includes(courseDataTitle);

            const isIdMatch = (courseData.courseId && String(courseData.courseId) === targetId) ||
                (courseData.realCourseId && String(courseData.realCourseId) === targetId) ||
                (courseData.enrollmentId && String(courseData.enrollmentId) === targetId) ||
                (courseData.id && String(courseData.id) === targetId);

            if (isIdMatch || isTitleMatch) {
                filteredSubmissions = [...filteredSubmissions, ...(courseData.submissions || [])];
            } else if (courseData.submissions && courseData.submissions.length > 0) {
                const matchedSubs = courseData.submissions.filter(sub => {
                    const subTitle = (sub.courseTitle || '').trim().toLowerCase();
                    return (sub.courseId && String(sub.courseId) === targetId) ||
                        (sub.enrollmentId && String(sub.enrollmentId) === targetId) ||
                        (subTitle && (subTitle === targetTitle || targetTitle.includes(subTitle)));
                });
                filteredSubmissions = [...filteredSubmissions, ...matchedSubs];
            }
        });
    }

    filteredSubmissions = filteredSubmissions.filter(sub => {
        let match = true;
        if (typeFilter !== 'All Types' && sub.type !== typeFilter) match = false;
        if (statusFilter !== 'All Status' && sub.status !== statusFilter) match = false;
        if (searchQuery && !sub.title.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
        return match;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCourseId, typeFilter, statusFilter, searchQuery]);

    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        const blockSize = 4;
        const currentBlock = Math.ceil(currentPage / blockSize);
        const start = (currentBlock - 1) * blockSize + 1;
        const end = Math.min(start + blockSize - 1, totalPages);

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('ellipsis-start');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('ellipsis-end');
            pages.push(totalPages);
        }

        return pages;
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
            {/* Top Course Selector */}
            <div className="flex flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {selectedSubmission && (
                        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <FiChevronLeft size={20} />
                        </button>
                    )}
                    <h2 className="text-[18px] sm:text-[22px] font-bold text-gray-800 truncate">
                        {selectedCourse}
                    </h2>
                </div>
                <div className="relative shrink-0" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 bg-[#059669] text-white px-4 py-2.5 rounded-[4px] text-sm font-medium hover:bg-[#047857] transition-colors shadow-sm"
                    >
                        {selectedCourse} <FiChevronDown size={16} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto bg-white rounded-md shadow-lg z-10 border border-gray-100 py-1">
                            <button
                                onClick={() => {
                                    setSelectedCourse('All Courses');
                                    setSelectedCourseId('all');
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                All Courses
                            </button>
                            {coursesList.map((course, idx) => (
                                <button
                                    key={course.courseId || course.id || idx}
                                    onClick={() => {
                                        setSelectedCourse(course.title);
                                        setSelectedCourseId(course.courseId || course.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 truncate"
                                >
                                    {course.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {!selectedSubmission ? (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-5 md:p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Student Submissions</h3>
                        <p className="text-sm text-gray-400 font-medium">View and grade submitted assignments and quizzes</p>

                        {/* Filters & Search */}
                        <div className="flex flex-col md:flex-row gap-4 mt-6">
                            <div className="relative">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="appearance-none w-full md:w-36 px-4 py-2 bg-white border border-gray-100 rounded-md text-[13px] text-gray-600 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/20 pr-10 cursor-pointer shadow-sm"
                                >
                                    <option>All Types</option>
                                    <option>Assignment</option>
                                    <option>Quiz</option>
                                </select>
                                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>

                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none w-full md:w-36 px-4 py-2 bg-white border border-gray-100 rounded-md text-[13px] text-gray-600 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/20 pr-10 cursor-pointer shadow-sm"
                                >
                                    <option>All Status</option>
                                    <option>Graded</option>
                                    <option>Pending</option>
                                    <option>Late</option>
                                </select>
                                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>

                            <div className="relative flex-1 max-w-sm">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search by student or title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-md text-[13px] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FCFCFD] border-b border-gray-100">
                                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-32">Type</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">Submitted Date</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-32">Score/Marks</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-32">Status</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-32 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-500 font-medium">Loading submissions...</td>
                                    </tr>
                                ) : filteredSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-500 font-medium">No submissions found.</td>
                                    </tr>
                                ) : paginatedSubmissions.map((sub, index) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6 text-sm text-gray-500 font-medium">{startIndex + index + 1}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-[10px] font-bold ${getTypeStyle(sub.type)}`}>
                                                {sub.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{sub.title}</td>
                                        <td className="py-4 px-6 text-[13px] text-gray-500 font-medium">{sub.date}</td>
                                        <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{sub.score}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-[10px] font-bold ${getStatusStyle(sub.status)}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center min-w-[80px]">
                                                {sub.action === 'View' ? (
                                                    <button onClick={() => handleView(sub)} className="px-5 py-1.5 border border-[#3B82F6]/30 text-[#3B82F6] bg-white hover:bg-blue-50 rounded-[4px] text-[12px] font-bold transition-colors shadow-sm w-full max-w-[80px]">
                                                        View
                                                    </button>
                                                ) : sub.action === 'Grade Now' ? (
                                                    <button onClick={() => handleView(sub)} className="text-[11px] font-bold text-gray-300 hover:text-gray-400 transition-colors">
                                                        Grade Now
                                                    </button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[12px] text-gray-400 font-medium">
                                Showing {filteredSubmissions.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
                            </p>
                            <PaginationContent className="w-full sm:w-auto h-10 flex items-center justify-center sm:justify-end">
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                                {getPageNumbers().map((page, index) => (
                                    <PaginationItem key={index}>
                                        {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                                            <PaginationEllipsis
                                                onClick={() => {
                                                    const blockSize = 4;
                                                    const currentBlock = Math.ceil(currentPage / blockSize);
                                                    if (page === 'ellipsis-start') {
                                                        handlePageChange((currentBlock - 2) * blockSize + 1);
                                                    } else {
                                                        handlePageChange(currentBlock * blockSize + 1);
                                                    }
                                                }}
                                                className="cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
                                            />
                                        ) : (
                                            <PaginationLink
                                                onClick={() => handlePageChange(page)}
                                                isActive={page === currentPage}
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages || totalPages === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">

                    {/* User Info Card */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-start w-full">
                            <div className="flex items-center gap-4">
                                <img
                                    src={studentAvatarUrl}
                                    alt={studentFullName}
                                    className="w-14 h-14 rounded-full object-cover"
                                />
                                <div className="flex flex-col">
                                    <h3 className="text-[17px] font-bold text-gray-800">{studentFullName}</h3>
                                    <p className="text-[13px] text-gray-500 font-medium mt-0.5">Course: {selectedSubmission.courseTitle || (selectedCourse !== 'All Courses' ? selectedCourse : 'N/A')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-[4px] text-[11px] font-bold ${getTypeStyle(selectedSubmission.type)}`}>
                                    {selectedSubmission.type}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-[4px] text-[11px] font-bold ${getStatusStyle(selectedSubmission.status)}`}>
                                    {selectedSubmission.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-2 ml-18">
                            <p className="text-[13px] text-gray-500 font-medium">Title: <span className="text-gray-800 font-bold ml-1">{selectedSubmission.title}</span></p>
                            <p className="text-[13px] text-gray-500 font-medium">Submitted: <span className="text-gray-800 font-bold ml-1">{selectedSubmission.date}</span></p>
                        </div>
                    </div>

                    {/* Student Exception Request Card */}
                    {selectedSubmission.extensionRequest?.hasRequested && selectedSubmission.extensionRequest?.status === 'pending' && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                                        🔔
                                    </span>
                                    <h4 className="text-sm font-bold text-amber-900">
                                        Student Exception Request ({selectedSubmission.extensionRequest.requestType === 'both' ? 'Extra Attempt & Due Date Extension' : (selectedSubmission.extensionRequest.requestType === 'due_date' ? 'Due Date Extension' : 'Extra Attempt')})
                                    </h4>
                                </div>
                                <span className="text-[11px] font-medium text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                                    Pending Review
                                </span>
                            </div>

                            <p className="text-xs text-amber-950 font-medium bg-white/80 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
                                "{selectedSubmission.extensionRequest.message || 'No additional explanation provided.'}"
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <span className="text-[11px] text-amber-700">
                                    Requested: {new Date(selectedSubmission.extensionRequest.requestedAt).toLocaleString()}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => handleGrantAttempt(1)}
                                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-[4px] text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        Grant +1 Attempt
                                    </button>
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => handleExtendDueDate({ days: 3 })}
                                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[4px] text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        Extend +3 Days
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submission Content Card */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-5">
                        <h3 className="text-[16px] font-bold text-gray-800">Submission Content</h3>

                        <div className="bg-[#F8F9FA] rounded-lg p-5 text-[13px] text-gray-700 leading-relaxed font-medium">
                            <p className="mb-4">{selectedSubmission.submissionContent || "No detailed submission content provided."}</p>
                        </div>

                        {selectedSubmission.type === 'Assignment' && selectedSubmission.fileUrl && (
                            <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 w-max pr-12">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                </div>
                                <div className="flex flex-col">
                                    <a href={selectedSubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-blue-600 hover:underline">
                                        {selectedSubmission.fileName || "Download Attachment"}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Attempts & Submission Policy Exceptions Card */}
                    {selectedSubmission.type === 'Assignment' && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-5">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <h3 className="text-[15px] font-bold text-gray-800">Attempts & Deadline Exceptions</h3>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-gray-500 font-medium">
                                        Attempts Used: <strong className="text-gray-800">{selectedSubmission.attemptCount || 0} / {selectedSubmission.maxAttempts || 3}</strong>
                                    </span>
                                    {selectedSubmission.extraAttempts > 0 && (
                                        <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[11px]">
                                            +{selectedSubmission.extraAttempts} extra granted
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Attempt Controls */}
                                <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-100 flex flex-col justify-between gap-3">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Grant Extra Attempts
                                        </h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Grant additional submission attempts so the student can re-upload their assignment file.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => handleGrantAttempt(1)}
                                            className="px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-[4px] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            + Grant 1 Attempt
                                        </button>
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => handleGrantAttempt(2)}
                                            className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-[4px] text-xs font-semibold transition-all disabled:opacity-50"
                                        >
                                            +2
                                        </button>
                                    </div>
                                </div>

                                {/* Due Date Controls */}
                                <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-100 flex flex-col justify-between gap-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Extend Due Date
                                            </h4>
                                            {selectedSubmission.extendedDueDate && (
                                                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                    Extended: {new Date(selectedSubmission.extendedDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Extend the deadline for this student or toggle late submission permission.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => handleExtendDueDate({ days: 3 })}
                                            className="px-3 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-[4px] text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                                        >
                                            +3 Days
                                        </button>
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => handleExtendDueDate({ days: 7 })}
                                            className="px-3 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-[4px] text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                                        >
                                            +7 Days
                                        </button>
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => handleExtendDueDate({ allowLateSubmission: !selectedSubmission.allowLateSubmission })}
                                            className={`px-3 py-2 rounded-[4px] text-xs font-bold transition-all border shadow-sm disabled:opacity-50 ${
                                                selectedSubmission.allowLateSubmission
                                                    ? 'bg-green-50 text-green-700 border-green-300'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {selectedSubmission.allowLateSubmission ? '✓ Late Allowed' : 'Allow Late'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grading Card (Only for Assignments) */}
                    {selectedSubmission.type === 'Assignment' && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6">
                            <h3 className="text-[16px] font-bold text-gray-800">Grading</h3>

                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-800">Score / Marks</label>
                                <input
                                    type="number"
                                    placeholder="— / 100"
                                    value={scoreInput}
                                    onChange={(e) => setScoreInput(e.target.value)}
                                    className="w-40 px-4 py-2.5 bg-[#F8F9FA] border border-gray-100 rounded-md text-[13px] font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-800">Feedback to Student</label>
                                <textarea
                                    placeholder="Enter your feedback here..."
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-lg text-[13px] text-gray-700 font-medium resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                                ></textarea>
                            </div>

                            <div className="flex justify-end items-center gap-4 mt-2">
                                <button className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-[4px] text-[13px] font-bold transition-colors shadow-sm">
                                    Save as Draft
                                </button>
                                <button
                                    onClick={handleGradeSubmit}
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-[4px] text-[13px] font-bold transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Grade'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default StudentSubmissions;
