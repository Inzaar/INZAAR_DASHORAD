import React from "react";
import Navbar from "@/components/layouts/NavBar";
import StatusTable from "@/components/ui/statusTable/StatusTable";
import Analytics from "@/features/StudentDashboard/components/Analytics";
import Sidebar from "@/components/layouts/SideBar";
import { useNavigate } from "react-router-dom";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import YouTube from "react-youtube";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from "react-icons/fa";

const CourseView = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const progressPercentage = 40;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const navigate = useNavigate();




    // Helper to format time
    const formatTime = (seconds) => {
        if (!seconds) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Initial Static Data
    const initialLectures = [
        {
            id: 1,
            title: "Quran Recitation",
            lectureNo: "03",
            date: "10-Jan-2025",
            videoId: "jNQXAC9IVRw",
            isLocked: false,
        },
        {
            id: 2,
            title: "Tajweed Basics",
            lectureNo: "04",
            date: "12-Jan-2025",
            videoId: "7iy8iB8tu5c",
            isLocked: false,
        },
        {
            id: 3,
            title: "Understanding Salah",
            lectureNo: "05",
            date: "14-Jan-2025",
            videoId: "_oTgwjM6mBU",
            isLocked: true,
        },
        {
            id: 2,
            title: "Tajweed Basics",
            lectureNo: "04",
            date: "12-Jan-2025",
            videoId: "7iy8iB8tu5c",
            isLocked: false,
        },
        {
            id: 5,
            title: "Hadith Studies",
            lectureNo: "07",
            date: "18-Jan-2025",
            videoId: "dummy5",
            isLocked: true,
        },
        {
            id: 6,
            title: "Fiqh of Worship",
            lectureNo: "08",
            date: "20-Jan-2025",
            videoId: "dummy6",
            isLocked: true,
        },
        {
            id: 7,
            title: "Islamic History",
            lectureNo: "09",
            date: "22-Jan-2025",
            videoId: "dummy7",
            isLocked: true,
        },
    ];

    const [lectures, setLectures] = React.useState(initialLectures);
    const [currentLecture, setCurrentLecture] = React.useState(initialLectures[0]);
    const [progress, setProgress] = React.useState(0);
    const playerRef = React.useRef(null);
    const containerRef = React.useRef(null);

    // Player State
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isHovering, setIsHovering] = React.useState(false);
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [volume, setVolume] = React.useState(100);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const onPlayerReady = (event) => {
        playerRef.current = event.target;
        setDuration(event.target.getDuration());
        setVolume(event.target.getVolume());
    };

    const onPlayerStateChange = (event) => {
        setIsPlaying(event.data === YouTube.PlayerState.PLAYING);
    };

    const togglePlay = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
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

                    // Unlock next video if progress > 75%
                    if (percent > 75) {
                        unlockNextLecture();
                    }
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentLecture]); // Re-bind when lecture changes

    const unlockNextLecture = () => {
        const currentIndex = lectures.findIndex(l => l.id === currentLecture.id);
        if (currentIndex !== -1 && currentIndex < lectures.length - 1) {
            const nextLecture = lectures[currentIndex + 1];
            if (nextLecture.isLocked) {
                setLectures(prevLectures => {
                    const newLectures = [...prevLectures];
                    newLectures[currentIndex + 1] = { ...nextLecture, isLocked: false };
                    return newLectures;
                });
            }
        }
    };

    // Dummy Data for Notes
    const [notes, setNotes] = React.useState([
        { id: 1, timestamp: "00:00:45", text: 'Clear explanation of "Makharij".' },
        { id: 2, timestamp: "00:02:10", text: 'First 2 minutes are very important, must remember next time.' },
    ]);
    const [newNote, setNewNote] = React.useState("");

    const handleAddNote = (e) => {
        if (e.key === 'Enter' && newNote.trim()) {
            const timestamp = formatTime(currentTime);
            setNotes([...notes, { id: Date.now(), timestamp: timestamp, text: newNote }]);
            setNewNote("");
        }
    };

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
                                    <h2 className="text-[20px] min-[430px]:text-[24px] min-[641px]:text-3xl font-bold text-gray-900 mb-1">Aslam Alaikum Zain 👋🏻</h2>
                                    <p className="text-gray-500 text-[11px] min-[641px]:text-[16px]">Let's learn something new today!</p>
                                </div>
                                <GradiantButton onClick={() => navigate('/courses')} className="max-[600px]:hidden px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                    Enrolled New Course
                                </GradiantButton>
                                <GradiantButton onClick={() => navigate('/courses')} className="max-[600px]:block hidden text-[24px] px-4 py-1 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                    +
                                </GradiantButton>
                            </div>
                            <Analytics />
                            <div className="relative flex flex-col lg:block gap-6 mt-5">
                                {/* Ongoing Lecture Section - Left Side */}
                                <div className="w-full lg:w-[70%] flex flex-col gap-4">
                                    <h3 className="text-xl font-bold text-gray-900">Ongoing Lecture</h3>
                                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 h-fit">
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group">
                                            {/* YouTube Iframe with controls visible */}
                                            <YouTube
                                                key={currentLecture.videoId}
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
                                            {/* Lecture Info Overlay (Top Left) */}
                                            <div className="absolute top-2 left-3 sm:top-4 sm:left-6 text-white z-10 pointer-events-none transition-all duration-300">
                                                <h2 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 shadow-black/50 drop-shadow-md">{currentLecture.title}</h2>
                                                <div className="text-xs sm:text-base font-medium opacity-90 shadow-black/50 drop-shadow-md">
                                                    <span>Lecture:{currentLecture.lectureNo}</span>
                                                    <br />
                                                    <span>Date:{currentLecture.date}</span>
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
                                                    ${currentLecture.id === lecture.id
                                                            ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                                                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                        }
                                                    ${lecture.isLocked ? 'opacity-70 cursor-not-allowed' : ''}
                                                `}
                                                >
                                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2">
                                                        <img
                                                            src={lecture.videoId.startsWith("dummy") ? `https://placehold.co/600x400/000000/FFF?text=${lecture.title}` : `https://img.youtube.com/vi/${lecture.videoId}/maxresdefault.jpg`}
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
                                                            <div className={`absolute inset-0 flex items-center justify-center ${currentLecture.id === lecture.id ? 'opacity-0' : 'opacity-100'}`}>
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
                                                        <h4 className={`font-bold text-sm mb-1 ${currentLecture.id === lecture.id ? 'text-blue-600' : 'text-gray-800'}`}>
                                                            {lecture.title}
                                                        </h4>
                                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                                            <span>Lecture:{lecture.lectureNo}</span>
                                                            <span>Date:{lecture.date}</span>
                                                        </div>
                                                    </div>

                                                    {/* Active Indicator Strip */}
                                                    {currentLecture.id === lecture.id && (
                                                        <div className="absolute right-0 top-4 bottom-4 w-1 bg-blue-600 rounded-l-full" />
                                                    )}

                                                    {/* Completion Checkmark (Visual Feedback) */}
                                                    {!lecture.isLocked && lecture.id !== currentLecture.id && lectures.findIndex(l => l.id === lecture.id) < lectures.findIndex(l => l.id === currentLecture.id) && (
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

                            <StatusTable />
                        </div>

                    </main>
                </div>

                <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            </div >
        </div >
    );
};

export default CourseView;