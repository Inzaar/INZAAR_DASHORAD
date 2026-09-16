import React from "react";
import { X, CalendarPlus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, isBefore, isAfter, isSameDay, differenceInDays } from "date-fns";

const SemesterBatchesListModal = ({ isOpen, onClose, batches, onOpenScheduleModal, onEditBatch, onDeleteBatch }) => {
    if (!isOpen) return null;

    const now = new Date();

    // Separate batches into running and upcoming (and maybe completed)
    const runningBatches = batches.filter(b => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        return (isBefore(start, now) || isSameDay(start, now)) && (isAfter(end, now) || isSameDay(end, now));
    });
    
    const upcomingBatches = batches.filter(b => 
        isAfter(new Date(b.startDate), now) && !isSameDay(new Date(b.startDate), now)
    );

    const pastBatches = batches.filter(b => 
        isBefore(new Date(b.endDate), now) && !isSameDay(new Date(b.endDate), now)
    );

    const renderBatchList = (title, list) => {
        if (list.length === 0) return null;
        
        return (
            <div className="mb-6 last:mb-0">
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">{title}</h3>
                <div className="space-y-3">
                    {list.map((batch, idx) => {
                        const start = new Date(batch.startDate);
                        const end = new Date(batch.endDate);
                        return (
                        <div key={batch._id || idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500">
                                    <CalendarIcon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        {batch.name || "Unnamed Batch"}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {format(start, "MMM dd, yyyy")} - {format(end, "MMM dd, yyyy")}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Clock size={12} />
                                        {differenceInDays(end, start)} days duration
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                                    title === "Running" ? "bg-emerald-100 text-emerald-700" : 
                                    title === "Upcoming" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
                                }`}>
                                    {title}
                                </span>
                                {title !== "Completed" && (
                                    <>
                                        <button 
                                            onClick={() => onEditBatch(batch)}
                                            className="p-1.5 bg-white text-gray-500 hover:text-[#3758EE] hover:bg-blue-50 border border-gray-200 rounded-lg shadow-sm transition-colors"
                                            title="Edit Batch"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                        </button>
                                        <button 
                                            onClick={() => onDeleteBatch(batch._id)}
                                            className="p-1.5 bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-lg shadow-sm transition-colors"
                                            title="Delete Batch"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <h2 className="text-lg font-bold text-gray-900">Semester Batches</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onOpenScheduleModal}
                            className="flex items-center gap-2 px-4 py-2 bg-[#3758EE] text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
                        >
                            <CalendarPlus size={16} />
                            <span className="hidden sm:inline">New Batch Schedule</span>
                            <span className="sm:hidden">New</span>
                        </button>
                        <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    {batches && batches.length > 0 ? (
                        <>
                            {renderBatchList("Running", runningBatches)}
                            {renderBatchList("Upcoming", upcomingBatches)}
                            {renderBatchList("Completed", pastBatches)}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CalendarIcon className="text-gray-400" size={24} />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">No Batches Found</h3>
                            <p className="text-gray-500 text-sm">There are no semester batches scheduled for this course yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SemesterBatchesListModal;
