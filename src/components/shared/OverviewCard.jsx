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
            <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5 min-w-0 shrink-0">
                {/* Vertical accent bar with top & bottom dots */}
                <div className="flex flex-col items-center h-8 sm:h-10 md:h-12 w-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.color }}></div>
                    <div className="flex-1 w-[1.5px]" style={{ backgroundColor: col.color, opacity: 0.8 }}></div>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.color }}></div>
                </div>

                {/* Stat details */}
                <div className="flex flex-col min-w-0 justify-center">
                    {loading ? (
                        <div className="h-5 sm:h-6 md:h-7 w-8 sm:w-12 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <span className="text-sm min-[360px]:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight leading-none truncate">
                            {col.value}
                        </span>
                    )}
                    <div
                        className="flex items-center gap-1 sm:gap-1.5 text-[9.5px] min-[360px]:text-[10px] min-[420px]:text-[11px] sm:text-xs md:text-sm font-semibold sm:font-bold leading-tight mt-0.5 sm:mt-1 min-w-0"
                        style={{ color: col.color }}
                    >
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.color }}></div>
                        <span className="truncate" title={col.label}>
                            <span className="inline min-[520px]:hidden">{short}</span>
                            <span className="hidden min-[520px]:inline">{col.label}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cn(
            "bg-white border border-gray-100 rounded-[16px] p-3.5 sm:p-5 md:p-6 shadow-sm flex flex-col gap-2.5 sm:gap-4 md:gap-6 min-w-0 w-full",
            className
        )}>
            {/* Title */}
            <p className="text-gray-400 text-xs sm:text-sm font-medium">{t("overview", "Overview")}</p>

            {/* Stats Row: Always in a single line, evenly spaced across the card */}
            <div className="w-full">
                <div className="flex flex-row items-center justify-between w-full">
                    {stats.col1 && renderColumn(stats.col1)}
                    {stats.col2 && renderColumn(stats.col2)}
                    {stats.col3 && renderColumn(stats.col3)}
                </div>
            </div>
        </div>
    );
};

export default OverviewCard;
