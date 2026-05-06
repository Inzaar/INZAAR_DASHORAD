import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layouts/NavBar";
import StatusTable from "@/components/ui/statusTable/StatusTable";
import Analytics from "@/features/StudentDashboard/components/Analytics";
import Sidebar from "@/components/layouts/SideBar";
import { useNavigate } from "react-router-dom";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import YouTube from "react-youtube";
import { getCourseById, getAdminCourseById, getEnrolledCoursesByUserId, updateLectureProgress, saveCertificate } from "@/api/course";
import { getLectureById, updateLecture } from "@/api/lecture";
import { useAuth } from "@/context/AuthContext";
import { Loader, GraduationCap, Trash2, Edit2, Check, X, Loader2, ChevronDown, Upload, FileText, Volume2 } from "lucide-react";
import CertificateCard from "../components/CertificateCard";
import AdminLectureList from "../components/AdminLectureList";
import LectureListTable from "../components/LectureListTable";
import LectureQuizAssessment from "../components/LectureQuizAssessment";
import QuizStartOverlay from "../components/QuizStartOverlay";
import { getLectureNotes, createLectureNote, updateLectureNote, deleteLectureNote } from "@/api/lectureNotes";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import fallbackImg from "@/assets/images/coursespage.jpg";

// Hoisted Helper Functions
const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const extractYouTubeId = (url) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
};

