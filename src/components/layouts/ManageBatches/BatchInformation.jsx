import React from 'react';
import { Hash, BookOpen, Users, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

const BatchInformation = ({ data }) => {
    // Derive display values from the real batch data prop
    const batchIdBase = data?.name || data?.batchId || (data?._id ? data._id.substring(0, 8) : 'N/A');
    const genderSuffix = (data?.genderType === 'Male' || data?.genderType === 'Female') ? ` (${data.genderType})` : '';
    const batchId = `${batchIdBase}${genderSuffix}`;
    const courseName = data?.courseId?.title || data?.courseName || 'Unknown Course';
    const studentsCount = data?.studentsCount || (data?.enrolledCount !== undefined
        ? `${data.enrolledCount} / ${data?.limit || 50}`
        : '— / —');
    const createdDate = data?.createdAt
        ? new Date(data.createdAt).toLocaleDateString()
        : data?.createdDate || 'N/A';

    return (
        <div className="bg-[#F8F9FA] p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm shrink-0">
            <h3 className="text-gray-900 font-bold mb-2 sm:mb-2.5 text-xs sm:text-sm tracking-tight">Group Information</h3>
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 custom-horizontal-scrollbar">
                <div className="flex items-center gap-2.5 shrink-0 min-w-[140px]">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <Hash className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">Group ID</p>
                        <p className="text-xs font-bold text-gray-700 whitespace-nowrap">{batchId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 min-w-[140px]">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <BookOpen className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">Course</p>
                        <p className="text-xs font-bold text-gray-700 whitespace-nowrap">{courseName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 min-w-[100px]">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <Users className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">Students</p>
                        <p className="text-xs font-bold text-gray-700 whitespace-nowrap">{studentsCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 min-w-[100px]">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-50 flex-shrink-0">
                        <Calendar className="text-[#3758EE] w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">Created</p>
                        <p className="text-xs font-bold text-gray-700 whitespace-nowrap">{createdDate}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 min-w-[160px]">
                    <div className={`p-2 rounded-lg shadow-sm border flex-shrink-0 ${data?.assignedModerator ? 'bg-green-50 border-green-100 text-green-500' : 'bg-red-50 border-red-100 text-red-500'}`}>
                        {data?.assignedModerator ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">Status</p>
                        <p className={`text-xs font-bold whitespace-nowrap ${data?.assignedModerator ? 'text-green-500' : 'text-red-500'}`}>
                            {data?.assignedModerator ? 'Moderator Assigned' : 'Moderator Not Assigned'}
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-horizontal-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-horizontal-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .custom-horizontal-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-horizontal-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .custom-horizontal-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 #f1f5f9;
                }
            `}} />
        </div>
    );
};

export default BatchInformation;
