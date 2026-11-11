import CourseCard from '@/components/shared/CourseCard'
import React from 'react';
import { useTranslation } from 'react-i18next';

function EnrolledCourse({ userCourses = [], loading }) {
    const { t } = useTranslation();
    return (
        <div 
            className={`flex gap-5 pb-2 no-scrollbar ${
                !loading && userCourses?.length > 0 && userCourses.length < 3 
                    ? 'justify-center items-center' 
                    : 'justify-start overflow-x-auto'
            }`} 
            style={{ scrollbarWidth: 'none' }}
        >
            {loading ? (
                <>
                    {[1, 2, 3].map((item) => (
                        <div 
                            key={item}
                            className="w-[301px] h-[250px] bg-white rounded-[10px] border border-gray-200/80 p-[10px] flex flex-col gap-[10px] shadow-sm animate-pulse shrink-0"
                        >
                            {/* Image Skeleton */}
                            <div className="w-full min-h-[140px] flex-1 rounded-[6px] bg-gray-200"></div>

                            {/* Content Skeleton */}
                            <div className="flex flex-col gap-2 min-w-0 w-full overflow-hidden">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>

                                {/* Progress Section Skeleton */}
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <div className="flex justify-end">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            ) : userCourses?.length === 0 ? (
                <p className="text-gray-500 h-[160px] w-full flex items-center justify-center">{t('no_any_course_enrolled_yet', 'No any course enrolled yet')}</p>
            ) : (
                userCourses?.map((course) => (
                    <CourseCard 
                        key={course._id || course.courseId || course.id} 
                        id={course._id || course.courseId || course.id} 
                        enrollmentId={course.enrollmentId} 
                        title={course.title} 
                        completed={course.completedLecturesCount} 
                        total={course.totalLectures} 
                        className="min-w-[300px] shadow-sm shrink-0" 
                        image={course.thumbnail} 
                        batchStartDate={course.batchStartDate} 
                    />
                ))
            )}
        </div>
    )
}

export default EnrolledCourse