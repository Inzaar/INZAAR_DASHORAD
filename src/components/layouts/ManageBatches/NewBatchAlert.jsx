import React, { useState, useEffect } from 'react';
import { AlertCircle, BookOpen, Users } from 'lucide-react';
import BatchManagementModal from './BatchManagementModal';
import { getAllBatches } from '@/api/batch';
import { getAllEnrollments } from '@/api/enrollment';

const NewBatchAlert = () => {
    const [modalData, setModalData] = useState({ isOpen: false, initialTab: 'assign', activeBatch: null });
    const [unassignedBatches, setUnassignedBatches] = useState([]);

    const [isViewAllOpen, setIsViewAllOpen] = useState(false);

    useEffect(() => {
        const fetchUnassignedBatches = async () => {
            try {
                const [batchesData, enrollmentsRes] = await Promise.all([
                    getAllBatches(),
                    getAllEnrollments()
                ]);

                const allBatches = batchesData || [];
                const allEnrollments = enrollmentsRes?.data || [];

                const unassigned = allBatches.filter(b => !b.assignedModerator);

                // Sort to get newest first (latest notification)
                unassigned.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const batchesWithStats = unassigned.reduce((acc, batch) => {
                    const studentCount = allEnrollments.filter(e => {
                        const eBatchId = e.batchId?._id || e.batchId;
                        return eBatchId === batch._id;
                    }).length;

                    if (studentCount > 0) {
                        acc.push({
                            ...batch,
                            batchId: batch.name || batch._id.substring(0, 8),
                            courseName: batch.courseId?.title || 'Unknown Course',
                            studentsCount: `${studentCount} / ${batch.limit || 50}`,
                            createdDate: new Date(batch.createdAt).toLocaleDateString(),
                            status: 'Moderator Not Assigned'
                        });
                    }
                    return acc;
                }, []);

                setUnassignedBatches(batchesWithStats);

                // Close modal if no batches left
                if (batchesWithStats.length === 0) {
                    setIsViewAllOpen(false);
                }
            } catch (error) {
                console.error("Failed to fetch unassigned batches", error);
            }
        };
        
        // Only fetch on mount or when modal CLOSES (to refresh list after potentially assigning).
        // Fetching when it opens causes severe UI lag due to redundant heavy API calls.
        if (!modalData.isOpen) {
            fetchUnassignedBatches();
        }
    }, [modalData.isOpen]);

    const handleOpenModal = (tab = 'assign', batch) => {
        setModalData({ isOpen: true, initialTab: tab, activeBatch: batch });
    };

    const handleCloseModal = () => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    };

    if (unassignedBatches.length === 0) return null;

    const renderAlertCard = (batchData) => (
        <div key={batchData._id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex-shrink-0 w-full h-auto min-h-fit">
            {/* Top Section */}
            <div className="p-4 sm:p-5 md:p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                <div className="flex gap-4 sm:gap-6 items-start flex-1 min-w-0">
                    <div className="bg-red-50 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                        <AlertCircle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">New Batch Created</h3>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-full lg:max-w-2xl break-words">
                            A new batch has been created for Course: {batchData.courseName}. This batch currently has no moderator assigned.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-shrink-0">
                    <button
                        onClick={() => handleOpenModal('assign', batchData)}
                        className="w-full sm:w-auto px-6 py-2.5 border-2 border-[#5D5FEF] text-[#5D5FEF] rounded-lg font-bold text-xs sm:text-sm hover:bg-[#5D5FEF] hover:text-white transition-all active:scale-95 shadow-lg shadow-[#5D5FEF]/5 whitespace-nowrap"
                    >
                        Assign Moderator
                    </button>
                    <button
                        onClick={() => handleOpenModal('students', batchData)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right text-white rounded-lg font-bold text-xs sm:text-sm hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                    >
                        Adjust Students
                    </button>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="px-3 sm:px-4 pb-4 mt-auto">
                <div className="bg-[#F8F9FA] px-3 sm:px-6 py-4 sm:py-6 rounded-lg grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-y-4 gap-x-4 sm:gap-x-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="bg-[#5D5FEF]/10 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                            <BookOpen className="text-[#5D5FEF] w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Course</p>
                            <p className="text-[11px] font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-[400px]:whitespace-normal">{batchData.courseName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-[#5D5FEF]/10 p-2.5 rounded-lg flex-shrink-0">
                            <Users className="text-[#5D5FEF] w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Batch</p>
                            <p className="text-[13px] font-bold text-gray-700">{batchData.batchId}</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Students</p>
                        <p className="text-[13px] font-bold text-gray-700">{batchData.studentsCount}</p>
                    </div>

                    <div className="flex flex-col justify-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Status</p>
                        <p className="text-[13px] font-bold text-red-500">{batchData.status}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* Show only the latest notification */}
            {unassignedBatches.length > 0 && renderAlertCard(unassignedBatches[0])}

            {/* View All Button */}
            {unassignedBatches.length > 1 && (
                <div className="flex justify-center -mt-1 mb-2">
                    <button
                        onClick={() => setIsViewAllOpen(true)}
                        className="text-sm font-bold text-[#5D5FEF] hover:text-[#3758EE] hover:underline px-4 py-2 hover:bg-[#5D5FEF]/5 rounded-lg transition-colors"
                    >
                        View all notifications
                    </button>
                </div>
            )}

            {/* View All Modal */}
            {isViewAllOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#f8f9fa] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="flex justify-between items-center p-5 bg-white border-b shadow-sm z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-50 p-2 rounded-lg">
                                    <AlertCircle className="text-red-500 w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Unassigned Batches ({unassignedBatches.length})</h2>
                            </div>
                            <button
                                onClick={() => setIsViewAllOpen(false)}
                                className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl leading-none pb-1"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col gap-6 flex-1 min-h-0 pb-10 no-scrollbar">
                            {unassignedBatches.map(batchData => renderAlertCard(batchData))}
                        </div>
                    </div>
                </div>
            )}

            <BatchManagementModal
                isOpen={modalData.isOpen}
                onClose={handleCloseModal}
                batchData={modalData.activeBatch}
                initialTab={modalData.initialTab}
            />
        </div>
    );
};

export default NewBatchAlert;
