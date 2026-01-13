import CourseCard from '@/components/shared/CourseCard'
import React from 'react'

function EnrolledCourse() {
    return (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <CourseCard title="Quran Recitation (Tajweed)" completed={14} total={30} className="min-w-[300px] shadow-sm" />
            <CourseCard title="Quran Recitation (Tajweed)" completed={8} total={30} className="min-w-[300px] shadow-sm" />
            <CourseCard title="Quran Recitation (Tajweed)" completed={1} total={30} className="min-w-[300px] shadow-sm" />
            <CourseCard title="Quran Recitation (Tajweed)" completed={8} total={30} className="min-w-[300px] shadow-sm" />
            <CourseCard title="Quran Recitation (Tajweed)" completed={8} total={30} className="min-w-[300px] shadow-sm" />
            <CourseCard title="Quran Recitation (Tajweed)" completed={8} total={30} className="min-w-[300px] shadow-sm" />
            <CourseCard title="Quran Recitation (Tajweed)" completed={8} total={30} className="min-w-[300px] shadow-sm" />
        </div>
    )
}

export default EnrolledCourse