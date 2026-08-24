import MetricCard from '@/components/shared/MetricCard'
import OverviewCard from '@/components/shared/OverviewCard'
import PerformanceCard from '@/components/shared/PerformanceCard'
import React from 'react';
import { useTranslation } from 'react-i18next';

// Analytics renders differently depending on context:
//  - Dashboard view: pass userCourses (shows total enrolled, completed/inProgress/timeSpent, overallProgress)
//  - Course detail view: pass courseData (shows Progress%, quizScore/lectureCompleted/timeSpent, overallPerformance)
function Analytics({ userCourses, courseData, name, className }) {
    const { t } = useTranslation();

    // Build course-detail overrides from courseData when present
    const courseMetricProps = courseData ? {
        title: t("progress", "Progress"),
        value: `${courseData.progress ?? 0}%`,
        trendValue: `${courseData.improvementFromLastWeek ?? 0}%`,
        trendLabel: t("improvement_from_last_week", "Improvement From last Week"),
    } : {};

    const courseOverviewStats = courseData ? {
        ...(courseData.overview ? {
            col1: { value: courseData.overview.completed ?? 0, label: t("completed_courses", "Completed Courses"), color: "#22C55E" },
            col2: { value: courseData.overview.inProgress ?? 0, label: t("in_progress_courses", "In Progress Courses"), color: "#3758EE" },
            col3: { value: courseData.overview.timeSpentLastWeek ?? "0h 0m", label: t("time_spent_last_week", "Time Spent Last week"), color: "#B666E7" }
        } : {
            col1: courseData.quizScore !== undefined ? { value: courseData.quizScore, label: t("quiz_score", "Quiz Score"), color: "#22C55E" } : null,
            col2: { value: courseData.lectureCompleted ?? 0, label: t("lecture_completed", "Lecture Completed"), color: "#3758EE" },
            col3: { value: courseData.timeSpentLastWeek ?? "N/A", label: t("time_spent", "Time Spent"), color: "#B666E7" }
        })
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
                name={name || t("overall_performance", "Overall Performance")}
                {...coursePerformanceProps}
            />
        </div>
    )
}

export default Analytics