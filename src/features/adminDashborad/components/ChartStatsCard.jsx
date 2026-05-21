import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const ChartStatsCard = ({ 
    title, 
    total, 
    active, 
    inactive, 
    trend, 
    trendDirection, 
    trendText,
    data,
    color
}) => {
    const isUp = trendDirection === 'up';
    
    // Fake data for the tiny chart
    const chartData = data || [
        { value: 10 }, { value: 10 }, { value: 20 }, { value: 15 }, 
        { value: 30 }, { value: 25 }, { value: 40 }, { value: 45 }
    ];

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between h-[125px] overflow-hidden">
            {/* Left side */}
            <div className="flex flex-col justify-between h-full">
                <h3 className="text-[14px] font-bold text-gray-900">{title}</h3>
                <div className="text-[28px] font-bold text-[#18181B] leading-none mb-1">
                    {total}
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className={`
                        px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0
                        ${isUp ? 'bg-[#E6F9F4] text-[#00C896]' : 'bg-red-50 text-red-600'}
                    `}>
                        {isUp ? '↑' : '↓'} {trend}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium truncate">{trendText}</span>
                </div>
            </div>

            {/* Right side */}
            <div className="flex flex-col justify-between items-end w-[140px] h-full">
                <div className="w-[100px] h-[40px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={color} 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill={`url(#gradient-${color})`} 
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="flex gap-4 mt-auto">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                            <span className="text-[14px] font-bold text-gray-900">{active}</span>
                            <span className="px-1 py-[1px] bg-red-50 text-red-500 rounded text-[8px] font-bold leading-none">15% ▾</span>
                        </div>
                        <span className="text-[8px] font-bold text-gray-400">Active Students</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                            <span className="text-[14px] font-bold text-gray-900">{inactive}</span>
                            <span className="px-1 py-[1px] bg-[#E6F9F4] text-[#00C896] rounded text-[8px] font-bold leading-none">21% ▴</span>
                        </div>
                        <span className="text-[8px] font-bold text-gray-400">Inactive Students</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartStatsCard;
