import React, { useState, useEffect } from 'react';
import { AlertCircle, BookOpen, Users } from 'lucide-react';
import BatchManagementModal from './BatchManagementModal';
import { getAllLimits } from '@/api/limit';
import { getAllEnrollments } from '@/api/enrollment';

const NewBatchAlert = () => {
    const [modalData, setModalData] = useState({ isOpen: false, initialTab: 'assign', activeBatch: null });
    const [unassignedBatches, setUnassignedBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isViewAllOpen, setIsViewAllOpen] = useState(false);

    useEffect(() => {
        const fetchUnassignedBatches = async () => {
            setLoading(true);
            try {
                const [batchesData, enrollmentsRes] = await Promise.all([
                    getAllLimits(),
                    getAllEnrollments()
                ]);

                const allBatches = batchesData || [];
                const allEnrollments = enrollmentsRes?.data || [];

                const unassigned = allBatches.filter(b => !b.assignedModerator);

                // Sort to get newest first (latest notification)
                unassigned.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const batchesWithStats = unassigned.reduce((acc, batch) => {
                    const studentCount = allEnrollments.filter(e => {
                        const eLimitId = e.limitId?._id || e.limitId;
                        return String(eLimitId) === String(batch._id);
                    }).length;

                    if (studentCount > 0) {
                        const limit = batch.limit || 50;
                        acc.push({
                            ...batch,
                            displayGroupName: batch.name || batch._id.substring(0, 8),
                            courseName: batch.courseId?.title || 'Unknown Course',
                            genderType: batch.genderType || 'Unassigned',
                            studentsCount: `${studentCount} / ${limit}`,
                            isOverCapacity: studentCount > limit,
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
            } finally {
                setLoading(false);
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

    const renderSkeletonCard = () => (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex-shrink-0 w-full h-auto min-h-fit animate-pulse">
            {/* Top Section */}
            <div className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 xl:gap-6">
                <div className="flex gap-3 sm:gap-4 md:gap-5 items-start flex-1 min-w-0 w-full sm:w-auto">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gray-200 flex-shrink-0" />
                    <div className="min-w-0 flex-1 flex flex-col gap-1.5 sm:gap-2">
                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-36 sm:w-48" />
                        <div className="h-2.5 sm:h-3.5 bg-gray-200 rounded w-full max-w-md" />
                        <div className="h-2.5 sm:h-3.5 bg-gray-200 rounded w-2/3 max-w-sm" />
                    </div>
                </div>
                <div className="flex flex-row justify-center sm:justify-end gap-1.5 sm:gap-2.5 lg:gap-2 xl:gap-3 w-full sm:w-auto flex-shrink-0">
                    <div className="w-24 sm:w-28 xl:w-36 h-6 sm:h-7 xl:h-9 bg-gray-200 rounded sm:rounded-lg" />
                    <div className="w-24 sm:w-28 xl:w-36 h-6 sm:h-7 xl:h-9 bg-gray-200 rounded sm:rounded-lg" />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="px-3 sm:px-4 pb-4 mt-auto">
                <div className="bg-[#F8F9FA] px-3 sm:px-6 py-4 sm:py-6 rounded-lg flex sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-x-6 gap-y-4 overflow-x-auto pb-3 sm:pb-6 scrollbar-thin sm:overflow-visible">
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 sm:shrink min-w-[180px] sm:min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <div className="h-2.5 bg-gray-200 rounded w-12" />
                            <div className="h-3 bg-gray-200 rounded w-24" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:shrink min-w-[200px] sm:min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg flex-shrink-0" />
                        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                            <div className="h-2.5 bg-gray-200 rounded w-12" />
                            <div className="h-3 bg-gray-200 rounded w-24" />
                        </div>
                    </div>

                    <div className="flex flex-col justify-center shrink-0 sm:shrink min-w-[100px] sm:min-w-0 gap-1.5">
                        <div className="h-2.5 bg-gray-200 rounded w-14" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>

                    <div className="flex flex-col justify-center shrink-0 sm:shrink min-w-[160px] sm:min-w-0 gap-1.5">
                        <div className="h-2.5 bg-gray-200 rounded w-12" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col gap-2 sm:gap-4 mb-2.5 sm:mb-6">
                {renderSkeletonCard()}
            </div>
        );
    }

    if (unassignedBatches.length === 0) return null;

    const renderAlertCard = (batchData) => (
        <div key={batchData._id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex-shrink-0 w-full h-auto min-h-fit">
            {/* Top Section */}
            <div className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 xl:gap-6">
                <div className="flex gap-3 sm:gap-4 md:gap-5 items-start flex-1 min-w-0">
                    <div className="bg-red-50 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                        <AlertCircle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-[13.5px] sm:text-base md:text-lg font-bold text-gray-900 leading-tight">New Group Created</h3>
                        <p className="text-gray-500 text-[11px] sm:text-xs md:text-sm mt-0.5 sm:mt-1 max-w-full sm:max-w-[280px] md:max-w-[340px] lg:max-w-[340px] xl:max-w-2xl break-words leading-relaxed sm:leading-normal">
                            A new group has been created for Course: {batchData.courseName}. This group currently has no moderator assigned.
                        </p>
                    </div>
                </div>
                <div className="flex flex-row justify-center sm:justify-end gap-1.5 sm:gap-2.5 lg:gap-2 xl:gap-3 w-full sm:w-auto flex-shrink-0">
                    <button
                        onClick={() => handleOpenModal('assign', batchData)}
                        className="w-auto sm:w-auto px-2 sm:px-3.5 xl:px-6 py-0.5 sm:py-1.5 xl:py-2.5 border border-[#5D5FEF] sm:border-2 text-[#5D5FEF] rounded sm:rounded-lg font-bold text-[9px] sm:text-xs xl:text-sm hover:bg-[#5D5FEF] hover:text-white transition-all active:scale-95 shadow-sm sm:shadow-md shadow-[#5D5FEF]/5 whitespace-nowrap text-center cursor-pointer"
                    >
                        Assign Moderator
                    </button>
                    <button
                        onClick={() => handleOpenModal('students', batchData)}
                        className="w-auto sm:w-auto px-2 sm:px-3.5 xl:px-6 py-0.5 sm:py-1.5 xl:py-2.5 bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right text-white rounded sm:rounded-lg font-bold text-[9px] sm:text-xs xl:text-sm hover:shadow-lg transition-all active:scale-95 whitespace-nowrap text-center cursor-pointer"
                    >
                        Adjust Students
                    </button>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="px-3 sm:px-4 pb-4 mt-auto">
                <div className="bg-[#F8F9FA] px-3 sm:px-6 py-4 sm:py-6 rounded-lg flex sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-x-6 gap-y-4 overflow-x-auto pb-3 sm:pb-6 scrollbar-thin sm:overflow-visible">
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 sm:shrink min-w-[180px] sm:min-w-0">
                        <div className="bg-[#5D5FEF]/10 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                            <BookOpen className="text-[#5D5FEF] w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Course</p>
                            <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">{batchData.courseName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:shrink min-w-[200px] sm:min-w-0">
                        <div className="bg-[#5D5FEF]/10 p-2.5 rounded-lg flex-shrink-0">
                            <Users className="text-[#5D5FEF] w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Group</p>
                            <p className="text-[11.5px] sm:text-[13px] font-bold text-gray-700 whitespace-nowrap">
                                {batchData.displayGroupName || batchData.name}
                                {(batchData.genderType === 'Male' || batchData.genderType === 'Female') ? ` (${batchData.genderType})` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center shrink-0 sm:shrink min-w-[100px] sm:min-w-0">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Students</p>
                        <p className={`text-[11.5px] sm:text-[13px] font-bold flex items-center gap-1 ${batchData.isOverCapacity ? 'text-red-500' : 'text-gray-700'}`}>
                            {batchData.studentsCount}
                            {batchData.isOverCapacity && <AlertCircle className="w-3 h-3 text-red-500" title="Capacity exceeded" />}
                        </p>
                    </div>

                    <div className="flex flex-col justify-center shrink-0 sm:shrink min-w-[160px] sm:min-w-0">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Status</p>
                        <p className="text-[11.5px] sm:text-[13px] font-bold text-red-500 whitespace-nowrap">{batchData.status}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-2 sm:gap-4 mb-2.5 sm:mb-6">
            {/* Show only the latest notification */}
            {unassignedBatches.length > 0 && renderAlertCard(unassignedBatches[0])}

            {/* View All Button */}
            {unassignedBatches.length > 1 && (
                <div className="flex justify-center -mt-0.5 sm:-mt-1 mb-0 sm:mb-2">
                    <button
                        onClick={() => setIsViewAllOpen(true)}
                        className="text-[11px] sm:text-sm font-bold text-[#5D5FEF] hover:text-[#3758EE] hover:underline px-2.5 sm:px-4 py-0.5 sm:py-2 hover:bg-[#5D5FEF]/5 rounded-md sm:rounded-lg transition-colors"
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
                                <h2 className="text-lg font-bold text-gray-900">Unassigned Groups ({unassignedBatches.length})</h2>
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
