import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from "react-router-dom";

const AdminLectureList = ({ lectures, onWatch, id }) => {
    const { t } = useTranslation();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const itemsPerPage = 5;

    // Filter lectures by search query
    const filteredLectures = lectures.filter(l => 
        l.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        String(l.lectureNo).includes(searchQuery)
    );

    const totalPages = Math.ceil(filteredLectures.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredLectures.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="bg-white border border-[#EAEDF2] rounded-[16px] shadow-sm overflow-hidden mt-8 mb-10 w-full font-sans">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Lecture List</h3>
                        <p className="text-xs text-gray-400">Manage your lecture</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            <input
                                type="text"
                                placeholder="Search by lecture no or title"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button className="bg-[#6366F1] hover:bg-[#4f46e5] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors">
                            <Search size={16} /> <span>Search</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-w-0">
                    <div className="min-w-[800px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-400 font-bold uppercase border-b border-gray-100">
                                <th className="py-4 px-4 w-[10%]">Lecture No</th>
                                <th className="py-4 px-4 w-[25%]">Title</th>
                                <th className="py-4 px-4 w-[15%]">Date</th>
                                <th className="py-4 px-4 text-center w-[15%]">{t("progress", "Progress")}</th>
                                <th className="py-4 px-4 w-[15%]">{t("status", "Status")}</th>
                                <th className="py-4 px-4 w-[10%]">Comments</th>
                                <th className="py-4 px-4 text-center w-[10%]">{t("action", "Action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {currentData.length > 0 ? currentData.map((lecture, i) => (
                                <tr 
                                    key={lecture.id || i} 
                                    onClick={() => onWatch?.(lecture)}
                                    className={cn(
                                        "transition-colors text-sm text-gray-600 cursor-pointer group",
                                        (id === lecture.id || id === lecture._id) ? "bg-blue-50/50" : "hover:bg-gray-50/30"
                                    )}
                                >
                                    <td className="py-4 px-4 font-bold text-gray-800">#{String(lecture.lectureNo).padStart(2, '0')}</td>
                                    <td className="py-4 px-4 font-medium text-gray-800">{lecture.title}</td>
                                    <td className="py-4 px-4">{new Date(lecture.date || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}</td>
                                    <td className="py-4 px-4 text-center font-bold">N/A</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="text-[12px] font-bold text-blue-500">Unlocked</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-[12px] text-gray-500 truncate max-w-[120px]" title="No comments">
                                        N/A
                                    </td>
                                    <td className="py-4 px-4">
                                         <div className="flex items-center justify-center gap-2">
                                             <button 
                                                 onClick={(e) => {
                                                     e.stopPropagation();
                                                     onWatch?.(lecture);
                                                 }}
                                                 className={cn(
                                                     "p-1.5 rounded transition-colors",
                                                     (id === lecture.id || id === lecture._id) ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-500 hover:bg-blue-100"
                                                 )} 
                                                 title="Watch"
                                             >
                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                             </button>
                                             <button 
                                                 onClick={(e) => e.stopPropagation()}
                                                 className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors" 
                                                 title="Delete"
                                             >
                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                             </button>
                                             <button 
                                                 onClick={(e) => e.stopPropagation()}
                                                 className="p-1.5 bg-blue-50 text-blue-500 rounded hover:bg-blue-100 transition-colors" 
                                                 title="Edit"
                                             >
                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                             </button>
                                             <button 
                                                 onClick={(e) => e.stopPropagation()}
                                                 className="p-1.5 bg-indigo-50 text-indigo-500 rounded hover:bg-indigo-100 transition-colors" 
                                                 title="Message"
                                             >
                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                             </button>
                                         </div>
                                     </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center text-gray-500">No lectures found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-end items-center gap-1 sm:gap-2 mt-8 pb-4">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={`flex items-center gap-1 text-sm font-medium transition-colors ${currentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:text-[#7C3AED]'
                                }`}
                        >
                            <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePageChange(idx + 1)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-[12px] text-sm font-bold transition-all ${currentPage === idx + 1
                                        ? 'bg-gradient-to-br from-[#A5A6FF] to-[#7C3AED] text-white shadow-lg shadow-purple-200'
                                        : 'text-gray-500 hover:text-[#7C3AED] hover:bg-gray-50'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={`flex items-center gap-1 text-sm font-medium transition-colors ${currentPage === totalPages
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:text-[#7C3AED]'
                                }`}
                        >
                            <span className="hidden sm:inline">{t("next", "Next")}</span> <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLectureList;
