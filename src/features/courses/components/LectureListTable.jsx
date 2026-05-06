import React, { useState } from 'react';
import { Search, Lock, Unlock, FileText, Volume2, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ResourceDropdown = ({ type, urls, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    if (!urls || urls.length === 0) return (
        <button disabled className={`w-7 h-7 rounded flex items-center justify-center opacity-40 cursor-not-allowed ${type === 'pdf' ? 'bg-red-100 text-red-300' : 'bg-[#EBF4FF] text-[#A5C8FF]'}`}>
            {children}
        </button>
    );

    if (urls.length === 1) return (
        <button 
            onClick={(e) => { e.stopPropagation(); window.open(urls[0], '_blank', 'noopener,noreferrer'); }}
            className={`w-7 h-7 rounded flex items-center justify-center transition-all ${type === 'pdf' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-7 h-7 rounded flex items-center justify-center transition-all relative ${type === 'pdf' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'}`}
            >
                {children}
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 text-black text-[8px] font-bold rounded-full border border-white flex items-center justify-center">
                    {urls.length}
                </span>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {urls.map((url, i) => (
                            <button
                                key={i}
                                onClick={() => { window.open(url, '_blank', 'noopener,noreferrer'); setIsOpen(false); }}
                                className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 truncate"
                            >
                                {type.toUpperCase()} {i + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

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
            <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0">
                <div className="min-w-[1000px] px-4 sm:px-0">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-4 font-semibold text-gray-700 text-[14px] whitespace-nowrap">Lecture No</th>
                                <th className="pb-4 font-semibold text-gray-700 text-[14px] whitespace-nowrap">Title</th>
                                <th className="pb-4 font-semibold text-gray-700 text-[14px] whitespace-nowrap">Date</th>
                                <th className="pb-4 font-semibold text-gray-700 text-[14px] whitespace-nowrap">Progress</th>
                                <th className="pb-4 font-semibold text-gray-700 text-[14px] whitespace-nowrap">Status</th>
                                <th className="pb-4 font-semibold text-gray-700 text-[14px] whitespace-nowrap">Comments</th>
                                <th className="pb-4 font-semibold text-gray-700 text-[14px] whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentLectures.map((lecture, index) => {
                                const isCurrent = lecture.id === currentLectureId;
                                const progress = lecture.watchedPercentage || 0;
                                const lectureNotes = notes.filter(n => n.lectureId === lecture.id);
                                const latestNote = lectureNotes.length > 0 ? lectureNotes[lectureNotes.length - 1].text : 'N/A';

                                const displayLectureNo = typeof lecture.lectureNo === 'string' && lecture.lectureNo.startsWith('#')
                                    ? lecture.lectureNo
                                    : `#${String(lecture.lectureNo).padStart(2, '0')}`;

                                return (
                                    <tr key={lecture.id} className={`${isCurrent ? 'bg-blue-50/30' : ''} hover:bg-gray-50/50 transition-colors`}>
                                        <td className="py-6 text-[13px] font-medium text-gray-600 whitespace-nowrap">{displayLectureNo}</td>
                                        <td className="py-6 text-[13px] text-gray-700 whitespace-nowrap">{lecture.title}</td>
                                        <td className="py-6 text-[13px] text-gray-500 whitespace-nowrap">{formatDate(lecture.date)}</td>
                                        <td className="py-6 text-[13px] text-gray-700 font-medium whitespace-nowrap">{String(progress).padStart(2, '0')}%</td>
                                        <td className="py-6 whitespace-nowrap">
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
                                                <ResourceDropdown type="pdf" urls={Array.isArray(lecture.pdfUrl) ? lecture.pdfUrl : (lecture.pdfUrl ? [lecture.pdfUrl] : [])}>
                                                    <FileText size={14} />
                                                </ResourceDropdown>
                                                <ResourceDropdown type="audio" urls={Array.isArray(lecture.audioUrl) ? lecture.audioUrl : (lecture.audioUrl ? [lecture.audioUrl] : [])}>
                                                    <Volume2 size={14} />
                                                </ResourceDropdown>
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
