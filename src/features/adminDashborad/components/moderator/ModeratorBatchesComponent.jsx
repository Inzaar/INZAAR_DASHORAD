import { useTranslation } from 'react-i18next';
import SessionActivity from "@/components/shared/SessionActivity";
import ModeratorRoll from "./ModeratorRoll";
import AssignBatches from "./AssignBatches";
import course2 from "@/assets/images/course2.png";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState } from "react";
import Modal from "@/components/shared/Modal";
import BatchList from "./BatchList";

const ITEMS_PER_PAGE = 6;

function ModeratorBatchesComponent({ profileData, onEditClick, onViewDetails }) {
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const user = profileData?.user || {};
    const assignedBatches = profileData?.assignedBatches || [];

    // Pagination logic
    const totalPages = Math.ceil(assignedBatches.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentBatches = assignedBatches.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToPage = (page) => {
    const { t } = useTranslation();

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
                <div className="flex flex-col xl:flex-row w-full gap-[16px]">
                    <ModeratorRoll profileData={profileData} />
                    <SessionActivity profileData={profileData} />
                </div>
            </div>

            {/* Batches Cards Section */}
            <div className="mt-[12px] w-full ">
                <div className="w-full rounded-[10px]">
                    <div className="w-full">
                        {/* heading */}
                        <div className="w-full flex flex-row items-center justify-between gap-3 py-3 px-1 sm:px-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 shrink-0">Assigned Groups</h3>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={onEditClick}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setShowBatchModal(true)}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-all"
                                >
                                    Assign new group
                                </button>
                            </div>
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
                                            onViewDetails={() => onViewDetails && onViewDetails(batch.courseId?.title)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full py-10 text-center text-gray-400 italic">
                                    No groups assigned to this moderator yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pagination — functional */}
                {totalPages > 1 && (
                    <div className="flex justify-end items-center mt-8">
                        <CustomPagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={goToPage} 
                        />
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