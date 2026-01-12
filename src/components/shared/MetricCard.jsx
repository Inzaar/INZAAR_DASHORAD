
import React from 'react';
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const MetricCard = ({
    title = "Total Enrolled Courses",
    value = "10",
    trend = {
        value: "2.7%",
        label: "Improvement From last Week",
        direction: "up" // 'up' | 'down'
    },
    data = [70, 150, 120], // Sample data for the 3 bars
    className
}) => {
    return (
        <div className={cn(
            "bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-end justify-between",
            className
        )}>
            {/* Left Content */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-gray-500 font-medium text-base">{title}</h3>
                    <span className="text-4xl font-bold text-gray-900">{value}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-emerald-50 p-0.5">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-emerald-500 font-medium text-sm">{trend.value}</span>
                    <span className="text-gray-400 text-sm">{trend.label}</span>
                </div>
            </div>

            {/* Right Chart */}
            <div className="flex items-end gap-2 h-16 pb-1">
                {data.map((height, index) => (
                    <div
                        key={index}
                        style={{ height: `${height}%` }}
                        className={cn(
                            "w-4 rounded-t",
                            index === 1 ? "bg-[#5D5FEF]" : "bg-[#B4B5FF]" // Middle bar darker based on image
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

export default MetricCard;
