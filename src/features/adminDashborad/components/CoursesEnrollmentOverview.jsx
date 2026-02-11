import React from 'react';
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

const CoursesEnrollmentOverview = () => {
    const row1 = [
        { count: 105, trend: '15%', trendDirection: 'down', name: 'Akhrat kay Dalail' },
        { count: 56, trend: '21%', trendDirection: 'up', name: 'Dora Quran Course' },
        { count: 42, trend: '11%', trendDirection: 'up', name: 'Imaniyaat Course' },
        { count: 13, trend: '01%', trendDirection: 'down', name: 'Stress Management' },
        { count: 54, trend: '11%', trendDirection: 'up', name: 'c' },
        { count: 22, trend: '05%', trendDirection: 'up', name: 'Namaz Courses' },
    ];

    const row2 = [
        { count: 29, trend: '1%', trendDirection: 'down', name: 'Nabuwat and Risalat' },
        { count: 85, trend: '5%', trendDirection: 'up', name: 'Roza & Itikaf Course' },
        { count: 54, trend: '21%', trendDirection: 'down', name: 'Quran ka Rabbani Insaan' },
        { count: 57, trend: '21%', trendDirection: 'up', name: 'delivery under review' },
        { count: 22, trend: '21%', trendDirection: 'down', name: 'Quran ka Matloob Insaan' },
    ];

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 font-sans">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[18px] font-bold text-[#64748b]">Courses Enrollment Overview</h3>
                <GradiantButton className="px-5 py-2 text-[12px] font-bold rounded-lg shadow-sm">View All courses</GradiantButton>
            </div>

            <div className="flex flex-col divide-y divide-gray-50/80">
                {/* Row 1 */}
                <div className="flex items-start justify-between pb-8 w-full overflow-x-auto no-scrollbar">
                    {row1.map((item, index) => (
                        <CourseStatItem
                            key={index}
                            {...item}
                            isLast={index === row1.length - 1}
                        />
                    ))}
                </div>

                {/* Row 2 */}
                <div className="flex items-start justify-between pt-8 w-full overflow-x-auto no-scrollbar">
                    {row2.map((item, index) => (
                        <CourseStatItem
                            key={index}
                            {...item}
                            isLast={index === row2.length - 1}
                        />
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        </div>
    );
};

export default CoursesEnrollmentOverview;
