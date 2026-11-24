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
    activeLabel = "Active Students",
    inactiveLabel = "Inactive Students",
    className
}) => {
    const isUp = trendDirection === 'up';

    return (
        <div className={cn(
            "bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 flex flex-col justify-between font-sans transition-all duration-300 hover:shadow-md min-h-[140px] h-auto w-full",
            className
        )}>
            <div className="flex justify-between items-start gap-2 h-full">
                {/* Left side */}
                <div className="flex flex-col justify-between h-full min-w-0 flex-1">
                    <h3 className="text-[13px] sm:text-[14px] xl:text-[16px] font-bold text-[#18181B] leading-tight" title={title}>{title}</h3>
                    <div className="text-[26px] sm:text-[30px] xl:text-[36px] font-normal text-[#18181B] leading-none my-1">
                        {value}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm mt-auto pt-1">
                        <span className={`
                            px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] xl:text-[12px] font-medium flex items-center gap-0.5 shrink-0
                            ${isUp ? 'bg-[#E6F9F4] text-[#00C896]' : 'bg-red-50 text-red-600'}
                        `}>
                            {isUp ? '↑' : '↓'} {trend}
                        </span>
                        <span className="text-[10px] sm:text-[11px] xl:text-[13px] text-gray-400 font-normal truncate">{trendText}</span>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col justify-between items-end h-full shrink-0 max-w-[55%]">
                    {/* Sparkline Graph */}
                    <div className="w-full h-[36px] sm:h-[42px] mt-0.5 pr-1">
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
                    <div className="flex gap-2 sm:gap-3 xl:gap-5 mt-auto pt-1 w-full justify-end pr-1">
                        {/* Active Students */}
                        <div className="flex flex-col items-start min-w-0">
                            <div className="flex items-center gap-1">
                                <span className="text-[14px] sm:text-[16px] xl:text-[17px] font-bold text-[#18181B] leading-none">{activeCount}</span>
                                <span className={`px-1 py-[1px] rounded-[4px] text-[9px] sm:text-[10px] font-bold flex items-center shrink-0 ${activeTrendDirection === 'down' ? 'bg-[#FFF0F0] text-[#FF5B5B]' : 'bg-[#E6F9F4] text-[#00C896]'}`}>
                                    {activeTrend}% {activeTrendDirection === 'down' ? '▼' : '▲'}
                                </span>
                            </div>
                            <span className="text-[9px] sm:text-[10px] xl:text-[11px] text-gray-400 font-medium mt-0.5 truncate">{activeLabel}</span>
                        </div>

                        {/* Inactive Students */}
                        <div className="flex flex-col items-start min-w-0">
                            <div className="flex items-center gap-1">
                                <span className="text-[14px] sm:text-[16px] xl:text-[17px] font-bold text-[#18181B] leading-none">{inactiveCount}</span>
                                <span className={`px-1 py-[1px] rounded-[4px] text-[9px] sm:text-[10px] font-bold flex items-center shrink-0 ${inactiveTrendDirection === 'down' ? 'bg-[#FFF0F0] text-[#FF5B5B]' : 'bg-[#E6F9F4] text-[#00C896]'}`}>
                                    {inactiveTrend}% {inactiveTrendDirection === 'down' ? '▼' : '▲'}
                                </span>
                            </div>
                            <span className="text-[9px] sm:text-[10px] xl:text-[11px] text-gray-400 font-medium mt-0.5 truncate">{inactiveLabel}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenderStatsCard;
