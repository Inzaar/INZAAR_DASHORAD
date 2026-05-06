import { useState } from "react";
import StatusRow from "./StatusRow";
import { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../Pagination";

function StatusTable({ userCourses, loading }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Use the specially crafted recent activity array from backend
    const allLectures = userCourses?.recentCourseActivity?.map((activity, index) => ({
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
    })) || [];

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

    if (loading || allLectures.length === 0) {
        return (
            <div className="mt-8 bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm mb-10">
                <h3 className="font-bold text-gray-900 mb-6">Current status</h3>
                <div className="overflow-x-auto no-scrollbar">
                    <div className="min-w-[1080px]">
                        <div className="h-[60px] w-full bg-white flex items-center justify-between font-bold border-b border-gray-100 mb-4">
                            <div className="w-[134px] flex items-center justify-center">Courses</div>
                            <div className="w-[134px] flex items-center justify-center">Lecture</div>
                            <div className="w-[134px] flex items-center justify-center">Title</div>
                            <div className="w-[134px] flex items-center justify-center">Date</div>
                            <div className="w-[134px] flex items-center justify-center">Progress</div>
                            <div className="w-[134px] flex items-center justify-center">Next Lecture</div>
                            <div className="w-[134px] flex items-center justify-center">Contact Moderator</div>
                            <div className="w-[134px] flex items-center justify-center">Comments</div>
                            <div className="w-[134px] flex items-center justify-center">Action</div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-center h-[100px]">
                                {loading ? (
                                    <p className="text-gray-500 animate-pulse italic">Wait, we're fetching your course data...</p>
                                ) : (
                                    <p className="text-gray-500">You have no enrolled courses yet !</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm mb-10">
            <h3 className="font-bold text-gray-900 mb-6">Current status</h3>
            <div className="overflow-x-auto no-scrollbar">
                <div className="min-w-[1080px]">
                    <div className="h-[60px] w-full bg-white flex items-center justify-between font-bold border-b border-gray-100 mb-4">
                        <div className="flex-1 min-w-[120px] flex items-center justify-center text-center">Courses</div>
                        <div className="flex-1 min-w-[120px] flex items-center justify-center text-center">Lecture</div>
                        <div className="flex-1 min-w-[120px] flex items-center justify-center text-center">Title</div>
                        <div className="flex-1 min-w-[120px] flex items-center justify-center text-center">Date</div>
                        <div className="flex-1 min-w-[120px] flex items-center justify-center text-center">Progress</div>
                        <div className="flex-1 min-w-[120px] flex items-center justify-center text-center">Next Lecture</div>
                        <div className="flex-1 min-w-[120px] flex items-center justify-center text-center">Contact Moderator</div>
                        <div className="flex-1 min-w-[120px] flex items-center justify-center text-center">Comments</div>
                        <div className="flex-1 min-w-[120px] flex items-center justify-center text-center">Action</div>
                    </div>
                    <div className="flex flex-col gap-4">
                        {currentData.map((item) => (
                            <StatusRow key={item.id} data={item} />
                        ))}
                    </div>
                </div>
            </div>
            <PaginationContent className="w-full h-10 mt-4 flex items-center justify-center md:justify-end">
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                            <PaginationEllipsis
                                onClick={() => {
                                    const blockSize = 4;
                                    const currentBlock = Math.ceil(currentPage / blockSize);
                                    if (page === 'ellipsis-start') {
                                        handlePageChange((currentBlock - 2) * blockSize + 1);
                                    } else {
                                        handlePageChange(currentBlock * blockSize + 1);
                                    }
                                }}
                                className="cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
                            />
                        ) : (
                            <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={page === currentPage}
                                className={page === currentPage ? "bg-linear-to-r from-[#A892FF] to-[#6C5DDC] text-white cursor-pointer border-none" : "cursor-pointer hover:bg-gray-100 border-none"}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
            </PaginationContent>

        </div>
    );
}

export default StatusTable;