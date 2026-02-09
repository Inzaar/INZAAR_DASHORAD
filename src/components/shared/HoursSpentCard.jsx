import React, { useState } from 'react';
import { cn } from "@/lib/utils";

const HoursSpentCard = ({
    userCourses,
    className,
    name
}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Default mock data structure to preserve order and expected values
    const defaultData = [
        { day: 'Sun', key: 'sun', expected: 15 },
        { day: 'Mon', key: 'mon', expected: 24 },
        { day: 'Tue', key: 'tue', expected: 12 },
        { day: 'Wed', key: 'wed', expected: 20 },
        { day: 'Thu', key: 'thu', expected: 15 },
        { day: 'Fri', key: 'fri', expected: 22 },
        { day: 'Sat', key: 'sat', expected: 15 },
    ];

    const weeklyProgress = userCourses?.stats?.weeklyProgress || {};

    const data = defaultData.map(item => {
        const minutes = weeklyProgress[item.key] || 0;
        // Convert minutes to hours, rounded to 1 decimal
        const hours = Number((minutes / 60).toFixed(1));
        return {
            ...item,
            spent: hours
        };
    });
    // Calculate max value for scaling
    const allValues = data.flatMap(d => [d.spent, d.expected]);
    const maxValue = Math.max(...allValues, 24); // Default to at least 24 if values are low

    // Y-Axis labels (0, 25%, 50%, 75%, 100% of max)
    // To match the image style (0, 05, 10, 15, 24), we'll try to keep it simple or dynamic
    // Let's use dynamic 5 steps
    const yAxisLabels = [
        Math.round(maxValue),
        Math.round(maxValue * 0.75),
        Math.round(maxValue * 0.5),
        Math.round(maxValue * 0.25),
        0
    ];

    return (
        <div className={cn(
            "w-full bg-white rounded-[16px] border border-[#EAEDF2] p-6 flex flex-col gap-6",
            className
        )}>
            {/* Header & Legend */}
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-black">{name}</h3>
                {name === "Hours Spent" && (
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[2px] bg-gradient-to-r from-[#3758EE] to-[#B666E7]"></div>
                            <span className="text-gray-500">Spend time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-[2px] bg-[#E0E7FF]"></div>
                            <span className="text-gray-500">Expected Time</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart Area */}
            <div className="flex gap-4 h-[150px]">
                {/* Y-Axis */}
                <div className="flex flex-col justify-between text-xs text-gray-400 py-1">
                    {yAxisLabels.map((label, i) => (
                        <span key={i}>{label} Hr</span>
                    ))}
                </div>

                {/* Bars Area */}
                <div className="flex-1 flex items-end justify-between relative">
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
                                className="relative flex flex-col items-center justify-end h-full w-full group"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Tooltip */}
                                {hoveredIndex === index && (
                                    <div className="absolute bottom-full mb-2 z-10 bg-[#3758EE] text-white text-xs rounded-lg p-2 shadow-lg min-w-[80px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 rounded-full bg-[#B666E7]"></div>
                                            <span>{item.spent} Hr</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#E0E7FF]"></div>
                                            <span>{item.expected} Hr</span>
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#3758EE]"></div>
                                    </div>
                                )}

                                {/* Bar Container */}
                                <div className="relative w-7 [400px]:w-8 sm:w-9 xl:w-10 h-full flex items-end justify-center rounded-lg overflow-hidden">
                                    {/* Expected Bar (Background) */}
                                    <div
                                        className="absolute bottom-0 w-full bg-[#E0E7FF] rounded-lg transition-all duration-500"
                                        style={{ height: `${expectedHeight}%` }}
                                    ></div>

                                    {/* Spent Bar (Foreground) */}
                                    <div
                                        className="absolute bottom-0 w-full bg-gradient-to-b from-[#B666E7] to-[#3758EE] transition-all duration-500"
                                        style={{ height: `${spentHeight}%` }}
                                    ></div>
                                </div>

                                {/* X-Axis Label */}
                                <span className="text-xs text-gray-400 mt-3">{item.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HoursSpentCard;
