import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

const HoursSpentCard = ({
    userCourses,
    className,
    name,
    moderators = []
}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [filter, setFilter] = useState('top');
    const { t } = useTranslation();

    // Check if the component is being used for Moderator Performance
    // Matching "Moderator" case-insensitively to be robust
    const isModerator = name?.toLowerCase().includes("moderator");

    // Default mock data structure to preserve order and expected values
    const defaultData = [
        { day: t('day_sun', 'Sun'), key: 'sun', expected: 15 },
        { day: t('day_mon', 'Mon'), key: 'mon', expected: 24 },
        { day: t('day_tue', 'Tue'), key: 'tue', expected: 12 },
        { day: t('day_wed', 'Wed'), key: 'wed', expected: 20 },
        { day: t('day_thu', 'Thu'), key: 'thu', expected: 15 },
        { day: t('day_fri', 'Fri'), key: 'fri', expected: 22 },
        { day: t('day_sat', 'Sat'), key: 'sat', expected: 15 },
    ];

    const dynamicModeratorData = (moderators || []).map((mod, i) => {
        // We generate a stable percentage for visual testing since real metric isn't implemented
        const stableScore = 40 + ((mod.firstname.length * 13 + (mod._id ? mod._id.charCodeAt(0) : 0)) % 60);
        return {
            day: mod.firstname, // Full first name for label
            key: mod._id || `m-${i}`,
            percentage: stableScore
        };
    });

    const weeklyProgress = userCourses?.hoursSpent || userCourses?.stats?.weeklyProgress || {};

    let sourceData = defaultData;
    if (isModerator) {
        let filteredModeratorData = [...dynamicModeratorData];
        if (filter === 'top') {
            filteredModeratorData.sort((a, b) => b.percentage - a.percentage);
        } else if (filter === 'lowest') {
            filteredModeratorData.sort((a, b) => a.percentage - b.percentage);
        }
        // Slice to exactly 11 to match Figma
        sourceData = filteredModeratorData.slice(0, 11);
    }

    const data = sourceData.map((item, index) => {

        if (isModerator) {
            // For Moderator: Convert days to m-1, m-2, etc.
            // Use percentage directly from data

            // If weeklyProgress has data for m-key, use it (assuming it comes as percentage or we treat it as such), otherwise use mock
            // For now, let's assume weeklyProgress is not used for this view or if it is, it's raw percentage
            const rawVal = weeklyProgress[item.key] !== undefined ? weeklyProgress[item.key] : item.percentage;

            // Ensure it's within 0-100
            const spentPct = Math.min(100, Math.max(0, rawVal));

            // No expected value for moderator
            const expectedPct = 0;

            // Responsive visibility logic
            let visibilityClass = "flex";
            if (isModerator) {
                // For 11 items
                if (index >= 6 && index < 9) visibilityClass = "hidden sm:flex";
                if (index >= 9) visibilityClass = "hidden md:flex";
            } else {
                if (index >= 6 && index < 9) visibilityClass = "hidden sm:flex";
                if (index >= 9 && index < 12) visibilityClass = "hidden md:flex";
                if (index >= 12) visibilityClass = "hidden xl:flex";
            }

            return {
                ...item,
                day: item.day, // Already set to m-X
                spent: spentPct,
                expected: expectedPct,
                visibilityClass
            };
        } else {
            const val = weeklyProgress[item.key] || 0;
            // The backend now provides hours directly, no need to divide by 60
            const hours = Number(val).toFixed(1);
            return {
                ...item,
                spent: Number(hours), // ensure it's a number for height calculations
                visibilityClass: "flex"
            };
        }
    });
    // Calculate max value for scaling
    // For Moderator, max is always 100%. For others, dynamic based on data (min 24).
    const allValues = data.flatMap(d => [d.spent, d.expected]);
    const maxValue = isModerator ? 100 : Math.max(...allValues, 24);

    // Y-Axis labels
    const yAxisLabels = isModerator
        ? [100, 80, 60, 40, 20, 0]
        : [
            Math.round(maxValue),
            Math.round(maxValue * 0.75),
            Math.round(maxValue * 0.5),
            Math.round(maxValue * 0.25),
            0
        ];

    const unit = isModerator ? "%" : " Hr";

    // Bar width logic: thinner bars for Moderator due to higher count
    const barWidthClass = isModerator
        ? "w-6 sm:w-7 md:w-8"
        : "w-7 [400px]:w-8 sm:w-9 xl:w-10";

    return (
        <div className={cn(
            "w-full bg-white rounded-[16px] border border-[#EAEDF2] p-6 flex flex-col gap-6",
            className
        )}>
            {/* Header & Legend */}
            <div className="flex justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-black leading-normal pb-1">{name}</h3>
                {isModerator && (
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none bg-[#F4F4F5] text-[12px] font-medium text-[#18181B] border border-[#EAEDF2] rounded-[6px] px-3 py-1.5 pr-7 outline-none cursor-pointer"
                        >
                            <option value="top">Top</option>
                            <option value="lowest">Lowest</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart Area */}
            <div className="flex gap-4 min-h-[150px] h-full">
                {/* Y-Axis */}
                <div className="flex flex-col justify-between text-xs text-gray-400 py-1">
                    {yAxisLabels.map((label, i) => (
                        <span key={i}>{label === 0 && isModerator ? '00' : label}{unit}</span>
                    ))}
                </div>

                {/* Bars Area */}
                <div className={cn("flex-1 flex items-end relative", data.length < 6 ? "justify-around" : "justify-between")}>
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {yAxisLabels.map((_, i) => (
                            <div key={i} className="w-full h-[1px] bg-gray-100 border-t border-dashed border-gray-200"></div>
                        ))}
                    </div>

                    {/* Bars */}
                    {data.map((item, index) => {
                        const spentHeight = (item.spent / maxValue) * 100;
                        const expectedHeight = (item.expected / maxValue) * 100;

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "relative flex flex-col items-center justify-end h-full w-full group",
                                    item.visibilityClass
                                )}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Tooltip */}
                                {hoveredIndex === index && (
                                    <div className="absolute bottom-full mb-2 z-10 bg-[#3758EE] text-white text-xs rounded-lg p-2 shadow-lg min-w-[80px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 rounded-full bg-[#B666E7]"></div>
                                            <span>{item.spent}{unit}</span>
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#3758EE]"></div>
                                    </div>
                                )}

                                {/* Bar Container */}
                                <div className={cn(
                                    "relative h-full flex items-end justify-center",
                                    barWidthClass
                                )}>
                                    {/* Expected Bar (Background) */}
                                    {!isModerator && (
                                        <div
                                            className="absolute bottom-0 w-full bg-[#E0E7FF] rounded-[8px] transition-all duration-500"
                                            style={{ height: `${expectedHeight}%` }}
                                        ></div>
                                    )}

                                    {/* Spent Bar (Foreground) */}
                                    <div
                                        className="absolute bottom-0 w-full rounded-[8px] transition-all duration-500 bg-gradient-to-r from-[#A3A6F4] to-[#B393F5]"
                                        style={{ height: `${spentHeight}%` }}
                                    ></div>
                                </div>

                                {/* X-Axis Label */}
                                <span className="text-xs mt-3 text-[#C154F2] font-semibold underline decoration-1 underline-offset-2 uppercase">
                                    {item.day.toUpperCase()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HoursSpentCard;
