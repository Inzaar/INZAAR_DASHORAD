import React from 'react';
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

const PerformanceCard = ({
    userCourses,
    className,
    name,
    percentageOverride,
    trendOverride,
}) => {

    const percentageInfo = {
        percentage: percentageOverride ?? userCourses?.stats?.overallProgress ?? 0,
        trend: trendOverride ?? userCourses?.stats?.improvement ?? 0,
    }

    const size = 139;
    const strokeWidth = 16;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentageInfo.percentage / 100) * circumference;

    return (
        <div className={cn(
            "w-full min-h-[150px] bg-white rounded-[16px] border border-[#EAEDF2] p-6 flex flex-col items-center gap-[18px]",
            className
        )}>
            <h3 className="text-[18px] font-bold text-black">{name}</h3>

            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3758EE" />
                            <stop offset="100%" stopColor="#B666E7" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="#F3F4F6"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="url(#gradient)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-black">{percentageInfo.percentage}%</span>
                    <span className="text-xs text-gray-500">Performance</span>
                </div>
            </div>

            <div className="flex items-center gap-1 text-sm font-medium">
                <span>Trending up by</span>
                <span className="text-[#3758EE]">{percentageInfo.trend}%</span>
                <span>this Week</span>
                <TrendingUp className="w-4 h-4 text-black ml-1" />
            </div>
        </div>
    );
};

export default PerformanceCard;
