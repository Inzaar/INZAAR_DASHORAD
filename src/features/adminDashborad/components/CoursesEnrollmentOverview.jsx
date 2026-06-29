import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { BiSolidUpArrow } from "react-icons/bi";
import { BiSolidDownArrow } from "react-icons/bi";

const CourseStatItem = ({ count, trend, trendDirection, name }) => {
    return (
        <div className="flex flex-col items-center justify-center py-4 px-3 border-b border-r border-gray-100 bg-white">
            <div className="flex items-center gap-1 mb-1">
                <span className="text-[24px] font-bold text-[#0f172a]">{count}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${trendDirection === 'up' ? 'bg-[#E6F9F4] text-[#00C896]' : 'bg-[#FFEAE5] text-[#FF4D4D]'}`}>
                    {trend}
                </span>
                <span>
                    {trendDirection === 'up' ? (
                        <BiSolidUpArrow className='text-[#00C896] text-[10px]' />
                    ) : (
                        <BiSolidDownArrow className='text-[#FF4D4D] text-[10px]' />
                    )}
                </span>
            </div>
            <span className="text-[12px] font-medium text-[#64748b] text-center line-clamp-2 max-w-[140px] leading-tight">{name}</span>
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
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Slices for 2 rows (default 12 for grid-6)
    const displayedStats = isExpanded ? courseStats : courseStats.slice(0, limit);

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 font-sans mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-[14px] font-medium text-[#64748b] truncate pr-2">Courses Enrollment Overview</h3>
                {showViewAll && (
                    <GradiantButton 
                        onClick={onViewAllClick}
                        className="w-fit px-5 py-2 text-[12px] font-bold rounded-lg shadow-sm"
                    >
                        View All courses
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

            {showViewMore && courseStats.length > limit && (
                <div className="mt-8 flex justify-center">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-[13px] font-bold text-[#6366F1] hover:text-[#4F46E5] transition-colors"
                    >
                        {isExpanded ? (
                            <>Show Less <ChevronUp size={16} /></>
                        ) : (
                            <>View More <ChevronDown size={16} /></>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CoursesEnrollmentOverview;
