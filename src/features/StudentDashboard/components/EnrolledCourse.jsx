import CourseCard from '@/components/shared/CourseCard'
import React from 'react'

function EnrolledCourse({ userCourses = [] }) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {userCourses?.length === 0 && (
                <p className="text-gray-500 h-[160px] w-full flex items-center justify-center">No any course enrolled yet</p>
            )}
            {userCourses?.map((course) => (
                <CourseCard key={course.id} title={course.title} completed={course.completed} total={course.totalLectures} className="min-w-[300px] shadow-sm" image={course.thumbnail} />
            ))}
        </div>
    )
}

export default EnrolledCourse