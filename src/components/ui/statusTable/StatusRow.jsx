import React from "react";
import { useTranslation } from 'react-i18next';
import GradiantButton from "../../ui/buttons/GradiantButton";
import { Link } from "react-router-dom";

function StatusRow({ data }) {
    const { t } = useTranslation();
    return (
        <div className="h-[60px] w-full bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-[12px]">
            <div className="flex-1 min-w-[120px] flex items-center justify-center">{t(data.course?.trim(), data.course)}</div>
            <div className="flex-1 min-w-[120px] flex items-center justify-center">{data.lecture}</div>
            <div className="flex-1 min-w-[120px] flex items-center justify-center">{t(data.title?.trim(), data.title)}</div>
            <div className="flex-1 min-w-[120px] flex items-center justify-center">{data.date}</div>
            <div className="flex-1 min-w-[120px] flex items-center justify-center">{data.progress}</div>
            <div className="flex-1 min-w-[120px] flex items-center justify-center">
                {data.status === 'Locked' && '🔒'} {data.status ? t(data.status.toLowerCase(), data.status) : ''}
            </div>
            <div className="flex-1 min-w-[120px] flex flex-col items-center justify-center text-center gap-1">
                {data.moderatorName !== "N/A" && data.moderatorContact !== "N/A" ? (
                    <>
                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{t(data.moderatorName?.trim(), data.moderatorName)}</span>
                        <a 
                            href={`https://wa.me/${(data.moderatorContact || '').replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-7 h-7 bg-[#25D366] text-white rounded-[20%] flex items-center justify-center shadow-sm hover:bg-[#20ba5a] transition-all hover:scale-110 active:scale-95"
                            title={`Chat with ${data.moderatorName}`}
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </a>
                    </>
                ) : (
                    <span className="text-gray-400 italic text-[11px]">{t("N/A", "N/A")}</span>
                )}
            </div>
            <div className="flex-1 min-w-[120px] flex items-center justify-center">{t(data.comments, data.comments)}</div>
            <Link 
                to={`/course-view?id=${data.courseId}&lectureId=${data.lectureId}`} 
                className="flex-1 min-w-[120px] flex items-center justify-center"
            >
                <GradiantButton className="p-[8px] rounded-[4px] whitespace-nowrap">{t('watch_again', 'Watch Again')}</GradiantButton>
            </Link>
        </div>
    );
}

export default StatusRow;