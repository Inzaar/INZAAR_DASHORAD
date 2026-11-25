import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TfiArrowTopRight } from "react-icons/tfi";
import { cn } from '@/lib/utils';


const StatsCard = ({
    title = "Total Moderators",
    value = "150",
    trend = "2.4%",
    trendDirection = "up",
    trendText = "vs last month",
    onClick,
    className
}) => {
    const isUp = trendDirection === 'up';

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 h-[108px] sm:h-[125px] xl:h-[135px] flex flex-col justify-between font-sans transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 w-[190px] sm:w-[240px] xl:w-auto min-w-[190px] sm:min-w-[240px] xl:min-w-0 shrink-0 xl:shrink",
                onClick && "cursor-pointer",
                className
            )}
        >
            <div className="flex justify-between items-start gap-2">
                <h3 className="text-[12.5px] sm:text-[14px] xl:text-[16px] font-semibold text-[#18181B] whitespace-nowrap" title={title}>{title}</h3>
                <div className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                    <TfiArrowTopRight size={12} className="sm:text-[14px] xl:text-[16px]" />
                </div>
            </div>

            <div className="text-[24px] sm:text-[28px] xl:text-[36px] font-normal text-[#18181B] leading-none my-0.5 sm:my-1">
                {value}
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 text-sm mt-auto">
                <span className={`
                    px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] xl:text-[12px] font-medium flex items-center gap-0.5 sm:gap-1 shrink-0
                    ${isUp ? 'bg-[#E6F9F4] text-[#00C896]' : 'bg-red-50 text-red-600'}
                `}>
                    {isUp ? '↑' : '↓'} {trend}
                </span>
                <span className="text-[11px] sm:text-[12px] xl:text-[13px] text-gray-400 font-normal truncate">{trendText}</span>
            </div>
        </div>
    );
};

export default StatsCard;
