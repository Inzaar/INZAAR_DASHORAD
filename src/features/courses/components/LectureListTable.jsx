import React, { useState } from 'react';
import { Search, Lock, Unlock, FileText, Volume2, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const LectureListTable = ({ lectures, notes, onWatch, currentLectureId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter lectures based on search term (lecture number)
    const filteredLectures = lectures.filter(lecture =>
        lecture.lectureNo.toString().includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredLectures.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLectures = filteredLectures.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const formatDate = (date) => {
        if (!date) return '05-Feb-2025'; // Default match screenshot if missing
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/ /g, '-');
    };

    return (
        <div className="bg-white rounded-[20px] p-8 shadow-sm mt-8 border border-gray-100">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-[22px] font-bold text-gray-900">Lecture List</h2>
                    <p className="text-gray-400 text-sm">Manage your lecture</p>
                </div>
                <div className="flex w-full md:w-auto">
                    <div className="relative flex-1 md:w-[320px]">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by lecture no"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <button className="bg-[#6366F1] text-white px-6 py-2.5 rounded-r-lg flex items-center gap-2 hover:bg-[#5558e6] transition-colors">
                        <Search className="h-4 w-4" />
                        <span className="text-sm font-medium">Search</span>
                    </button>
                </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-4 font-semibold text-gray-700 text-[14px]">Lecture No</th>
                            <th className="pb-4 font-semibold text-gray-700 text-[14px]">Title</th>
                            <th className="pb-4 font-semibold text-gray-700 text-[14px]">Date</th>
                            <th className="pb-4 font-semibold text-gray-700 text-[14px]">Progress</th>
                            <th className="pb-4 font-semibold text-gray-700 text-[14px]">Status</th>
                            <th className="pb-4 font-semibold text-gray-700 text-[14px]">Comments</th>
                            <th className="pb-4 font-semibold text-gray-700 text-[14px]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {currentLectures.map((lecture, index) => {
                            const isCurrent = lecture.id === currentLectureId;
                            const progress = lecture.watchedPercentage || 0;
                            const lectureNotes = notes.filter(n => n.lectureId === lecture.id);
                            const latestNote = lectureNotes.length > 0 ? lectureNotes[lectureNotes.length - 1].text : 'N/A';

                            return (
                                <tr key={lecture.id} className={`${isCurrent ? 'bg-blue-50/30' : ''} hover:bg-gray-50/50 transition-colors`}>
                                    <td className="py-6 text-[13px] font-medium text-gray-600">#{String(lecture.lectureNo).padStart(2, '0')}</td>
                                    <td className="py-6 text-[13px] text-gray-700">{lecture.title}</td>
                                    <td className="py-6 text-[13px] text-gray-500">{formatDate(lecture.date)}</td>
                                    <td className="py-6 text-[13px] text-gray-700 font-medium">{String(progress).padStart(2, '0')}%</td>
                                    <td className="py-6">
                                        <div className="flex items-center justify-center gap-1">
                                            {lecture.isLocked ? (
                                                <>
                                                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-[12px] text-gray-400 font-medium">Locked</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Unlock className="w-3.5 h-3.5 text-yellow-500" />
                                                    <span className="text-[12px] text-gray-700 font-medium">Unlocked</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="relative mx-auto w-[160px] h-10 bg-white border border-gray-100 rounded p-1.5 overflow-hidden">
                                            <p className="text-[11px] text-gray-500 text-left line-clamp-2 leading-tight">
                                                {latestNote}
                                            </p>
                                            {latestNote !== 'N/A' && (
                                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-l-[6px] border-t-blue-500 border-l-transparent"></div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                disabled={!lecture.pdfUrl}
                                                onClick={() => window.open(lecture.pdfUrl, '_blank')}
                                                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${lecture.pdfUrl ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-100 text-red-300 cursor-not-allowed'}`}
                                            >
                                                <FileText size={14} />
                                            </button>
                                            <button
                                                disabled={!lecture.audioUrl}
                                                onClick={() => window.open(lecture.audioUrl, '_blank')}
                                                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${lecture.audioUrl ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]' : 'bg-[#EBF4FF] text-[#A5C8FF] cursor-not-allowed'}`}
                                            >
                                                <Volume2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => onWatch(lecture)}
                                                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${lecture.isLocked ? 'bg-[#EBF4FF] text-[#A5C8FF] cursor-not-allowed' : 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'}`}
                                            >
                                                <PlayCircle size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end mt-10 gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-40"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-8 h-8 rounded-md text-sm font-medium flex items-center justify-center transition-all ${currentPage === i + 1
                            ? 'bg-[#6366F1] text-white shadow-md shadow-blue-200'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-40"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default LectureListTable;
