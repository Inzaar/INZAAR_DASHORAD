import React, { useState } from 'react';
import { AlertCircle, BookOpen, Users } from 'lucide-react';
import BatchManagementModal from './BatchManagementModal';

const NewBatchAlert = () => {
    const [modalData, setModalData] = useState({ isOpen: false, initialTab: 'assign' });

    const handleOpenModal = (tab = 'assign') => {
        setModalData({ isOpen: true, initialTab: tab });
    };

    const handleCloseModal = () => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    };

    const batchData = {
        batchId: 'B-103',
        courseName: 'Quran Recitation (Tajweed)',
        studentsCount: '5 / 10',
        createdDate: '3/15/2026',
        status: 'Pending Moderator Assignment'
    };

    return (
        <>
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden mb-6">
                {/* Top Section */}
                <div className="p-4 sm:p-5 md:p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                    <div className="flex gap-4 sm:gap-6 items-start flex-1 min-w-0">
                        <div className="bg-red-50 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                            <AlertCircle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">New Batch Created</h3>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-full lg:max-w-2xl break-words">
                                A new batch has been created for Course: Quran Recitation (Tajweed). This batch currently has no moderator assigned.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-shrink-0">
                        <button
                            onClick={() => handleOpenModal('assign')}
                            className="w-full sm:w-auto px-6 py-2.5 border-2 border-[#5D5FEF] text-[#5D5FEF] rounded-lg font-bold text-xs sm:text-sm hover:bg-[#5D5FEF] hover:text-white transition-all active:scale-95 shadow-lg shadow-[#5D5FEF]/5 whitespace-nowrap"
                        >
                            Assign Moderator
                        </button>
                        <button
                            onClick={() => handleOpenModal('students')}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right text-white rounded-lg font-bold text-xs sm:text-sm hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                        >
                            Adjust Students
                        </button>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="px-3 sm:px-4 pb-4">
                    <div className="bg-[#F8F9FA] px-3 sm:px-6 py-4 sm:py-6 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 sm:gap-x-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-[#5D5FEF]/10 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                                <BookOpen className="text-[#5D5FEF] w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Course</p>
                                <p className="text-[11px] font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-[400px]:whitespace-normal">Quran Recitation (Tajweed)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-[#5D5FEF]/10 p-2.5 rounded-lg flex-shrink-0">
                                <Users className="text-[#5D5FEF] w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Batch</p>
                                <p className="text-[13px] font-bold text-gray-700">Batch 3</p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Students</p>
                            <p className="text-[13px] font-bold text-gray-700">5 / 10</p>
                        </div>

                        <div className="flex flex-col justify-center">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Status</p>
                            <p className="text-[13px] font-bold text-red-500">Moderator Not Assigned</p>
                        </div>
                    </div>
                </div>
            </div>

            <BatchManagementModal
                isOpen={modalData.isOpen}
                onClose={handleCloseModal}
                batchData={batchData}
                initialTab={modalData.initialTab}
            />
        </>
    );
};

export default NewBatchAlert;
