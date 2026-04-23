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
import { Loader, GraduationCap, Trash2, Edit2, Check, X, Loader2, ChevronDown } from "lucide-react";
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
    const [editLectureData, setEditLectureData] = useState({
        id: "",
        title: "",
        type: "Lecture",
        videoUrl: "",
        audioUrl: "",
        pdfUrl: "",
    });

    // Refs
    const certCardRef = useRef(null);
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const lastReportedRef = useRef(0);
    const completedIdsRef = useRef(new Set());

    const courseId = new URLSearchParams(window.location.search).get("id");
    const targetLectureId = new URLSearchParams(window.location.search).get("lectureId");
    const isQuizView = currentLecture?.type === 'Quiz';

    // Effects
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
        id: l._id,
        title: l.title,
        lectureNo: l.lectureNo,
        date: l.date,
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
        const id = currentLecture?.id || currentLecture?._id;
        if (!id) return;
        setLoadingLecture(true);
        try {
            const res = await getLectureById(id);
            const data = res.data.data;
            setEditLectureData({
                id: data._id,
                title: data.title || '',
                type: data.type || 'Lecture',
                videoUrl: data.videoUrl || '',
                audioUrl: data.audioUrl || '',
                pdfUrl: data.pdfUrl || '',
            });
            setIsEditLectureModalOpen(true);
        } catch (err) {
            console.error("Failed to fetch lecture details:", err);
        } finally {
            setLoadingLecture(false);
        }
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
                            <div className="flex justify-between items-start mb-8 gap-4 w-full">
                                <div>
                                    <h2 className="text-[20px] min-[430px]:text-[24px] min-[641px]:text-3xl font-bold text-gray-900 mb-1">{courseData?.title}</h2>
                                    {user?.role !== 'admin' && (
                                        <p className="text-gray-500 text-[11px] min-[641px]:text-[16px]">Let's learn something new today!</p>
                                    )}
                                </div>
                                {user?.role === 'admin' ? (
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        <GradiantButton className="bg-[#6366F1] px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap flex-1 sm:flex-none">
                                            Download Certificate
                                        </GradiantButton>
                                        <GradiantButton
                                            onClick={handleEditLectureClick}
                                            disabled={loadingLecture}
                                            className="bg-[#8B5CF6] px-6 sm:px-8 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap flex-1 sm:flex-none"
                                        >
                                            {loadingLecture ? <Loader2 className="w-4 h-4 animate-spin" /> : "Edit"}
                                        </GradiantButton>
                                    </div>
                                ) : (
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

                            <div className={`relative flex flex-col lg:flex-row gap-6 mt-5 min-h-0`}>
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
                                                        // ✅ Always use current page as returnPath, ignore any passed returnPath
                                                        // This works for both cases:
                                                        // - from admin-course-play: window.location = /admin-course-play?id=...
                                                        // - from admin-course-view: window.location = /admin-course-view/69d3c9... (but this case
                                                        //   now goes directly to admin-course-play with returnPath set, so onStart runs on admin-course-play)
                                                        const currentPath = window.location.pathname + window.location.search;

                                                        // Remove the returnPath param from currentPath to avoid nesting
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
                                                    onClick={() => {
                                                        // If it's a placeholder but should be a quiz (perhaps type is Quiz but no videoId)
                                                        if (currentLecture?.type === 'Quiz') {
                                                            // Logic already handles rendering LectureQuizAssessment above, 
                                                            // but if we want "click anywhere" to show it even if videoId exists (unlikely)
                                                        }
                                                    }}
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
                                                    {/* Profile Icon */}
                                                    <img
                                                        src="https://randomuser.me/api/portraits/men/32.jpg"
                                                        alt="Instructor"
                                                        className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform"
                                                    />

                                                    {/* Action Buttons Stack */}
                                                    <button className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-lg group/btn">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
                                                    </button>
                                                    <button className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-white text-blue-500 rounded-full hover:bg-blue-50 transition-colors shadow-lg group/btn">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={handleEditLectureClick}
                                                        className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-white text-yellow-500 rounded-full hover:bg-yellow-50 transition-colors shadow-lg group/btn"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Lectures Playlist Section - Right Side - Only if not quiz */}
                                <div className="w-full lg:w-[30%] flex flex-col gap-4">
                                    <h3 className="text-xl font-bold text-gray-900">Lectures Playlist</h3>
                                    <div className="bg-white rounded-xl p-3 border border-gray-100 flex-1 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:max-h-[calc(100vh-350px)] sticky top-0 scroll-smooth snap-x">
                                        <div className="flex flex-row lg:flex-col gap-3">
                                            {lectures.map((lecture, index) => (
                                                <div
                                                    key={lecture.id}
                                                    onClick={() => !lecture.isLocked && setCurrentLecture(lecture)}
                                                    className={`
                                                    relative bg-white p-2 rounded-xl border transition-all cursor-pointer group shrink-0 snap-start
                                                    w-[75vw] sm:w-[320px] lg:w-full
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

                                                        {/* Overlays */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:bg-black/40 transition-colors" />

                                                        {/* Title & Info completely overlaying the graphic */}
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

                                                    {/* Active Indicator Strip */}
                                                    {currentLecture?.id === lecture.id && (
                                                        <div className="absolute right-0 top-4 bottom-4 w-1 bg-blue-600 rounded-l-full" />
                                                    )}

                                                    {/* Completion Checkmark */}
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
                                                                <button onClick={() => handleUpdateNote(note.id)} className="text-green-600 hover:text-green-700">
                                                                    <Check size={18} />
                                                                </button>
                                                                <button onClick={() => setEditingNoteId(null)} className="text-red-500 hover:text-red-600">
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleJumpToTime(note.videoTime)}>
                                                                <span className="font-mono text-sm font-semibold text-gray-600 mr-2">{note.timestamp} –</span>
                                                                <span className="text-gray-700">{note.text}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {editingNoteId !== note.id && (
                                                        <div className="flex gap-1 transition-opacity">
                                                            <button
                                                                onClick={() => startEditing(note)}
                                                                className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="Edit Note"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNote(note.id)}
                                                                className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Delete Note"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )) : (
                                                <p className="text-gray-400 text-sm italic">No notes added yet for this lecture.</p>
                                            )}
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyDown={handleAddNote}
                                            placeholder="Add New Notes (Press Enter to save)"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                                        />
                                    </div>
                                </div>
                            )}

                            {user?.role !== 'admin' && (
                                <LectureListTable
                                    lectures={lectures}
                                    notes={notes}
                                    onWatch={(lec) => setCurrentLecture({
                                        ...lec,
                                        id: lec.id || lec._id
                                    })}
                                    currentLectureId={currentLecture?.id || currentLecture?._id}
                                />
                            )}
                            {user?.role === 'admin' && <AdminLectureList lectures={lectures} onWatch={(lec) => setCurrentLecture(lec)} id={currentLecture?.id} />}
                        </div>
                    </main>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />
                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDeleteNote}
                    title="Delete Note"
                    message="Are you sure you want to delete this note? This action cannot be undone."
                    confirmText="Delete Note"
                    type="danger"
                    loading={isDeleting}
                />

                {/* Edit Lecture Modal */}
                {isEditLectureModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
                        <div className="bg-white w-full max-w-[720px] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
                            <div className="px-8 pt-8 pb-6 bg-white">
                                <div className="flex items-start gap-4 mb-1">
                                    <div className="w-10 h-10 bg-[#eff6ff] rounded-[14px] flex items-center justify-center flex-shrink-0">
                                        <div className="w-5.5 h-5.5 bg-[#4f46e5] rounded-[6px] flex items-center justify-center p-1 shadow-sm">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                <line x1="12" y1="22.08" x2="12" y2="12" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">Edit Lecture</h2>
                                        <p className="text-[#64748b] text-[13px] font-medium leading-relaxed">Update the details for this lecture.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8">
                                <div className="space-y-5">
                                    {/* Type */}
                                    <div>
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Select Type</label>
                                        <div className="relative group">
                                            <select
                                                value={editLectureData.type}
                                                onChange={e => setEditLectureData({ ...editLectureData, type: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-800 appearance-none shadow-sm cursor-pointer"
                                            >
                                                <option>Lecture</option>
                                                <option>Quiz</option>
                                                <option>Assignment</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Lecture Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter title"
                                            value={editLectureData.title}
                                            onChange={e => setEditLectureData({ ...editLectureData, title: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>

                                    {/* Video URL */}
                                    <div>
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Video URL <span className="text-gray-400 font-normal text-[11px]">(MP4 / MOV)</span></label>
                                        <input
                                            type="text"
                                            placeholder="https://example.com/lecture.mp4"
                                            value={editLectureData.videoUrl}
                                            onChange={e => setEditLectureData({ ...editLectureData, videoUrl: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>

                                    {/* Audio + PDF */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Audio URL <span className="text-gray-400 font-normal text-[11px]">(Optional)</span></label>
                                            <input
                                                type="text"
                                                placeholder="https://example.com/audio.mp3"
                                                value={editLectureData.audioUrl}
                                                onChange={e => setEditLectureData({ ...editLectureData, audioUrl: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Resource URL <span className="text-gray-400 font-normal text-[11px]">(Optional)</span></label>
                                            <input
                                                type="text"
                                                placeholder="https://example.com/resource.pdf"
                                                value={editLectureData.pdfUrl}
                                                onChange={e => setEditLectureData({ ...editLectureData, pdfUrl: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="mt-8 flex justify-between items-center bg-white gap-4">
                                    <button
                                        onClick={() => setIsEditLectureModalOpen(false)}
                                        className="px-12 py-3 bg-[#f3f4f6] text-[#0f172a] font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-sm text-[14px]"
                                    >
                                        Cancel
                                    </button>
                                    <GradiantButton
                                        onClick={handleSaveLecture}
                                        disabled={isSavingLecture}
                                        className="px-16 py-3 font-bold rounded-xl transition-all active:scale-95 shadow-sm text-[14px]"
                                    >
                                        {isSavingLecture ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                    </GradiantButton>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};

export default CourseView;