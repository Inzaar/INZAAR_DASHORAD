import CourseCard from '@/components/shared/CourseCard'
import React from 'react'
import { Loader } from 'lucide-react'

function EnrolledCourse({ userCourses = [], loading }) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {loading ? (
                <div className="h-[250px] w-full flex items-center justify-center">
                    <Loader className="w-8 h-8 text-[#3758EE] animate-spin" />
                </div>
            ) : userCourses?.length === 0 ? (
                <p className="text-gray-500 h-[160px] w-full flex items-center justify-center">No any course enrolled yet</p>
            ) : (
                userCourses?.map((course) => (
                    <CourseCard key={course._id} id={course._id} title={course.title} completed={course.completedLecturesCount} total={course.totalLectures} className="min-w-[300px] shadow-sm" image={course.thumbnail} />
                ))
            )}
        </div>
    )
}

export default EnrolledCourse