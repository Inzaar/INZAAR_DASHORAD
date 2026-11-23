import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { BiSolidUpArrow } from "react-icons/bi";
import { BiSolidDownArrow } from "react-icons/bi";
import { useTranslation } from 'react-i18next';

const CourseStatItem = ({ count, trend, trendDirection, name }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-4 px-3 border-b border-r border-gray-100 bg-white">
            <div className="flex items-center gap-1 mb-1">
                <span className="text-[28px] font-bold text-[#0f172a]">{count}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[12px] font-bold ${trendDirection === 'up' ? 'bg-[#E6F9F4] text-[#00C896]' : 'bg-[#FFEAE5] text-[#FF4D4D]'}`}>
                    {trend}
                </span>
                <span>
                    {trendDirection === 'up' ? (
                        <BiSolidUpArrow className='text-[#00C896] text-[12px]' />
                    ) : (
                        <BiSolidDownArrow className='text-[#FF4D4D] text-[12px]' />
                    )}
                </span>
            </div>
            <span className="text-[14px] font-medium text-[#64748b] text-center line-clamp-2 max-w-[140px] leading-tight">{t(name, name)}</span>
        </div >
    );
};

const CoursesEnrollmentOverview = ({
    courseStats = [],
    limit = 12,
    showViewAll = true,
    showViewMore = false,
    onViewAllClick
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const getTwoRowsLimit = () => {
        if (typeof window === 'undefined') return 12;
        const width = window.innerWidth;
        if (width < 640) return 4;   // 2 cols * 2 rows
        if (width < 768) return 6;   // 3 cols * 2 rows
        if (width < 1024) return 8;  // 4 cols * 2 rows
        if (width < 1280) return 10; // 5 cols * 2 rows
        return 12;                   // 6 cols * 2 rows
    };

    const [twoRowsLimit, setTwoRowsLimit] = useState(getTwoRowsLimit);

    React.useEffect(() => {
        const handleResize = () => {
            setTwoRowsLimit(getTwoRowsLimit());
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const effectiveLimit = Math.min(limit, twoRowsLimit);
    const displayedStats = isExpanded ? courseStats : courseStats.slice(0, effectiveLimit);
    const shouldShowViewMore = showViewMore && courseStats.length > effectiveLimit;

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 font-sans mt-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4">
                <h3 className="text-[13px] sm:text-[14px] font-medium text-[#64748b] truncate pr-2">{t('courses_enrollment_overview', 'Courses Enrollment Overview')}</h3>
                {showViewAll && (
                    <GradiantButton
                        onClick={onViewAllClick}
                        className="w-fit shrink-0 px-2.5 sm:px-5 py-1 sm:py-2 text-[11px] sm:text-[12px] font-bold rounded-md sm:rounded-lg shadow-sm whitespace-nowrap"
                    >
                        {t('view_all_courses', 'View All courses')}
                    </GradiantButton>
                )}
            </div>

            <div className="border-t border-l border-gray-100 rounded-2xl overflow-hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {displayedStats.map((item, index) => (
                    <CourseStatItem
                        key={index}
                        {...item}
                    />
                ))}
            </div>

            {shouldShowViewMore && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-[13px] font-bold text-[#6366F1] hover:text-[#4F46E5] transition-colors"
                    >
                        {isExpanded ? (
                            <>{t('show_less', 'Show Less')} <ChevronUp size={16} /></>
                        ) : (
                            <>{t('view_more', 'View More')} <ChevronDown size={16} /></>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CoursesEnrollmentOverview;
