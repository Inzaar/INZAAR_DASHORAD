import React from 'react';
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

const OverviewCard = ({
    className,
    userCourses,
    statsOverride,  // optional: { col1, col2, col3 } each { value, label, color }
    showCircles = true, // Add this prop
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
        col1: { value: userCourses?.stats?.completed || 0, label: t("completed_courses", "Completed Courses"), color: "#22C55E" },
        col2: { value: userCourses?.stats?.inProgress || 0, label: t("in_progress_courses", "In Progress Courses"), color: "#3758EE" },
        col3: { value: formatTimeSpent(userCourses?.stats?.timeSpent), label: t("time_spent_last_week", "Time Spent Last week"), color: "#B666E7" },
    };

    const stats = statsOverride || defaultStats;

    const renderColumn = (col) => (
        <div className="flex items-center gap-3 md:gap-4">
            <div className="flex flex-col items-center h-10 md:h-14 w-2 shrink-0">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }}></div>
                <div className="flex-1 w-[1.5px] md:w-[2px]" style={{ backgroundColor: col.color, opacity: 0.8 }}></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }}></div>
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1 min-w-0">
                <span className="text-xl md:text-3xl font-medium text-gray-900 tracking-tight whitespace-nowrap">{col.value}</span>
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-bold whitespace-nowrap" style={{ color: col.color }}>
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.color }}></div>
                    {col.label}
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn(
            "bg-white border border-gray-100 rounded-[16px] p-6 shadow-sm flex flex-col gap-6 min-w-0 w-full",
            className
        )}>
            {/* Title */}
            <p className="text-gray-400 text-sm font-medium">{t("overview", "Overview")}</p>

            {/* Stats Row */}
            <div className="overflow-x-auto no-scrollbar pb-1">
                <div className="flex flex-row items-center justify-between gap-4 md:gap-x-10 lg:gap-x-16 min-w-max md:min-w-0">
                    {stats.col1 && renderColumn(stats.col1)}
                    {stats.col2 && renderColumn(stats.col2)}
                    {stats.col3 && renderColumn(stats.col3)}
                </div>
            </div>
        </div>
    );
};

export default OverviewCard;

