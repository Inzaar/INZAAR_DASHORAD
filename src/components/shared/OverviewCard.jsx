import React from 'react';
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

const OverviewCard = ({
    className,
    userCourses,
    statsOverride,  // optional: { col1, col2, col3 } each { value, label, color }
    showCircles = true,
    loading = false,
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
        col1: {
            value: userCourses?.stats?.completed || 0,
            label: t("completed_courses", "Completed Courses"),
            shortLabel: t("completed", "Completed"),
            color: "#22C55E"
        },
        col2: {
            value: userCourses?.stats?.inProgress || 0,
            label: t("in_progress_courses", "In Progress Courses"),
            shortLabel: t("in_progress", "In Progress"),
            color: "#3758EE"
        },
        col3: {
            value: formatTimeSpent(userCourses?.stats?.timeSpent),
            label: t("time_spent_last_week", "Time Spent Last week"),
            shortLabel: t("time_spent", "Time Spent"),
            color: "#B666E7"
        },
    };

    const stats = statsOverride || defaultStats;

    const getShortLabel = (label) => {
        if (!label) return "";
        const str = String(label).toLowerCase();
        if (str.includes("in active") || str.includes("inactive")) return t("inactive", "Inactive");
        if (str.includes("active student") || str.includes("active")) return t("active", "Active");
        if (str.includes("spend rate") || str.includes("average spend")) return t("avg_spend", "Avg Spend");
        if (str.includes("completed")) return t("completed", "Completed");
        if (str.includes("progress")) return t("in_progress", "In Progress");
        if (str.includes("time spent")) return t("time_spent", "Time Spent");
        if (str.includes("quiz")) return t("quiz", "Quiz");
        if (str.includes("lecture")) return t("lectures", "Lectures");
        return label;
    };

    const renderColumn = (col) => {
        const short = col.shortLabel || getShortLabel(col.label);

        return (
            <div className="flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-2.5 md:gap-3.5 min-w-0 w-full">
                {/* Vertical accent bar with top & bottom dots */}
                <div className="flex flex-col items-center h-7 min-[360px]:h-8 sm:h-10 md:h-12 w-1 sm:w-1.5 shrink-0">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.color }}></div>
                    <div className="flex-1 w-[1px] sm:w-[1.5px]" style={{ backgroundColor: col.color, opacity: 0.8 }}></div>
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.color }}></div>
                </div>

                {/* Stat details */}
                <div className="flex flex-col min-w-0 flex-1 justify-center leading-tight">
                    {loading ? (
                        <div className="h-5 sm:h-6 md:h-7 w-8 sm:w-12 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <span className="text-xs min-[360px]:text-sm sm:text-xl md:text-2xl xl:text-3xl font-bold text-gray-900 tracking-tight leading-none truncate">
                            {col.value}
                        </span>
                    )}
                    <div
                        className="flex items-center gap-0.5 min-[360px]:gap-1 sm:gap-1.5 text-[8px] min-[360px]:text-[9.5px] min-[420px]:text-[11px] sm:text-xs xl:text-sm font-semibold xl:font-bold leading-tight mt-0.5 sm:mt-1 min-w-0"
                        style={{ color: col.color }}
                    >
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shrink-0 hidden min-[380px]:block" style={{ backgroundColor: col.color }}></div>
                        <span className="truncate" title={col.label}>
                            <span className="inline xl:hidden">{short}</span>
                            <span className="hidden xl:inline">{col.label}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const activeCols = [stats.col1, stats.col2, stats.col3].filter(Boolean);
    const colCount = activeCols.length;

    return (
        <div className={cn(
            "bg-white border border-gray-100 rounded-xl sm:rounded-[16px] p-3 sm:p-5 md:p-6 shadow-sm flex flex-col gap-2 sm:gap-4 md:gap-6 min-w-0 w-full",
            className
        )}>
            {/* Title */}
            <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t("overview", "OVERVIEW")}</p>

            {/* Stats Row: 100% responsive grid, never overflows or clips */}
            <div className="w-full">
                <div className={`grid ${colCount === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1 min-[360px]:gap-1.5 sm:gap-4 md:gap-6 w-full items-center`}>
                    {stats.col1 && renderColumn(stats.col1)}
                    {stats.col2 && renderColumn(stats.col2)}
                    {stats.col3 && renderColumn(stats.col3)}
                </div>
            </div>
        </div>
    );
};

export default OverviewCard;
