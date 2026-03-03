import React, { useEffect, useState } from "react";
import Navbar from "@/components/layouts/NavBar";
import StatusTable from "@/components/ui/statusTable/StatusTable";
import Analytics from "@/features/StudentDashboard/components/Analytics";
import Sidebar from "@/components/layouts/SideBar";
import { useNavigate } from "react-router-dom";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import YouTube from "react-youtube";
import { getCourseById, getEnrolledCoursesByUserId } from "@/api/course";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";

const CourseView = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [userCourses, setUserCourses] = useState([]);
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const navigate = useNavigate();

    const firstName = localStorage.getItem("firstName");
    const courseId = new URLSearchParams(window.location.search).get("id");

    // Fetch enrolled courses list (for Analytics / StatusTable)
    useEffect(() => {
        const fetchUserCourses = async () => {
            try {
                const res = await getEnrolledCoursesByUserId();
                setUserCourses(res.data?.data || []);
            } catch (error) {
                console.log(error);
            }
        };
        fetchUserCourses();
    }, []);

    // Fetch specific course detail
    useEffect(() => {
        if (!courseId) return;
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const res = await getCourseById(courseId);
                const data = res.data.data;
                setCourseData(data);

                // Set the ongoing/first lecture as the playing lecture
                const startLecture = data.ongoingLecture || data.lecturePlaylist?.[0] || null;
                if (startLecture) setCurrentLecture(startLecture);

                // Seed notes from DB
                if (data.lectureNotes?.length > 0) {
                    setNotes(data.lectureNotes.map(n => ({
                        id: n._id,
                        timestamp: n.timestamp,
                        text: n.text,
                    })));
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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Helper to format time
    const formatTime = (seconds) => {
        if (!seconds) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Helper to extract YouTube video ID from URL (fallback if API doesn't return videoId)
    const extractYouTubeId = (url) => {
        if (!url) return null;
        const trimmed = url.trim();
        // Handle bare video ID (11 chars)
        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
        // Handle full YouTube URLs
        const match = trimmed.match(
            /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        return match ? match[1] : null;
    };

    // Build lectures list from API data
    // videoId comes directly from the backend (pre-extracted), fallback to client-side extraction
    const lectures = courseData?.lecturePlaylist?.map(l => ({
        id: l._id,
        title: l.title,
        lectureNo: l.lectureNo,
        date: l.date,
        videoId: l.videoId || extractYouTubeId(l.videoUrl),  // prefer backend-extracted ID
        isLocked: l.isLocked,
        isCompleted: l.isCompleted,
        videoUrl: l.videoUrl,
        audioUrl: l.audioUrl,
        pdfUrl: l.pdfUrl,
        status: l.status,
    })) || [];

    const [currentLecture, setCurrentLecture] = React.useState(null);
    const [progress, setProgress] = React.useState(0);
    const playerRef = React.useRef(null);
    const containerRef = React.useRef(null);

    // Player State
    const [isPlaying, setIsPlaying] = React.useState(false);
    // eslint-disable-next-line no-unused-vars
    const [isHovering, setIsHovering] = React.useState(false);
    // eslint-disable-next-line no-unused-vars
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [volume, setVolume] = React.useState(100);
    const [isMuted, setIsMuted] = React.useState(false);
    // eslint-disable-next-line no-unused-vars
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const onPlayerReady = (event) => {
        playerRef.current = event.target;
        setDuration(event.target.getDuration());
        setVolume(event.target.getVolume());
    };

    // eslint-disable-next-line no-unused-vars
    const onPlayerStateChange = (event) => {
        setIsPlaying(event.data === YouTube.PlayerState.PLAYING);
    };

    // eslint-disable-next-line no-unused-vars
    const togglePlay = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    // eslint-disable-next-line no-unused-vars
    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        playerRef.current.seekTo(time);
    };

    // eslint-disable-next-line no-unused-vars
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

    // eslint-disable-next-line no-unused-vars
    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        playerRef.current.setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    // eslint-disable-next-line no-unused-vars
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Check progress every second
    React.useEffect(() => {
        setProgress(0); // Reset progress when switching videos
        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                const currentTime = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();

                setCurrentTime(currentTime); // Update state for notes
                setDuration(duration);

                if (duration > 0) {
                    const percent = (currentTime / duration) * 100;
                    setProgress(percent);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentLecture]); // Re-bind when lecture changes

    // Seeded from API, user can add locally
    const [notes, setNotes] = React.useState([]);
    const [newNote, setNewNote] = React.useState("");

    const handleAddNote = (e) => {
        if (e.key === 'Enter' && newNote.trim()) {
            const timestamp = formatTime(currentTime);
            setNotes([...notes, { id: Date.now(), timestamp: timestamp, text: newNote }]);
            setNewNote("");
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
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative'>

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
                        fixed left-0 top-0 h-full lg:max-h-[800px] shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className="py-4 pr-2">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-[20px] min-[430px]:text-[24px] min-[641px]:text-3xl font-bold text-gray-900 mb-1">Aslam Alaikum {firstName} 👋🏻</h2>
                                    <p className="text-gray-500 text-[11px] min-[641px]:text-[16px]">Let's learn something new today!</p>
                                </div>
                                <GradiantButton onClick={() => navigate('/courses')} className="max-[600px]:hidden px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                    Enrolled New Course
                                </GradiantButton>
                                <GradiantButton onClick={() => navigate('/courses')} className="max-[600px]:block hidden text-[24px] px-4 py-1 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                    +
                                </GradiantButton>
                            </div>
                            <Analytics userCourses={userCourses} courseData={courseData} name="Overall Performance" />
                            <div className="relative flex flex-col lg:block gap-6 mt-5">
                                {/* Ongoing Lecture Section - Left Side */}
                                <div className="w-full lg:w-[70%] flex flex-col gap-4">
                                    <h3 className="text-xl font-bold text-gray-900">Ongoing Lecture</h3>
                                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 h-fit">
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group">
                                            {/* YouTube Iframe with controls visible */}
                                            {currentLecture?.videoId ? (
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
                                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                                    <p className="text-white/50 text-sm">No video available</p>
                                                </div>
                                            )}

                                            {/* Gradient Overlay for Text Visibility */}
                                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                                            {/* Progress Bar */}
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700/50 z-20">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300 ease-linear"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>

                                            {/* Lecture Info Overlay (Top Left) */}
                                            <div className="absolute top-2 left-3 sm:top-4 sm:left-6 text-white z-10 pointer-events-none transition-all duration-300">
                                                <h2 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 shadow-black/50 drop-shadow-md">{currentLecture?.title}</h2>
                                                <div className="text-xs sm:text-base font-medium opacity-90 shadow-black/50 drop-shadow-md">
                                                    <span>Lecture:{currentLecture?.lectureNo}</span>
                                                    <br />
                                                    <span>Date:{currentLecture?.date}</span>
                                                    <br />
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[10px] sm:text-xs font-bold ${progress > 75 ? 'bg-green-500/80' : 'bg-blue-600/80'} backdrop-blur-md`}>
                                                            {Math.round(progress)}% Watched
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side Action Buttons Overlay */}
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
                                                <button className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-white text-yellow-500 rounded-full hover:bg-yellow-50 transition-colors shadow-lg group/btn">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lectures Playlist Section - Right Side */}
                                <div className="w-full lg:w-[calc(30%-1.5rem)] flex flex-col gap-4 lg:absolute lg:top-0 lg:right-0 lg:bottom-0">
                                    <h3 className="text-xl font-bold text-gray-900">Lectures Playlist</h3>
                                    <div className="bg-white rounded-xl p-3 border border-gray-100 flex-1 overflow-x-auto lg:overflow-y-auto min-h-0 no-scrollbar">
                                        <div className="flex flex-row lg:flex-col gap-3">
                                            {lectures.map((lecture, index) => (
                                                <div
                                                    key={lecture.id}
                                                    onClick={() => !lecture.isLocked && setCurrentLecture(lecture)}
                                                    className={`
                                                    relative bg-white p-2 rounded-xl border transition-all cursor-pointer group shrink-0
                                                    w-[60vw] sm:w-[320px] lg:w-full
                                                    ${currentLecture?.id === lecture.id
                                                            ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                                                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                        }
                                                    ${lecture.isLocked ? 'opacity-70 cursor-not-allowed' : ''}
                                                `}
                                                >
                                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2">
                                                        <img
                                                            src={lecture.videoId ? `https://img.youtube.com/vi/${lecture.videoId}/maxresdefault.jpg` : `https://placehold.co/600x400/000000/FFF?text=${lecture.title}`}
                                                            alt={lecture.title}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        />

                                                        {/* Overlays */}
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                                                        {lecture.isLocked ? (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className={`absolute inset-0 flex items-center justify-center ${currentLecture?.id === lecture.id ? 'opacity-0' : 'opacity-100'}`}>
                                                                <div className="bg-white/90 p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="absolute top-2 right-2">
                                                            <img
                                                                src="https://randomuser.me/api/portraits/men/32.jpg"
                                                                alt="Instructor"
                                                                className="w-8 h-8 rounded-full border border-white shadow-sm"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="px-1">
                                                        <h4 className={`font-bold text-sm mb-1 ${currentLecture?.id === lecture.id ? 'text-blue-600' : 'text-gray-800'}`}>
                                                            {lecture.title}
                                                        </h4>
                                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                                            <span>Lecture:{lecture.lectureNo}</span>
                                                            <span>Date:{lecture.date}</span>
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
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-20">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Lecture Notes</h3>

                                <div className="flex flex-col gap-3 mb-6">
                                    {notes.map(note => (
                                        <div key={note.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <span className="font-mono text-sm font-semibold text-gray-600 mr-2">{note.timestamp} –</span>
                                            <span className="text-gray-700">{note.text}</span>
                                        </div>
                                    ))}
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

                            <StatusTable userCourses={userCourses} />
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
            </div>
        </div>
    );
};

export default CourseView;