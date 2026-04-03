import SessionActivity from "@/components/shared/SessionActivity";
import ModeratorRoll from "./ModeratorRoll";
import AssignBatches from "./AssignBatches";
import course2 from "@/assets/images/course2.png";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState } from "react";
import Modal from "@/components/shared/Modal";
import BatchList from "./BatchList";

const ITEMS_PER_PAGE = 3;

function ModeratorBatchesComponent({ profileData }) {
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const user = profileData?.user || {};
    const assignedBatches = user.assignedBatches || [];

    // Pagination logic
    const totalPages = Math.ceil(assignedBatches.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentBatches = assignedBatches.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div >
            {/* Top Section: Roll + Session */}
            <div className="mt-[20px] w-full">
                <div className="sm:flex-row lg:flex  gap-[16px]">
                    <ModeratorRoll profileData={profileData} />
                    <SessionActivity profileData={profileData} />
                </div>
            </div>

            {/* Batches Cards Section */}
            <div className="mt-[12px] w-full ">
                <div className="w-full rounded-[10px]">
                    <div className="w-full">
                        {/* heading */}
                        <div className="w-full h-[40px] flex justify-between items-center pt-[24px] pr-[14px] pb-[24px] pl-[14px]">
                            <h3 className="">Assigned Batches</h3>
                            <GradiantButton
                                onClick={() => setShowBatchModal(true)}
                                className="w-[159px] h-[40px] font-bold text-[14px] rounded-[4px]"
                            >
                                Assign new batch
                            </GradiantButton>
                        </div>

                        {/* cards — 3 per row, from API */}
                        <div className='w-full mt-[20px]'>
                            {currentBatches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {currentBatches.map((batch) => (
                                        <AssignBatches
                                            key={batch._id}
                                            image={batch.courseId?.thumbnail || course2}
                                            title={batch.courseId?.title || "Unknown Course"}
                                            students={batch.limit || "N/A"}
                                            moderators="01"
                                            performance="N/A"
                                            batch={batch.name || "N/A"}
                                            startDate={batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "N/A"}
                                            endDate={batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "N/A"}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full py-10 text-center text-gray-400 italic">
                                    No batches assigned to this moderator yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pagination — functional */}
                {totalPages > 1 && (
                    <div className="flex justify-end items-center gap-2 mt-8">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 text-sm font-medium transition ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            Previous
                        </button>

                        {getPageNumbers().map((page, idx) => (
                            page === "..." ? (
                                <span key={`dots-${idx}`} className="text-gray-400">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition ${
                                        currentPage === page
                                            ? "font-bold text-white bg-[#6366F1] shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 text-sm font-medium transition ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            Next
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Batch Modal */}
            <Modal isOpen={showBatchModal} onClose={() => setShowBatchModal(false)}>
                <BatchList onClose={() => setShowBatchModal(false)} moderatorId={user._id} />
            </Modal>
        </div>

    )
}

export default ModeratorBatchesComponent;