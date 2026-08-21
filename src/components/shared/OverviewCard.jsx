import React from 'react';
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

const OverviewCard = ({
    className,
    userCourses,
    statsOverride,  // optional: { col1, col2, col3 } each { value, label, color }
    showCircles = false, // Add this prop
}) => {
    const { t } = useTranslation();

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
        col1: { value: userCourses?.stats?.completed || 0, label: t("completed", "Completed"), color: "#22C55E" },
        col2: { value: userCourses?.stats?.inProgress || 0, label: t("in_progress", "In Progress"), color: "#3758EE" },
        col3: { value: formatTimeSpent(userCourses?.stats?.timeSpent), label: t("time_spent_last_week", "Time Spent Last week"), color: "#B666E7" },
    };

    const stats = statsOverride || defaultStats;

    const renderColumn = (col, isLast = false) => (
        <div className={cn("flex flex-1 items-center gap-2 min-[400px]:gap-3 min-w-0", !isLast && "min-[641px]:pl-8 sm:border-none sm:pl-0")}>
            <div className="relative flex flex-col items-center shrink-0">
                {showCircles && (
                    <div 
                        className="w-[6px] h-[6px] rounded-full mb-[-1px] z-10" 
                        style={{ backgroundColor: col.color }} 
                    />
                )}
                <div className="w-[2px] h-[36px] min-[400px]:h-[48px] rounded-full" style={{ backgroundColor: col.color }}></div>
                {showCircles && (
                    <div 
                        className="w-[6px] h-[6px] rounded-full mt-[-1px] z-10" 
                        style={{ backgroundColor: col.color }} 
                    />
                )}
            </div>
            <div className="flex flex-col gap-1 min-[400px]:gap-2.5 pt-1 pb-1 min-w-0">
                <span className="text-[16px] min-[400px]:text-[20px] [1270px]:text-2xl font-bold text-black leading-normal truncate">{col.value}</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 min-[400px]:w-2 min-[400px]:h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }}></div>
                    <span className="text-[10px] min-[400px]:text-[12px] [1270px]:text-sm font-medium leading-tight pt-0.5 pb-0.5" style={{ color: col.color }}>{col.label}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn(
            "w-full max-w-[705px] bg-white rounded-[8px] border border-[#EAEDF2] px-4 min-[400px]:px-6 py-[14px] flex flex-col gap-[10px]",
            className
        )}>
            {/* Title */}
            <h3 className="text-sm text-gray-500 font-normal leading-normal pb-1">{t("overview", "Overview")}</h3>

            {/* Stats Row */}
            <div className="flex flex-row items-center justify-between gap-1 min-[400px]:gap-2 sm:gap-4 w-full">
                {stats.col1 && renderColumn(stats.col1, !stats.col2 && !stats.col3)}
                {stats.col2 && renderColumn(stats.col2, !stats.col3)}
                {stats.col3 && renderColumn(stats.col3, true)}
            </div>
        </div>
    );
};

export default OverviewCard;