const CourseView = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Consolidate All State at the Top
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userCourses, setUserCourses] = useState([]);
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCongrats, setShowCongrats] = useState(false);
    const [certData, setCertData] = useState(null);
    const [generatingCert, setGeneratingCert] = useState(false);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showAudioMenu, setShowAudioMenu] = useState(false);
    const [showPdfMenu, setShowPdfMenu] = useState(false);

    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingText, setEditingText] = useState("");

    // Delete Confirmation Logic
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Lecture Logic
    const [isEditLectureModalOpen, setIsEditLectureModalOpen] = useState(false);
    const [isSavingLecture, setIsSavingLecture] = useState(false);
    const [loadingLecture, setLoadingLecture] = useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
    const [editLectureData, setEditLectureData] = useState({
        id: "",
        title: "",
        type: "Lecture",
        videoUrl: "",
        audioUrl: [],
        pdfUrl: [],
    });

    // Refs
    const certCardRef = useRef(null);
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const lastReportedRef = useRef(0);
    const completedIdsRef = useRef(new Set());
    const adminMenuRef = useRef(null);
    const audioInputRef = useRef(null);
    const pdfInputRef = useRef(null);

    const courseId = new URLSearchParams(window.location.search).get("id");
    const targetLectureId = new URLSearchParams(window.location.search).get("lectureId");
    const isQuizView = currentLecture?.type === 'Quiz';
    const canEdit = user?.role === 'admin' || (user?.role === 'moderator' && user?.assignedFeatures?.some(f => ['Courses Management', 'Course Management', 'Courses'].includes(f)));

    // Effects
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
                setIsAdminMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (user?.role === 'admin') return;
        const fetchUserCourses = async () => {
            try {
                const res = await getEnrolledCoursesByUserId();
                setUserCourses(res.data?.data || []);
            } catch (error) {
                console.log(error);
            }
        };
        fetchUserCourses();
    }, [user?.role]);

    useEffect(() => {
        if (!courseId) return;
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const res = user?.role === 'admin'
                    ? await getAdminCourseById(courseId)
                    : await getCourseById(courseId);
                const data = res.data.data;
                setCourseData(data);

                const rawLectures = data.lecturePlaylist || data.lectures || [];
                const normalizedLecs = rawLectures.map(l => ({
                    ...l,
                    id: l.id || l._id,
                    type: l.type || (l.status === 'Quiz' ? 'Quiz' : 'Lecture')
                }));
                const videoLecs = normalizedLecs.filter(l => l.type !== 'Quiz');
                const targetLec = targetLectureId ? normalizedLecs.find(l => l.id === targetLectureId) : null;
                const rawStart = targetLec || videoLecs[0] || data.ongoingLecture || normalizedLecs[0] || null;

                if (rawStart) {
                    setCurrentLecture({
                        ...rawStart,
                        id: rawStart.id || rawStart._id,
                        lastWatchedTime: rawStart.lastWatchedTime || 0,
                        type: rawStart.type || (rawStart.status === 'Quiz' ? 'Quiz' : 'Lecture')
                    });
                }
            } catch (error) {
                console.log(error);
                if (error.response?.status === 401) navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchCourse(courseId);
    }, [courseId]);

    useEffect(() => {
        const fetchAllNotes = async () => {
            if (!courseData || user?.role === 'admin') return;
            const lecs = courseData.lecturePlaylist || courseData.lectures || [];
            if (lecs.length === 0) return;

            try {
                // Fetch notes for all lectures to populate the table's "Comments" column
                const notesPromises = lecs.map(l => getLectureNotes(l.id || l._id));
                const results = await Promise.all(notesPromises);
                const allNotes = results.flatMap((res, idx) => res.data.data.map(n => ({
                    id: n._id,
                    lectureId: lecs[idx].id || lecs[idx]._id,
                    timestamp: formatTime(n.videoTime),
                    text: n.content,
                    videoTime: n.videoTime
                })));
                setNotes(allNotes);
            } catch (error) {
                console.error("Error fetching all notes:", error);
            }
        };
        fetchAllNotes();
    }, [courseData?.id, user?.role]);

    // Build lectures list from API data
    const rawLecturesList = courseData?.lecturePlaylist || courseData?.lectures || [];
    const lectures = rawLecturesList.map(l => ({
        id: l._id || l.id,
        title: l.title,
        lectureNo: l.lectureNo,
        date: l.date,
        watchedPercentage: l.watchedPercentage || (typeof l.progress === 'string' ? parseInt(l.progress) : (l.progress || 0)),
        videoId: l.videoId || extractYouTubeId(l.videoUrl),
        isLocked: user?.role === 'admin' ? false : l.isLocked,
        isCompleted: l.isCompleted,
        videoUrl: l.videoUrl,
        audioUrl: l.audioUrl,
        pdfUrl: l.pdfUrl,
        status: l.status,
        type: l.type || (l.status === 'Quiz' ? 'Quiz' : 'Lecture'),
        quizId: l.quizId || null,
    })) || [];

    // Player Handlers
    const onPlayerReady = (event) => {
        playerRef.current = event.target;
        setDuration(event.target.getDuration());
        setVolume(event.target.getVolume());
        if (currentLecture?.lastWatchedTime > 0) {
            event.target.seekTo(currentLecture.lastWatchedTime, true);
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const togglePlay = () => {
        if (playerRef.current) {
            if (isPlaying) playerRef.current.pauseVideo();
            else playerRef.current.playVideo();
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        playerRef.current.seekTo(time);
    };

    const toggleMute = () => {
        if (playerRef.current) {
            if (isMuted) {
                playerRef.current.unMute();
                setIsMuted(false);
            } else {
                playerRef.current.mute();
                setIsMuted(true);
            }
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        playerRef.current.setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        setProgress(0);
        lastReportedRef.current = 0;
        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                const cur = playerRef.current.getCurrentTime();
                const dur = playerRef.current.getDuration();
                setCurrentTime(cur);
                setDuration(dur);
                if (dur > 0) {
                    const percent = (cur / dur) * 100;
                    setProgress(percent);
                    const now = Date.now();
                    const lectureId = currentLecture?.id || currentLecture?._id;
                    if (user?.role !== 'admin' && lectureId && courseId && percent > 0 && now - lastReportedRef.current >= 1000) {
                        lastReportedRef.current = now;
                        updateLectureProgress(courseId, {
                            lectureId,
                            watchedPercentage: Math.min(Math.round(percent), 100),
                            lastWatchedTime: Math.floor(cur),
                        }).then(async (data) => {
                            const unlockPercent = courseData?.unlockCriteria || 100;
                            if (percent >= unlockPercent && !completedIdsRef.current.has(lectureId)) {
                                completedIdsRef.current.add(lectureId);
                                setCourseData(prev => {
                                    if (!prev) return prev;
                                    const idx = prev.lecturePlaylist.findIndex(l => l.id === lectureId || l._id === lectureId);
                                    return {
                                        ...prev,
                                        lecturePlaylist: prev.lecturePlaylist.map((l, i) => {
                                            if (l._id === lectureId || l.id === lectureId) return { ...l, isCompleted: true };
                                            if (i === idx + 1 && l.isLocked) return { ...l, isLocked: false, status: "Unlocked", action: "Watch Now" };
                                            return l;
                                        }),
                                    };
                                });
                            }
                            if (data?.certificateGenerated && !generatingCert) {
                                setGeneratingCert(true);
                                try {
                                    const { studentName, courseName, completedAt, templateUrl } = {
                                        studentName: `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Student',
                                        courseName: data.certificate?.courseTitle || courseData?.title || 'Course',
                                        completedAt: data.certificate?.completedAt,
                                        templateUrl: courseData?.certificateTemplate || null
                                    };
                                    setCertData({ studentName, courseName, completedAt, templateUrl });
                                    await new Promise(r => setTimeout(r, 300));
                                    const { toBlob } = await import('html-to-image');
                                    const blob = await toBlob(certCardRef.current, { pixelRatio: 2, cacheBust: true });
                                    if (blob) {
                                        const { uploadImage } = await import('@/api/course');
                                        const uploaded = await uploadImage(new File([blob], 'certificate.png', { type: 'image/png' }));
                                        await saveCertificate(courseId, uploaded.url);
                                        setCertData(prev => ({ ...prev, certUrl: uploaded.url }));
                                    }
                                } catch (e) {
                                    console.warn('Certificate generation/upload failed:', e);
                                } finally {
                                    setGeneratingCert(false);
                                    setShowCongrats(true);
                                }
                            }
                        }).catch(err => console.warn('Progress update failed:', err));
                    }
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [currentLecture]);

    // Note Handlers
    const handleAddNote = async (e) => {
        if (e.key === 'Enter' && newNote.trim()) {
            const lectureId = currentLecture?.id || currentLecture?._id;
            if (!lectureId) return;
            const time = Math.floor(currentTime);
            try {
                const res = await createLectureNote({ lectureId, content: newNote, videoTime: time });
                const saved = res.data.data;
                setNotes([...notes, {
                    id: saved._id,
                    lectureId: saved.lectureId, // Include lectureId for correct filtering
                    timestamp: formatTime(saved.videoTime),
                    text: saved.content,
                    videoTime: saved.videoTime
                }].sort((a, b) => a.videoTime - b.videoTime));
                setNewNote("");

            } catch (error) {
                console.error("Error saving note:", error);
            }
        }
    };

    const handleDeleteNote = (id) => {
        setNoteToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteNote = async () => {
        if (!noteToDelete) return;
        setIsDeleting(true);
        try {
            await deleteLectureNote(noteToDelete);
            setNotes(notes.filter(n => n.id !== noteToDelete));
            setIsDeleteDialogOpen(false);
            setNoteToDelete(null);
        } catch (error) {
            console.error("Error deleting note:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const startEditing = (note) => {
        setEditingNoteId(note.id);
        setEditingText(note.text);
    };

    const handleUpdateNote = async (id) => {
        if (!editingText.trim()) return;
        try {
            await updateLectureNote(id, { content: editingText });
            setNotes(notes.map(n => n.id === id ? { ...n, text: editingText } : n));
            setEditingNoteId(null);
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    const handleJumpToTime = (seconds) => {
        if (playerRef.current) playerRef.current.seekTo(seconds, true);
    };

    const handleEditLectureClick = async () => {
        if (!currentLecture || !canEdit) return;
        const id = currentLecture?.id || currentLecture?._id;
        if (!id) return;
        
        setEditLectureData({
            id: id,
            title: currentLecture.title || '',
            type: currentLecture.type || 'Lecture',
            videoUrl: currentLecture.videoUrl || '',
            audioUrl: Array.isArray(currentLecture.audioUrl) ? currentLecture.audioUrl : (currentLecture.audioUrl ? [currentLecture.audioUrl] : []),
            pdfUrl: Array.isArray(currentLecture.pdfUrl) ? currentLecture.pdfUrl : (currentLecture.pdfUrl ? [currentLecture.pdfUrl] : []),
        });
        setIsEditLectureModalOpen(true);
    };

    const handleSaveLecture = async () => {
        if (!editLectureData.title.trim()) return;
        setIsSavingLecture(true);
        try {
            const res = await updateLecture(editLectureData.id, editLectureData);
            const updated = res.data.data;

            // Sync with local courseData
            setCourseData(prev => {
                if (!prev) return prev;
                const field = prev.lecturePlaylist ? 'lecturePlaylist' : 'lectures';
                return {
                    ...prev,
                    [field]: prev[field].map(l => (l._id === updated._id || l.id === updated._id) ? { ...l, ...updated } : l)
                };
            });

            // Update current lecture view
            setCurrentLecture(prev => ({
                ...prev,
                ...updated,
                id: updated._id, // Ensure ID is consistent
                videoId: updated.videoUrl ? extractYouTubeId(updated.videoUrl) : prev.videoId
            }));

            setIsEditLectureModalOpen(false);
        } catch (err) {
            console.error("Failed to update lecture:", err);
        } finally {
            setIsSavingLecture(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
                <Loader className="w-10 h-10 text-[#3758EE] animate-spin mb-4" />
                <p className="text-[#6A6F78] font-medium animate-pulse">Loading course...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            {/* Off-screen certificate card — captured by html2canvas */}
            {certData && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1, background: '#ffffff', color: '#000000' }}>
                    <CertificateCard
                        ref={certCardRef}
                        studentName={certData.studentName}
                        courseName={certData.courseName}
                        completedAt={certData.completedAt}
                        templateUrl={certData.templateUrl}
                    />
                </div>
            )}

            {/* Congratulations Modal */}
            {showCongrats && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                        <p className="text-gray-500 mb-1">You have successfully completed</p>
                        <p className="font-semibold text-gray-800 mb-6 text-lg">{certData?.courseName}</p>
                        {generatingCert ? (
                            <div className="flex items-center justify-center gap-2 text-[#3758EE] mb-4">
                                <Loader className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Generating your certificate...</span>
                            </div>
                        ) : certData?.certUrl ? (
                            <a
                                href={certData.certUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block w-full py-3 px-6 bg-gradient-to-r from-[#A892FF] to-[#3758EE] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity mb-3"
                            >
                                🎓 View &amp; Download Certificate
                            </a>
                        ) : (
                            <p className="text-sm text-gray-400 mb-4">Certificate will be available on the Certificates page shortly.</p>
                        )}
                        <button
                            onClick={() => setShowCongrats(false)}
                            className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Continue Watching
                        </button>
                    </div>
                </div>
            )}
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-2 sm:gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className={`flex flex-col lg:flex-row px-2 sm:px-4 lg:px-6 xl:px-8 gap-4 flex-1 overflow-hidden relative`}>

                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`
                            transition-transform duration-300 ease-in-out z-40
                            lg:translate-x-0 lg:static lg:block
                            fixed left-0 top-0 shadow-2xl
                            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        `}
                    />

                    <main className={`flex-1 overflow-y-auto no-scrollbar scrollbar-hide`} style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className={`py-4 pr-2`}>
                            <div className="grid grid-cols-[1fr_auto] items-center gap-4 mb-8 w-full">
                                <div className="min-w-0">
                                    <h2 className="text-[26px] md:text-4xl font-extrabold text-gray-900 truncate leading-tight pr-2">{courseData?.title}</h2>
                                    {user?.role !== 'admin' && (
                                        <p className="text-gray-500 text-[11px] md:text-[16px]">Let's learn something new today!</p>
                                    )}
                                </div>

                                {/* Desktop Buttons */}
                                {user?.role === 'admin' && (
                                    <div className="hidden md:flex items-center gap-3">
                                        <GradiantButton className="bg-[#6366F1] px-6 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap">
                                            Download Certificate
                                        </GradiantButton>
                                        <GradiantButton
                                            onClick={handleEditLectureClick}
                                            disabled={loadingLecture}
                                            className="bg-[#8B5CF6] px-8 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                                        >
                                            {loadingLecture ? <Loader2 className="w-4 h-4 animate-spin" /> : "Edit"}
                                        </GradiantButton>
                                    </div>
                                )}

                                {/* Mobile Three-Dots for Admin */}
                                {user?.role === 'admin' && (
                                    <div className="md:hidden relative" ref={adminMenuRef}>
                                        <button
                                            onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                                            className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-600 active:scale-95"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                                        </button>

                                        {isAdminMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-[60] py-2 animate-in fade-in zoom-in-95 duration-200">
                                                <button
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#3758EE] transition-colors"
                                                    onClick={() => {
                                                        setIsAdminMenuOpen(false);
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6366F1]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                    Download Certificate
                                                </button>
                                                <button
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#3758EE] transition-colors"
                                                    onClick={() => {
                                                        handleEditLectureClick();
                                                        setIsAdminMenuOpen(false);
                                                    }}
                                                    disabled={loadingLecture}
                                                >
                                                    {loadingLecture ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6]" />
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B5CF6]"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                                    )}
                                                    Edit Lecture
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {user?.role !== 'admin' && (
                                    <div className="flex gap-2">
                                        <GradiantButton onClick={() => navigate('/courses')} className="max-[400px]:hidden px-4 sm:px-6 py-2 sm:py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 text-xs sm:text-base">
                                            Enrolled New Course
                                        </GradiantButton>
                                        <GradiantButton onClick={() => navigate('/courses')} className="max-[400px]:block hidden text-xl px-4 py-1 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                            +
                                        </GradiantButton>
                                    </div>
                                )}
                            </div>

                            <Analytics userCourses={userCourses} courseData={courseData} name="Overall Performance" />

                            <div className={`relative flex flex-col lg:flex-row gap-4 mt-5 items-stretch`}>
                                <div className={`w-full lg:w-[70%] flex flex-col gap-4`}>
                                    <h3 className="text-xl font-bold text-gray-900">Ongoing Lecture</h3>
                                    <div className={`${currentLecture?.type === 'Quiz' ? 'bg-transparent' : 'bg-white rounded-2xl p-2 shadow-sm border border-gray-100'} h-fit`}>
                                        <div className={`relative w-full overflow-hidden min-h-[300px] sm:min-h-0 aspect-video rounded-xl bg-black group`}>
                                            {/* YouTube Iframe or Quiz Assessment */}
                                            {currentLecture?.type === 'Quiz' ? (
                                                <QuizStartOverlay
                                                    lecture={currentLecture}
                                                    courseData={courseData}
                                                    onStart={() => {
                                                        const cleanParams = new URLSearchParams(window.location.search);
                                                        cleanParams.delete('returnPath');
                                                        cleanParams.delete('lectureId');
                                                        const cleanSearch = cleanParams.toString() ? '?' + cleanParams.toString() : '';
                                                        const cleanPath = window.location.pathname + cleanSearch;
                                                        const returnPath = encodeURIComponent(cleanPath);
                                                        const query = `?courseId=${courseId}&lectureId=${currentLecture.id}&returnPath=${returnPath}`;
                                                        if (currentLecture.quizId) {
                                                            navigate(`/quiz-take/${currentLecture.quizId}${query}`);
                                                        } else {
                                                            navigate(`/quiz-take/${currentLecture.id}${query}`);
                                                        }
                                                    }}
                                                />
                                            ) : currentLecture?.videoId ? (
                                                <YouTube
                                                    key={currentLecture.id}
                                                    videoId={currentLecture.videoId}
                                                    onReady={onPlayerReady}
                                                    opts={{
                                                        height: '100%',
                                                        width: '100%',
                                                        playerVars: {
                                                            autoplay: 0,
                                                            rel: 0,
                                                        },
                                                    }}
                                                    className="w-full h-full"
                                                    iframeClassName="w-full h-full object-cover sm:pointer-events-auto"
                                                />
                                            ) : (
                                                <div
                                                    className="w-full h-full flex items-center justify-center relative cursor-pointer"
                                                    onClick={() => { }}
                                                >
                                                    <img src={courseData?.thumbnail || fallbackImg} alt="Fallback" className="absolute inset-0 w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50"></div>
                                                    <div className="relative z-10 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer hover:scale-110 transition-transform">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Gradient Overlay for Text Visibility */}
                                            {!isQuizView && <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />}

                                            {/* Progress Bar */}
                                            {!isQuizView && user?.role !== 'admin' && (
                                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700/50 z-20">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-300 ease-linear"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            )}

                                            {/* Lecture Info Overlay (Top Left) */}
                                            {!isQuizView && (
                                                <div className="absolute top-2 left-3 sm:top-4 sm:left-6 text-white z-10 pointer-events-none transition-all duration-300 max-w-[70%]">
                                                    <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1 shadow-black/50 drop-shadow-md truncate">{currentLecture?.title}</h2>
                                                    <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-medium opacity-90 shadow-black/50 drop-shadow-md">
                                                        <span className="whitespace-nowrap">Lecture: {currentLecture?.lectureNo}</span>
                                                        <br className="sm:hidden" />
                                                        <span className="sm:inline-block sm:ml-2">Date: {currentLecture?.date}</span>
                                                        <br />
                                                        {user?.role !== 'admin' && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[9px] sm:text-[10px] md:text-xs font-bold ${progress > 75 ? 'bg-green-500/80' : 'bg-blue-600/80'} backdrop-blur-md`}>
                                                                    {Math.round(progress)}% Watched
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Right Side Action Buttons Overlay */}
                                            {!isQuizView && (
                                                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-2 sm:gap-3 z-20 transition-all duration-300">
                                                    <img
                                                        src="https://randomuser.me/api/portraits/men/32.jpg"
                                                        alt="Instructor"
                                                        className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform"
                                                    />
                                                    
                                                    {/* PDF Resource Button & Menu */}
                                                    <div className="relative">
                                                        <button 
                                                            onClick={() => { setShowPdfMenu(!showPdfMenu); setShowAudioMenu(false); }}
                                                            className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full transition-all shadow-lg group/btn ${showPdfMenu ? 'bg-red-500 text-white' : 'bg-white text-red-500 hover:bg-red-50'}`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
                                                        </button>
                                                        {showPdfMenu && currentLecture?.pdfUrl?.length > 0 && (
                                                            <div className="absolute right-full mr-3 top-0 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-right-2 duration-200 z-50">
                                                                <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PDF Resources</span>
                                                                </div>
                                                                {currentLecture.pdfUrl.map((url, i) => (
                                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                                                                        <FileText size={14} className="text-red-400" />
                                                                        <span className="truncate">Resource {i + 1}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Audio Resource Button & Menu */}
                                                    <div className="relative">
                                                        <button 
                                                            onClick={() => { setShowAudioMenu(!showAudioMenu); setShowPdfMenu(false); }}
                                                            className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full transition-all shadow-lg group/btn ${showAudioMenu ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-50'}`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                                                        </button>
                                                        {showAudioMenu && currentLecture?.audioUrl?.length > 0 && (
                                                            <div className="absolute right-full mr-3 top-0 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-right-2 duration-200 z-50">
                                                                <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Audio Files</span>
                                                                </div>
                                                                {currentLecture.audioUrl.map((url, i) => (
                                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                                        <Volume2 size={14} className="text-blue-400" />
                                                                        <span className="truncate">Audio {i + 1}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {canEdit && (
                                                        <button
                                                            onClick={handleEditLectureClick}
                                                            className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-white text-yellow-500 rounded-full hover:bg-yellow-50 transition-colors shadow-lg group/btn"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Lectures Playlist Section - Right Side - Only if not quiz */}
                                <div className="w-full lg:w-[30%] flex flex-col gap-2 sm:gap-4">
                                    <h3 className="text-xl font-bold text-gray-900">Lectures Playlist</h3>
                                    <div className="flex-1 relative lg:min-h-0">
                                        <div className="lg:absolute lg:inset-0 bg-white rounded-xl p-2 sm:p-3 border border-gray-100 overflow-x-auto lg:overflow-y-auto no-scrollbar scroll-smooth snap-x lg:snap-y">
                                            <div className="flex flex-row lg:flex-col gap-3 min-w-max lg:min-w-0">
                                                {lectures.map((lecture, index) => (
                                                    <div
                                                        key={lecture.id}
                                                        onClick={() => !lecture.isLocked && setCurrentLecture(lecture)}
                                                        className={`
                                                        relative bg-white p-2 rounded-xl border transition-all cursor-pointer group shrink-0 snap-start
                                                        w-[260px] sm:w-[280px] lg:w-full
                                                        ${currentLecture?.id === lecture.id
                                                                ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                                                                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                            }
                                                        ${lecture.isLocked ? 'opacity-70 cursor-not-allowed' : ''}
                                                        ${lecture.type === 'Quiz' ? 'border-dashed border-purple-300 bg-purple-50/10' : ''}
                                                    `}
                                                    >
                                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                                                            <img
                                                                src={lecture.videoId ? `https://img.youtube.com/vi/${lecture.videoId}/maxresdefault.jpg` : (courseData?.thumbnail || fallbackImg)}
                                                                alt={lecture.title}
                                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:bg-black/40 transition-colors" />
                                                            <div className="absolute top-0 left-0 p-3 w-full h-full text-white flex flex-col z-20 pointer-events-none">
                                                                <div className="flex justify-between items-start">
                                                                    <h4 className={`font-bold text-[14px] leading-tight mb-1 drop-shadow-md ${currentLecture?.id === lecture.id ? 'text-blue-300' : 'text-white'}`}>
                                                                        {lecture.title}
                                                                    </h4>
                                                                </div>
                                                                <div className="text-[10px] text-gray-200 drop-shadow-md mt-0.5 opacity-90">
                                                                    Lecture:{String(lecture.lectureNo).padStart(2, '0')}
                                                                </div>
                                                                <div className="text-[10px] text-gray-200 drop-shadow-md opacity-90">
                                                                    Date: {new Date(lecture.date || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                                                                </div>
                                                            </div>
                                                            {lecture.isLocked ? (
                                                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                                                    <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm mt-3">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                                                    </div>
                                                                </div>
                                                            ) : lecture.type === 'Quiz' ? (
                                                                <div className={`absolute inset-0 flex items-center justify-center z-10 ${currentLecture?.id === lecture.id ? 'opacity-0' : 'opacity-100'}`}>
                                                                    <div className="bg-purple-600/30 p-2.5 rounded-full backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform mt-3">
                                                                        <GraduationCap className="text-white w-5 h-5" />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className={`absolute inset-0 flex items-center justify-center z-10 ${currentLecture?.id === lecture.id ? 'opacity-0' : 'opacity-100'}`}>
                                                                    <div className="bg-white/30 p-2.5 rounded-full backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform mt-3">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2 right-2 z-20">
                                                                <img
                                                                    src="https://randomuser.me/api/portraits/men/32.jpg"
                                                                    alt="Instructor"
                                                                    className="w-7 h-7 rounded-full border-2 border-white shadow-md bg-white"
                                                                />
                                                            </div>
                                                        </div>
                                                        {currentLecture?.id === lecture.id && (
                                                            <div className="absolute right-0 top-4 bottom-4 w-1 bg-blue-600 rounded-l-full" />
                                                        )}
                                                        {lecture.isCompleted && currentLecture?.id !== lecture.id && (
                                                            <div className="absolute top-2 left-2 bg-green-500 rounded-full p-0.5 shadow-sm">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lecture Notes Section */}
                            {!isQuizView && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8 mb-8 text-left w-full">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Lecture Notes</h3>
                                    <div className="flex flex-col gap-3 mb-6">
                                        {notes.filter(n => n.lectureId === (currentLecture?.id || currentLecture?._id)).length > 0 ?
                                            notes.filter(n => n.lectureId === (currentLecture?.id || currentLecture?._id)).map(note => (
                                                <div key={note.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center group/note">
                                                    <div className="flex-1">
                                                        {editingNoteId === note.id ? (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    value={editingText}
                                                                    onChange={(e) => setEditingText(e.target.value)}
                                                                    className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                                                    autoFocus
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleUpdateNote(note.id);
                                                                        if (e.key === 'Escape') setEditingNoteId(null);
                                                                    }}
                                                                />
                                                                <button onClick={() => handleUpdateNote(note.id)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Check className="w-4 h-4" /></button>
                                                                <button onClick={() => setEditingNoteId(null)} className="text-gray-400 p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={() => handleJumpToTime(note.videoTime)} className="text-[#3758EE] font-mono text-xs bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors shrink-0">
                                                                    {note.timestamp}
                                                                </button>
                                                                <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity ml-4">
                                                        <button onClick={() => startEditing(note)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-gray-400 text-sm italic py-4">No notes added yet for this lecture.</p>
                                            )
                                        }
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Add a new note at this time..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyDown={handleAddNote}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all pl-12"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />
            </div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeleteNote}
                title="Delete Note"
                message="Are you sure you want to delete this note? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
            />

            {/* Edit Lecture Modal */}
            {isEditLectureModalOpen && canEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Edit Lecture Details</h3>
                            <button onClick={() => setIsEditLectureModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-6 overflow-y-auto no-scrollbar pr-2 flex-1">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[13px] font-bold text-gray-700 block mb-2 uppercase tracking-wider">Lecture Title</label>
                                    <input 
                                        type="text" 
                                        value={editLectureData.title} 
                                        onChange={e => setEditLectureData({ ...editLectureData, title: e.target.value })} 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[13px] font-bold text-gray-700 block mb-2 uppercase tracking-wider">Content Type</label>
                                    <div className="relative">
                                        <select 
                                            value={editLectureData.type} 
                                            onChange={e => setEditLectureData({ ...editLectureData, type: e.target.value })} 
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm appearance-none cursor-pointer"
                                        >
                                            <option value="Lecture">Lecture</option>
                                            <option value="Quiz">Quiz</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Video URL */}
                            <div>
                                <label className="text-[13px] font-bold text-gray-700 block mb-2 uppercase tracking-wider">Video URL <span className="text-gray-400 font-normal lowercase">(YouTube)</span></label>
                                <input 
                                    type="text" 
                                    value={editLectureData.videoUrl} 
                                    onChange={e => setEditLectureData({ ...editLectureData, videoUrl: e.target.value })} 
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" 
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>

                            {/* Multiple Resource Uploads */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Audios */}
                                <div className="space-y-4">
                                    <label className="text-[13px] font-bold text-gray-700 block uppercase tracking-wider">Audio Files</label>
                                    <div 
                                        onClick={() => audioInputRef.current?.click()}
                                        className="w-full h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                                    >
                                        {loadingLecture ? (
                                            <Loader2 size={24} className="text-blue-500 animate-spin" />
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-400 group-hover:text-blue-500" />
                                                <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-600">Add Audio</span>
                                            </>
                                        )}
                                        <input 
                                            ref={audioInputRef} 
                                            type="file" 
                                            accept="audio/*" 
                                            className="hidden" 
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const { uploadAudio } = await import('@/api/course');
                                                const res = await uploadAudio(file);
                                                setEditLectureData(prev => {
                                                    if (prev.audioUrl?.includes(res.url)) return prev;
                                                    return { ...prev, audioUrl: [...prev.audioUrl, res.url] };
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                                        {editLectureData.audioUrl.map((url, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium text-gray-600">
                                                <span className="truncate flex-1 pr-4">Audio {idx + 1}</span>
                                                <button onClick={() => setEditLectureData(prev => ({...prev, audioUrl: prev.audioUrl.filter((_, i) => i !== idx)}))} className="text-red-400 hover:text-red-600 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* PDFs */}
                                <div className="space-y-4">
                                    <label className="text-[13px] font-bold text-gray-700 block uppercase tracking-wider">PDF Resources</label>
                                    <div 
                                        onClick={() => pdfInputRef.current?.click()}
                                        className="w-full h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                                    >
                                        {loadingLecture ? (
                                            <Loader2 size={24} className="text-blue-500 animate-spin" />
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-400 group-hover:text-blue-500" />
                                                <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-600">Add PDF</span>
                                            </>
                                        )}
                                        <input 
                                            ref={pdfInputRef} 
                                            type="file" 
                                            accept="application/pdf" 
                                            className="hidden" 
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const { uploadPdf } = await import('@/api/course');
                                                const res = await uploadPdf(file);
                                                setEditLectureData(prev => {
                                                    if (prev.pdfUrl?.includes(res.url)) return prev;
                                                    return { ...prev, pdfUrl: [...prev.pdfUrl, res.url] };
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                                        {editLectureData.pdfUrl.map((url, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium text-gray-600">
                                                <span className="truncate flex-1 pr-4">PDF {idx + 1}</span>
                                                <button onClick={() => setEditLectureData(prev => ({...prev, pdfUrl: prev.pdfUrl.filter((_, i) => i !== idx)}))} className="text-red-400 hover:text-red-600 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-100">
                            <button 
                                onClick={() => setIsEditLectureModalOpen(false)} 
                                className="flex-1 py-2.5 sm:py-3 px-6 bg-gray-50 text-gray-500 text-sm sm:text-base font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <GradiantButton 
                                onClick={handleSaveLecture} 
                                disabled={isSavingLecture} 
                                className="flex-[1.5] sm:flex-[2] py-2.5 sm:py-3 px-4 sm:px-6 font-bold rounded-xl shadow-lg shadow-blue-500/20 text-sm sm:text-base whitespace-nowrap"
                            >
                                {isSavingLecture ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> 
                                        <span>Saving...</span>
                                    </div>
                                ) : "Save Changes"}
                            </GradiantButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseView;