import React from 'react';
import { Hash, BookOpen, Users, Calendar } from 'lucide-react';

const BatchInformation = ({ data }) => {
    return (
        <div className="bg-[#F8F9FA] p-3 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-gray-900 font-bold mb-3 sm:mb-5 text-sm tracking-tight">Batch Information</h3>
            <div className="grid grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-8 mb-3 sm:mb-5">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <Hash className="text-[#3758EE] w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1.5">Batch ID</p>
                        <p className="text-xs font-bold text-gray-700">B-103</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <BookOpen className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1.5">Course</p>
                        <p className="text-[10px] font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-[400px]:whitespace-normal">Quran Recitation (Tajweed)</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <Users className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1.5">Students</p>
                        <p className="text-xs font-bold text-gray-700">5 / 10</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <Calendar className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1.5">Created</p>
                        <p className="text-xs font-bold text-gray-700">3/15/2026</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-1">
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Status</p>
                <p className="text-[11px] sm:text-xs font-bold text-red-500">{data?.status || 'Pending Moderator Assignment'}</p>
            </div>
        </div>
    );
};

export default BatchInformation;
