import React from 'react';
import { Hash, BookOpen, Users, Calendar } from 'lucide-react';

const BatchInformation = ({ data }) => {
    // Derive display values from the real batch data prop
    const batchId = data?.name || data?.batchId || (data?._id ? data._id.substring(0, 8) : 'N/A');
    const courseName = data?.courseId?.title || data?.courseName || 'Unknown Course';
    const studentsCount = data?.studentsCount || (data?.enrolledCount !== undefined
        ? `${data.enrolledCount} / ${data?.limit || 50}`
        : '— / —');
    const createdDate = data?.createdAt
        ? new Date(data.createdAt).toLocaleDateString()
        : data?.createdDate || 'N/A';

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
                        <p className="text-xs font-bold text-gray-700 truncate">{batchId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <BookOpen className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1.5">Course</p>
                        <p className="text-[10px] font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-[400px]:whitespace-normal">{courseName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <Users className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1.5">Students</p>
                        <p className="text-xs font-bold text-gray-700">{studentsCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <Calendar className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1.5">Created</p>
                        <p className="text-xs font-bold text-gray-700">{createdDate}</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-1">
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Status</p>
                <p className={`text-[11px] sm:text-xs font-bold ${data?.assignedModerator ? 'text-green-500' : 'text-red-500'}`}>
                    {data?.assignedModerator ? 'Moderator Assigned' : 'Moderator Not Assigned'}
                </p>
            </div>
        </div>
    );
};

export default BatchInformation;
