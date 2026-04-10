import MetricCard from '@/components/shared/MetricCard'
import OverviewCard from '@/components/shared/OverviewCard'
import PerformanceCard from '@/components/shared/PerformanceCard'
import React from 'react'

// Analytics renders differently depending on context:
//  - Dashboard view: pass userCourses (shows total enrolled, completed/inProgress/timeSpent, overallProgress)
//  - Course detail view: pass courseData (shows Progress%, quizScore/lectureCompleted/timeSpent, overallPerformance)
function Analytics({ userCourses, courseData, name, className }) {

    // Build course-detail overrides from courseData when present
    const courseMetricProps = courseData ? {
        title: "Progress",
        value: `${courseData.progress ?? 0}%`,
        trendValue: `${courseData.improvementFromLastWeek ?? 0}%`,
        trendLabel: "Improvement From last Week",
    } : {};

    const courseOverviewStats = courseData ? {
        col1: courseData.overview ? { value: courseData.overview.completed ?? 0, label: "Completed", color: "#22C55E" } : { value: courseData.quizScore ?? "N/A", label: "Quiz Score", color: "#22C55E" },
        col2: courseData.overview ? { value: courseData.overview.inProgress ?? 0, label: "In Progress", color: "#3758EE" } : { value: courseData.lectureCompleted ?? 0, label: "Lecture Completed", color: "#3758EE" },
        col3: courseData.overview ? { value: courseData.overview.timeSpentLastWeek ?? "0h 0m", label: "Time Spent Last week", color: "#B666E7" } : { value: courseData.timeSpentLastWeek ?? "N/A", label: "Time Spent Last week", color: "#B666E7" },
    } : undefined;

    const coursePerformanceProps = courseData ? {
        percentageOverride: courseData.overallPerformance?.percentage ?? courseData.progress ?? 0,
        trendOverride: courseData.overallPerformance?.trendingUp ?? 0,
    } : {};

    return (
        <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 ${className} pb-4`}>
            <div className='xl:col-span-2 flex flex-col gap-6 justify-between'>
                <div className='w-full'>
                    <MetricCard
                        className="w-full"
                        userCourses={userCourses}
                        {...courseMetricProps}
                    />
                </div>
                <div className="w-full">
                    <OverviewCard
                        className="w-full max-w-full shadow-sm"
                        userCourses={userCourses}
                        statsOverride={courseOverviewStats}
                    />
                </div>
            </div>
            <PerformanceCard
                className="shadow-sm w-full"
                userCourses={userCourses}
                name={name || "Overall Performance"}
                {...coursePerformanceProps}
            />
        </div>
    )
}

export default Analytics