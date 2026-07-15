
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// from 'react';
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const MetricCard = ({
    className,
    userCourses,
    // Optional overrides for course-detail view
    title: titleProp,
    value: valueProp,
    trendValue: trendValueProp,
    trendLabel: trendLabelProp,
}) => {
    const { t } = useTranslation();
    const metricInfo = {
        title: titleProp ?? t("progress", "Progress"),
        value: valueProp ?? (userCourses?.stats?.totalEnrolled || "0"),
        trend: {
            value: trendValueProp ?? (userCourses?.stats?.improvement || "0"),
            label: trendLabelProp ?? t("improvement_from_last_week", "Improvement From last Week"),
            direction: "up"
        },
        data: [70, 150, 120],
    }

    return (
        <div className={cn(
            "bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-end justify-between",
            className
        )}>
            {/* Left Content */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-gray-500 font-medium text-base">{metricInfo.title}</h3>
                    <span className="text-4xl font-bold text-gray-900">{metricInfo.value}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-emerald-50 p-0.5">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-emerald-500 font-medium text-sm">{metricInfo.trend.value}</span>
                    <span className="text-gray-400 text-[11px] min-[430px]:text-sm">{metricInfo.trend.label}</span>
                </div>
            </div>

            {/* Right Chart */}
            <div className="flex items-end gap-2 h-12 min-[500px]:h-16 pb-1">
                {metricInfo.data.map((height, index) => (
                    <div
                        key={index}
                        style={{ height: `${height}%` }}
                        className={cn(
                            "w-3 min-[500px]:w-4 rounded-t",
                            index === 1 ? "bg-[#5D5FEF]" : "bg-[#B4B5FF]"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

export default MetricCard;
