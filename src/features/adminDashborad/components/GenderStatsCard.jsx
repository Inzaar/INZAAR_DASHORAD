import React from 'react';
import { cn } from '@/lib/utils';

const GenderStatsCard = ({
    title,
    value,
    trend = "2.4%",
    trendDirection = "up",
    trendText = "vs last month",
    activeCount,
    activeTrend,
    activeTrendDirection = "down",
    inactiveCount,
    inactiveTrend,
    inactiveTrendDirection = "up",
    className
}) => {
    const isUp = trendDirection === 'up';

    return (
        <div className={cn(
            "bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden font-sans transition-all duration-300 hover:shadow-md h-[135px] w-full",
            className
        )}>
            <div className="flex justify-between items-start h-full">
                {/* Left side */}
                <div className="flex flex-col justify-between h-full">
                    <h3 className="text-[16px] font-bold text-[#18181B]">{title}</h3>
                    <div className="text-[36px] font-normal text-[#18181B] leading-none mt-2">
                        {value}
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-auto pt-2">
                        <span className={`
                            px-2 py-0.5 rounded-full text-[12px] font-medium flex items-center gap-1 shrink-0
                            ${isUp ? 'bg-[#E6F9F4] text-[#00C896]' : 'bg-red-50 text-red-600'}
                        `}>
                            {isUp ? '↑' : '↓'} {trend}
                        </span>
                        <span className="text-[13px] text-gray-400 font-normal truncate">{trendText}</span>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col justify-between items-end h-full w-[50%] max-w-[250px]">
                    {/* Sparkline Graph */}
                    <div className="w-full h-[45px] mt-1 pr-2">
                        <svg width="100%" height="100%" viewBox="0 0 100 45" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#00C896" stopOpacity="0.15"/>
                                    <stop offset="100%" stopColor="#00C896" stopOpacity="0"/>
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,35 Q10,35 25,35 T45,30 T65,15 T85,15 T100,5 L100,45 L0,45 Z"
                                fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
                            />
                            <path
                                d="M0,35 Q10,35 25,35 T45,30 T65,15 T85,15 T100,5"
                                fill="none"
                                stroke="#00C896"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    {/* Right side stats */}
                    <div className="flex gap-4 md:gap-6 mt-auto pt-1 w-full justify-end pr-2">
                        {/* Active Students */}
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[17px] font-bold text-[#18181B] leading-none">{activeCount}</span>
                                <span className={`px-1 py-[1px] rounded-[4px] text-[10px] font-bold flex items-center ${activeTrendDirection === 'down' ? 'bg-[#FFF0F0] text-[#FF5B5B]' : 'bg-[#E6F9F4] text-[#00C896]'}`}>
                                    {activeTrend}% {activeTrendDirection === 'down' ? '▼' : '▲'}
                                </span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium mt-1">Active Students</span>
                        </div>

                        {/* Inactive Students */}
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[17px] font-bold text-[#18181B] leading-none">{inactiveCount}</span>
                                <span className={`px-1 py-[1px] rounded-[4px] text-[10px] font-bold flex items-center ${inactiveTrendDirection === 'down' ? 'bg-[#FFF0F0] text-[#FF5B5B]' : 'bg-[#E6F9F4] text-[#00C896]'}`}>
                                    {inactiveTrend}% {inactiveTrendDirection === 'down' ? '▼' : '▲'}
                                </span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium mt-1">Inactive Students</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenderStatsCard;
