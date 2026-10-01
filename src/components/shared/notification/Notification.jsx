import { useTranslation } from 'react-i18next';

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
            <div className={`flex justify-between items-center p-3.5 md:p-4 border-b border-gray-100 transition-all duration-300 ${isUnread ? 'bg-blue-50/30' : 'bg-white hover:bg-gray-50'}`}>
                <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className={`w-8 h-8 rounded-full shrink-0 ${isUnread ? 'bg-[#3758EE]' : 'bg-gray-200'}`}></div>
                    <div className={`text-[13px] md:text-[14px] ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-500 font-normal'} leading-snug flex-1 break-words`}>
                        {title && <span className={`${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{title} &ndash; </span>}
                        <span>{message}</span>
                    </div>
                </div>
                <div className={`shrink-0 ml-4 text-[11px] md:text-[12px] ${isUnread ? 'font-medium text-[#3758EE]' : 'font-normal text-gray-400'}`}>
                    {translateTime(time)}
                </div>
            </div>
        </div>
    )
}

export default Notification;