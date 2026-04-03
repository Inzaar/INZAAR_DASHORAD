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
    onClick
}) => {
    const isUp = trendDirection === 'up';

    return (
        <div 
            onClick={onClick}
            className={cn(
                "bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 w-full h-[125px] flex flex-col justify-between overflow-hidden font-sans transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95",
                onClick && "cursor-pointer"
            )}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-[13px] font-bold text-gray-900 line-clamp-1 truncate">{title}</h3>
                <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                    <TfiArrowTopRight size={16} />
                </div>
            </div>

            <div className="text-[20px] font-bold text-[#18181B] leading-none my-1">
                {value}
            </div>

            <div className="flex items-center gap-2 text-sm mt-auto">
                <span className={`
                    px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 shrink-0
                    ${isUp ? 'bg-[#E6F9F4] text-[#00C896]' : 'bg-red-50 text-red-600'}
                `}>
                    {isUp ? '↑' : '↓'} {trend}
                </span>
                <span className="text-[10px] text-gray-400 font-medium truncate">{trendText}</span>
            </div>
        </div>
    );
};

export default StatsCard;
