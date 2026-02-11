import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TfiArrowTopRight } from "react-icons/tfi";


const StatsCard = ({
    title = "Total Moderators",
    value = "150",
    trend = "2.4%",
    trendDirection = "up",
    trendText = "vs last month"
}) => {
    const isUp = trendDirection === 'up';

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-w-[240px] font-sans">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <div className="w-10 h-10 rounded-full border border-gray-100 flex pt-1 pr-1 items-center justify-center text-gray-400">
                    <TfiArrowTopRight size={20} />
                </div>
            </div>

            <div className="text-[40px] font-medium text-[#18181B] mb-4 leading-none">
                {value}
            </div>

            <div className="flex items-center gap-2 text-sm">
                <span className={`
                    px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1
                    ${isUp ? 'bg-[#E6F9F4] text-[#00C896]' : 'bg-red-50 text-red-600'}
                `}>
                    {isUp ? '↑' : '↓'} {trend}
                </span>
                <span className="text-gray-500">{trendText}</span>
            </div>
        </div>
    );
};

export default StatsCard;
