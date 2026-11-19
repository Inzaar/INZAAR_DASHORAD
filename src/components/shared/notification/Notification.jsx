import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';

function Notification({ title, message = "Default Notification", time = "Just now", onClick, className = "", isUnread = false }) {
    const { t } = useTranslation();

    const translateTime = (timeStr) => {
        if (!timeStr) return "";
        const cleanTime = timeStr.trim().replace(/\s+/g, ' ');
        const weeksMatch = cleanTime.match(/^(\d+)\s+weeks?\s+ago$/i);
        if (weeksMatch) return t("weeks_ago", { count: parseInt(weeksMatch[1]), defaultValue: cleanTime });
        const daysMatch = cleanTime.match(/^(\d+)\s+days?\s+ago$/i);
        if (daysMatch) return t("days_ago", { count: parseInt(daysMatch[1]), defaultValue: cleanTime });
        const monthsMatch = cleanTime.match(/^(\d+)\s+months?\s+ago$/i);
        if (monthsMatch) return t("months_ago", { count: parseInt(monthsMatch[1]), defaultValue: cleanTime });
        return t(cleanTime, timeStr);
    };
    return (
        <div onClick={onClick} className={`${className} group cursor-pointer w-full`}>
            <div className={`flex items-start sm:items-center justify-between p-2.5 sm:p-4 border-b border-gray-100 transition-all duration-200 ${isUnread ? 'bg-blue-50/40' : 'bg-white hover:bg-gray-50'}`}>
                <div className="flex-1 flex items-start sm:items-center gap-2.5 sm:gap-4 min-w-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 mt-0.5 sm:mt-0 flex items-center justify-center transition-transform group-hover:scale-105 ${isUnread ? 'bg-[#3758EE] text-white shadow-sm shadow-blue-500/25' : 'bg-gray-100 text-gray-400'}`}>
                        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className={`text-xs sm:text-[13px] md:text-[14px] ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-500 font-normal'} leading-snug flex-1 break-words min-w-0`}>
                        {title && <span className={`${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-700 font-medium'}`}>{title} &ndash; </span>}
                        <span>{message}</span>

                        {/* Mobile timestamp below text to maximize reading space */}
                        <div className={`sm:hidden mt-1 text-[11px] ${isUnread ? 'font-medium text-[#3758EE]' : 'font-normal text-gray-400'}`}>
                            {translateTime(time)}
                        </div>
                    </div>
                </div>

                {/* Desktop timestamp on the right */}
                <div className={`hidden sm:block shrink-0 ml-4 text-[11px] md:text-[12px] ${isUnread ? 'font-medium text-[#3758EE]' : 'font-normal text-gray-400'}`}>
                    {translateTime(time)}
                </div>
            </div>
        </div>
    );
}

export default Notification;