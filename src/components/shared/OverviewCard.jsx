import React from 'react';
import { cn } from "@/lib/utils";

const OverviewCard = ({
    className,
    userCourses,
    statsOverride,  // optional: { col1, col2, col3 } each { value, label, color }
}) => {

    const formatTimeSpent = (minutes) => {
        if (!minutes) return "0h 0m";
        const numMinutes = parseInt(minutes, 10);
        if (isNaN(numMinutes)) return "0h 0m";
        const hours = Math.floor(numMinutes / 60);
        const mins = numMinutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Default dashboard view
    const defaultStats = {
        col1: { value: userCourses?.stats?.completed || 0, label: "Completed", color: "#22C55E" },
        col2: { value: userCourses?.stats?.inProgress || 0, label: "In Progress", color: "#3758EE" },
        col3: { value: formatTimeSpent(userCourses?.stats?.timeSpent), label: "Time Spent Last week", color: "#B666E7" },
    };

    const stats = statsOverride || defaultStats;


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
                    {/* Col 1 */}
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-[2px] h-[48px] rounded-full" style={{ backgroundColor: stats.col1.color }}></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[20px] [1270px]:text-2xl font-bold text-black leading-none">{stats.col1.value}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stats.col1.color }}></div>
                                <span className="text-[11px] [1270px]:text-sm font-medium" style={{ color: stats.col1.color }}>{stats.col1.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Col 2 */}
                    <div className="flex items-center gap-4 flex-1 border-l border-gray-100 min-[641px]:pl-8 sm:border-none sm:pl-0">
                        <div className="w-[2px] h-[48px] rounded-full" style={{ backgroundColor: stats.col2.color }}></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[20px] [1270px]:text-2xl font-bold text-black leading-none">{stats.col2.value}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stats.col2.color }}></div>
                                <span className="text-[12px] [1270px]:text-sm font-medium" style={{ color: stats.col2.color }}>{stats.col2.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Col 3 */}
                <div className="flex flex-1 items-center gap-4 border-l border-gray-100 min-[641px]:pl-8 sm:border-none sm:pl-0">
                    <div className="w-[2px] h-[48px] rounded-full" style={{ backgroundColor: stats.col3.color }}></div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[20px] [1270px]:text-2xl font-bold text-black leading-none">{stats.col3.value}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stats.col3.color }}></div>
                            <span className="text-[12px] [1270px]:text-sm font-medium" style={{ color: stats.col3.color }}>{stats.col3.label}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewCard;

