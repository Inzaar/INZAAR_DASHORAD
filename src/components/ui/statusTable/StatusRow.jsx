import React from "react";
import { useTranslation } from 'react-i18next';
import { Lock, Unlock } from 'lucide-react';
import GradiantButton from "../../ui/buttons/GradiantButton";
import { Link } from "react-router-dom";

function StatusRow({ data }) {
    const { t } = useTranslation();
    let displayStatus = data.status;
    if (displayStatus === 'Completed') {
        displayStatus = 'Last Lecture';
    } else if (displayStatus === 'InProgress') {
        displayStatus = 'Locked';
    }

    return (
        <tr className="text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            {/* Courses */}
            <td className="px-2.5 py-2.5 sm:px-4 sm:py-3.5 md:px-6 md:py-4 whitespace-nowrap text-left">
                <Link 
                    to={`/course-view?id=${data.courseId}&lectureId=${data.lectureId}`}
                    className="font-semibold sm:font-medium text-gray-900 hover:text-[#5D6AF7] transition-colors block max-w-[130px] sm:max-w-[170px] md:max-w-[220px] truncate"
                    title={data.course}
                >
                    {t(data.course?.trim(), data.course)}
                </Link>
            </td>

            {/* Lecture */}
            <td className="px-2 py-2.5 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">
                <span className="font-semibold sm:font-medium text-gray-900 text-xs sm:text-sm">
                    {data.lecture}
                </span>
            </td>

            {/* Title */}
            <td className="px-2.5 py-2.5 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-left max-w-[140px] sm:max-w-[190px] md:max-w-[260px]">
                <div 
                    className="font-medium text-gray-900 leading-snug truncate" 
                    title={data.title}
                >
                    {t(data.title?.trim(), data.title)}
                </div>
            </td>

            {/* Date */}
            <td className="px-2 py-2.5 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap text-gray-500">
                {data.date}
            </td>

            {/* Progress */}
            <td className="px-2 py-2.5 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">
                <span className="font-bold text-[#6366F1]">
                    {data.progress}
                </span>
            </td>

            {/* Next Lecture */}
            <td className="px-2 py-2.5 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">
                {displayStatus === 'Locked' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200/60">
                        <Lock className="w-3 h-3 shrink-0" />
                        {t('locked', 'Locked')}
                    </span>
                ) : displayStatus === 'Last Lecture' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200/60">
                        {t('last_lecture', 'Last Lecture')}
                    </span>
                ) : displayStatus ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                        <Unlock className="w-3 h-3 shrink-0" />
                        {t(displayStatus.toLowerCase(), displayStatus)}
                    </span>
                ) : null}
            </td>

            {/* Comments */}
            <td className="px-2 py-2.5 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">
                {(!data.comments || data.comments === "N/A") ? (
                    <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-400 rounded-full text-[10px] sm:text-xs">
                        {t("N/A", "N/A")}
                    </span>
                ) : (
                    <span className="text-gray-700 text-xs sm:text-sm">
                        {t(data.comments, data.comments)}
                    </span>
                )}
            </td>

            {/* Action */}
            <td className="px-2 py-2.5 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">
                <Link 
                    to={`/course-view?id=${data.courseId}&lectureId=${data.lectureId}`} 
                    className="inline-block"
                >
                    <GradiantButton className="px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-[11px] sm:text-xs md:text-sm rounded-[6px] sm:rounded-lg font-medium whitespace-nowrap shadow-none">
                        {t('watch_again', 'Watch Again')}
                    </GradiantButton>
                </Link>
            </td>
        </tr>
    );
}

export default StatusRow;