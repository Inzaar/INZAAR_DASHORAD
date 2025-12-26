import React from 'react';
import { cn } from "@/lib/utils";

const OverviewCard = ({
    completed = 8,
    inProgress = 2,
    timeSpent = "12h 30m",
    className
}) => {
    return (
        <div className={cn(
            "w-full max-w-[705px] bg-white rounded-[8px] border border-[#EAEDF2] px-6 py-[14px] flex flex-col gap-[10px]",
            className
        )}>
            {/* Title */}
            <h3 className="text-sm text-gray-500 font-normal">Overview</h3>

            {/* Stats Row */}
            <div className="flex items-center justify-between w-full">

                {/* Completed */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Vertical Bar */}
                    <div className="w-[2px] h-[48px] bg-[#22C55E] rounded-full"></div>
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-bold text-black leading-none">{completed}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                            <span className="text-[#22C55E] text-sm font-medium">Completed</span>
                        </div>
                    </div>
                </div>

                {/* In Progress */}
                <div className="flex items-center gap-4 flex-1 border-l border-gray-100 pl-8 sm:border-none sm:pl-0">
                    {/* Vertical Bar */}
                    <div className="w-[2px] h-[48px] bg-[#3758EE] rounded-full"></div>
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-bold text-black leading-none">{inProgress}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#3758EE]"></div>
                            <span className="text-[#3758EE] text-sm font-medium">In Progress</span>
                        </div>
                    </div>
                </div>

                {/* Time Spent */}
                <div className="flex items-center gap-4 flex-1 border-l border-gray-100 pl-8 sm:border-none sm:pl-0">
                    {/* Vertical Bar */}
                    <div className="w-[2px] h-[48px] bg-[#B666E7] rounded-full"></div>
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-bold text-black leading-none">{timeSpent}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#B666E7]"></div>
                            <span className="text-[#B666E7] text-sm font-medium">Time Spent Last week</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OverviewCard;
