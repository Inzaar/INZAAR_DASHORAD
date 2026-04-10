import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { BiSolidUpArrow } from "react-icons/bi";
import { BiSolidDownArrow } from "react-icons/bi";

const CourseStatItem = ({ count, trend, trendDirection, name, isLast }) => {
    return (
        <div className={`flex flex-col items-center justify-center p-4 flex-1 ${!isLast ? 'border-r border-gray-100' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[28px] font-bold text-[#0f172a]">{count}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 ${trendDirection === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {trend}
                </span>
                <span>
                    {trendDirection === 'up' ? (
                        <BiSolidUpArrow className='text-green-600' />
                    ) : (
                        <BiSolidDownArrow className='text-red-500' />
                    )}
                </span>
            </div>
            <span className="text-[13px] font-medium text-[#64748b] text-center line-clamp-2 max-w-[140px]">{name}</span>
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
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[18px] font-bold text-[#64748b]">Courses Enrollment Overview</h3>
                {showViewAll && (
                    <GradiantButton 
                        onClick={onViewAllClick}
                        className="px-5 py-2 text-[12px] font-bold rounded-lg shadow-sm"
                    >
                        View All courses
                    </GradiantButton>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-y-8">
                {displayedStats.map((item, index) => (
                    <CourseStatItem
                        key={index}
                        {...item}
                        isLast={false}
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
