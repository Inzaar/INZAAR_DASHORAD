import React from 'react';
import { cn } from "@/lib/utils";

const OverviewCard = ({
    className,
    userCourses
}) => {

    const formatTimeSpent = (minutes) => {
        if (!minutes) return "0h 0m";
        const numMinutes = parseInt(minutes, 10);
        if (isNaN(numMinutes)) return "0h 0m";
        const hours = Math.floor(numMinutes / 60);
        const mins = numMinutes % 60;
        return `${hours}h ${mins}m`;
    };

    const overviewInfo = {
        completed: userCourses?.stats?.completed || 0,
        inProgress: userCourses?.stats?.inProgress || 0,
        timeSpent: formatTimeSpent(userCourses?.stats?.timeSpent),
    }

    return (
        <div className={cn(
            "w-full max-w-[705px] bg-white rounded-[8px] border border-[#EAEDF2] px-6 py-[14px] flex flex-col gap-[10px]",
            className
        )}>
            {/* Title */}
            <h3 className="text-sm text-gray-500 font-normal">Overview</h3>

            {/* Stats Row */}
            <div className="flex max-[641px]:flex-col max-[641px]:gap-6 max-[641px]:items-start gap-2 items-center justify-between w-full">
                <div className="flex flex-2  max-[641px]:w-full min-[973px]:flex-1 min-[1255px]:flex-2 max-[641px]:items-start items-center justify-between">
                    {/* Completed */}
                    <div className="flex items-center gap-4 flex-1">
                        {/* Vertical Bar */}
                        <div className="w-[2px] h-[48px] bg-[#22C55E] rounded-full"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[20px] [1270px]:text-2xl font-bold text-black leading-none">{overviewInfo.completed}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                                <span className="text-[#22C55E] text-[11px] [1270px]:text-sm font-medium">Completed</span>
                            </div>
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="flex items-center gap-4 flex-1 border-l border-gray-100 min-[641px]:pl-8 sm:border-none sm:pl-0">
                        {/* Vertical Bar */}
                        <div className="w-[2px] h-[48px] bg-[#3758EE] rounded-full"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[20px] [1270px]:text-2xl font-bold text-black leading-none">{overviewInfo.inProgress}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#3758EE]"></div>
                                <span className="text-[#3758EE] text-[12px] [1270px]:text-sm font-medium">In Progress</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Time Spent */}
                <div className="flex flex-1 items-center gap-4 border-l border-gray-100 min-[641px]:pl-8 sm:border-none sm:pl-0">
                    {/* Vertical Bar */}
                    <div className="w-[2px] h-[48px] bg-[#B666E7] rounded-full"></div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[20px] [1270px]:text-2xl font-bold text-black leading-none">{overviewInfo.timeSpent}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#B666E7]"></div>
                            <span className="text-[#B666E7] text-[12px] [1270px]:text-sm font-medium">Time Spent Last week</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OverviewCard;
