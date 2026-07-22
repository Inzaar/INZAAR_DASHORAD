import React from 'react';
import { FileText, Pencil } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';

const AssignmentStartOverlay = ({ lecture, courseData, onStart, isAdminView }) => {
    const instructorImage = "https://randomuser.me/api/portraits/men/32.jpg";

    return (
        <div className="relative w-full h-full bg-[#1A1A1A] overflow-hidden flex flex-col font-sans group select-none">
            {/* Artistic Background matching Islamic Quiz aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D2D2D] via-[#1F1F1F] to-[#121212] z-0" />
            
            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col p-4 sm:p-5 md:p-6 justify-between">
                
                {/* Top Section: Lecture Info and Instructor */}
                <div className="flex justify-between items-start w-full">
                    <div className="text-white">
                        <h2 className="text-lg md:text-2xl font-bold mb-0.5 md:mb-1 shadow-black/20 drop-shadow-lg leading-tight">
                            {lecture?.title || "Assignment Task"}
                        </h2>
                        <div className="text-[10px] md:text-sm opacity-80 font-medium">
                            <p>Module: {String(lecture?.lectureNo || '01').padStart(2, '0')}</p>
                        </div>
                    </div>

                    <div className="relative group/instructor">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-25 group-hover/instructor:opacity-75 transition duration-1000 group-hover/instructor:duration-200"></div>
                        <img 
                            src={instructorImage} 
                            alt="Instructor" 
                            className="relative w-8 h-8 md:w-12 md:h-12 rounded-full border border-white shadow-xl cursor-pointer"
                        />
                    </div>
                </div>

                {/* Center Section: Graphic Text matching Islamic Quiz style */}
                <div className="flex-1 flex flex-col items-center justify-center my-2 sm:my-4">
                    <div className="text-center transform transition-transform duration-700 group-hover:scale-105">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-300/30">
                            <FileText className="text-white w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#8C8C8C] to-[#404040] select-none block mb-[-0.2em] opacity-90 leading-none">
                            COURSE
                        </h1>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter text-[#A892FF] select-none block drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-none">
                            ASSIGNMENT
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-md mx-auto mt-2 line-clamp-2 px-4">
                            {lecture?.instructions || "Review the assignment guidelines and complete your submission."}
                        </p>
                    </div>
                </div>

                {/* Bottom Section: Gradient Button matching theme */}
                <div className="flex justify-center w-full mt-auto">
                    <GradiantButton 
                        onClick={onStart}
                        className="w-full max-w-[360px] py-2.5 md:py-3 rounded-xl shadow-xl hover:shadow-2xl text-white font-bold text-sm md:text-base transition-all active:scale-[0.98]"
                    >
                        {isAdminView ? (
                            <span className="flex items-center justify-center gap-2">
                                <Pencil size={18} />
                                Edit Assignment
                            </span>
                        ) : 'Start Assignment'}
                    </GradiantButton>
                </div>
            </div>

            {/* Subtle Overlay Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
            />
        </div>
    );
};

export default AssignmentStartOverlay;
