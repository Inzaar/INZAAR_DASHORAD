import { useState } from "react";
import StatusRow from "./StatusRow";
import { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../Pagination";

function StatusTable({ userCourses }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Use the specially crafted recent activity array from backend
    const allLectures = userCourses?.recentCourseActivity?.map((activity, index) => ({
        id: index,
        course: activity.course,
        lecture: activity.lecture,
        title: activity.title,
        date: activity.date,
        progress: activity.progress,
        status: activity.nextLectureStatus,
        comments: activity.comments
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

    // Helper to generate pagination items (Smart Pagination)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('ellipsis-start');

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) end = 4;
            if (currentPage >= totalPages - 2) start = totalPages - 3;

            for (let i = start; i <= end; i++) {
                if (i > 1 && i < totalPages) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('ellipsis-end');
            pages.push(totalPages);
        }
        return pages;
    };

    if (allLectures.length === 0) {
        return (
            <div className="mt-8 bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm mb-10 overflow-x-auto no-scrollbar">
                <h3 className="font-bold text-gray-900 mb-6">Current status</h3>
                <div className="min-w-[1080px]">
                    <div className="h-[60px] w-full bg-white flex items-center justify-between font-bold border-b border-gray-100 mb-4">
                        <div className="w-[134px]  flex items-center justify-center">Courses</div>
                        <div className="w-[134px] flex items-center justify-center">Lecture</div>
                        <div className="w-[134px] flex items-center justify-center">Title</div>
                        <div className="w-[134px] flex items-center justify-center">Date</div>
                        <div className="w-[134px] flex items-center justify-center">Progress</div>
                        <div className="w-[134px] flex items-center justify-center">Next Lecture</div>
                        <div className="w-[134px] flex items-center justify-center">Comments</div>
                        <div className="w-[134px] flex items-center justify-center">Action</div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center h-[100px]">
                            <p className="text-gray-500">You have no enrolled courses yet !</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm mb-10 overflow-x-auto no-scrollbar">
            <h3 className="font-bold text-gray-900 mb-6">Current status</h3>
            <div className="min-w-[1080px]">
                <div className="h-[60px] w-full bg-white flex items-center justify-between font-bold border-b border-gray-100 mb-4">
                    <div className="flex-1 min-w-[120px] flex items-center justify-center">Courses</div>
                    <div className="flex-1 min-w-[120px] flex items-center justify-center">Lecture</div>
                    <div className="flex-1 min-w-[120px] flex items-center justify-center">Title</div>
                    <div className="flex-1 min-w-[120px] flex items-center justify-center">Date</div>
                    <div className="flex-1 min-w-[120px] flex items-center justify-center">Progress</div>
                    <div className="flex-1 min-w-[120px] flex items-center justify-center">Next Lecture</div>
                    <div className="flex-1 min-w-[120px] flex items-center justify-center">Comments</div>
                    <div className="flex-1 min-w-[120px] flex items-center justify-center">Action</div>
                </div>
                <div className="flex flex-col gap-4">
                    {currentData.map((item) => (
                        <StatusRow key={item.id} data={item} />
                    ))}
                </div>
            </div>
            <PaginationContent className="w-full h-10 mt-4 flex items-center justify-end">
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={page === currentPage}
                                className={page === currentPage ? "bg-linear-to-r from-[#A892FF] to-[#6C5DDC] text-white cursor-pointer" : "cursor-pointer hover:bg-gray-100"}
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