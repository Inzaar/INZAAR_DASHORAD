import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// from "react";
import StatusRow from "./StatusRow";
import { CustomPagination } from "@/components/ui/Pagination";

function StatusTable({ userCourses, loading }) {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Use the specially crafted recent activity array from backend,
    // deduplicating consecutive identical watches while preserving entries with a gap
    const rawActivity = userCourses?.recentCourseActivity || [];
    const dedupedActivity = [];
    for (const activity of rawActivity) {
        if (dedupedActivity.length === 0) {
            dedupedActivity.push(activity);
            continue;
        }
        const last = dedupedActivity[dedupedActivity.length - 1];
        const sameCourse = String(activity.courseId || activity.course) === String(last.courseId || last.course);
        const sameLecture = String(activity.lectureId || activity.lecture) === String(last.lectureId || last.lecture);
        if (sameCourse && sameLecture) {
            continue; // Skip consecutive duplicate, keep the latest one
        }
        dedupedActivity.push(activity);
    }

    const allLectures = dedupedActivity.map((activity, index) => ({
        id: index,
        course: activity.course,
        courseId: activity.courseId,
        lectureId: activity.lectureId,
        lecture: activity.lecture,
        title: activity.title,
        date: activity.date,
        progress: activity.progress,
        status: activity.nextLectureStatus,
        comments: activity.comments,
        moderatorName: activity.moderatorName,
        moderatorContact: activity.moderatorContact
    }));

    const totalPages = Math.ceil(allLectures.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = allLectures.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
        console.log("current data", currentData);
    };

    // Helper to generate pagination items (Block-based Pagination with First/Last)
    const getPageNumbers = () => {
        const pages = [];
        const blockSize = 4;
        const currentBlock = Math.ceil(currentPage / blockSize);
        const start = (currentBlock - 1) * blockSize + 1;
        const end = Math.min(start + blockSize - 1, totalPages);

        // Add page 1 if not in start of block
        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('ellipsis-start');
        }

        // Add pages in current block
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Add last page if not in end of block
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('ellipsis-end');
            pages.push(totalPages);
        }

        // Deduplicate in case 1 or totalPages are already in the block
        return [...new Set(pages)];
    };

    return (
        <div className="mt-4 sm:mt-8 bg-white rounded-[16px] sm:rounded-[20px] border border-gray-100 p-3 sm:p-5 md:p-6 shadow-sm mb-1 sm:mb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-6 gap-3">
                <div>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">{t("current_status", "Current status")}</h2>
                </div>
            </div>

            {/* Table view */}
            <div className="overflow-x-auto small-scroller -mx-1 sm:mx-0">
                <div className="w-full min-w-[760px] md:min-w-full px-1 sm:px-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/90 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
                            <tr className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-2.5 py-2 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-left whitespace-nowrap">{t("courses", "Courses")}</th>
                                <th className="px-2 py-2 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">{t("lecture", "Lecture")}</th>
                                <th className="px-2.5 py-2 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-left min-w-[130px] sm:min-w-[160px] md:min-w-[200px]">{t("title", "Title")}</th>
                                <th className="px-2 py-2 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">{t("date", "Date")}</th>
                                <th className="px-2 py-2 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">{t("progress", "Progress")}</th>
                                <th className="px-2 py-2 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">{t("next_lecture", "Next Lecture")}</th>
                                <th className="px-2 py-2 sm:px-3 sm:py-3.5 md:px-4 md:py-4 text-center whitespace-nowrap">{t("comments", "Comments")}</th>
                                <th className="px-2 py-2 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-center whitespace-nowrap">{t("action", "Action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="text-xs sm:text-sm border-b border-gray-100 animate-pulse">
                                        <td className="px-2.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                                            <div className="h-3.5 w-24 bg-gray-200 rounded" />
                                        </td>
                                        <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 text-center">
                                            <div className="h-3.5 w-10 bg-gray-200 rounded mx-auto" />
                                        </td>
                                        <td className="px-2.5 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                                            <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
                                        </td>
                                        <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 text-center">
                                            <div className="h-3.5 w-16 bg-gray-200 rounded mx-auto" />
                                        </td>
                                        <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 text-center">
                                            <div className="h-3.5 w-10 bg-gray-200 rounded mx-auto" />
                                        </td>
                                        <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 text-center">
                                            <div className="h-5 w-16 bg-gray-200 rounded-full mx-auto" />
                                        </td>
                                        <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 text-center">
                                            <div className="h-5 w-12 bg-gray-200 rounded-full mx-auto" />
                                        </td>
                                        <td className="px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-center">
                                            <div className="h-7 w-20 bg-gray-200 rounded-lg mx-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : allLectures.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-xs sm:text-sm text-gray-400">
                                        {t("no_enrolled_courses_yet", "You have no enrolled courses yet !")}
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((item) => (
                                    <StatusRow key={item.id} data={item} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center sm:justify-end items-center mt-3 sm:mt-5 w-full">
                    <CustomPagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                    />
                </div>
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
                    .small-scroller::-webkit-scrollbar {
                        width: 4px;
                        height: 4px;
                    }
                    .small-scroller::-webkit-scrollbar-track {
                        background: #f8fafc;
                        border-radius: 9999px;
                    }
                    .small-scroller::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 9999px;
                    }
                    .small-scroller::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8;
                    }
                    .small-scroller {
                        scrollbar-width: thin;
                        scrollbar-color: #cbd5e1 #f8fafc;
                    }
                `
            }} />
        </div>
    );
}

export default StatusTable;