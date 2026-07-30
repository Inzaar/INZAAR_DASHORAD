import React, { useState, useEffect } from "react";
import { Trash2, AlertTriangle, Users, User, X, Loader2 } from "lucide-react";
import { getBatchesByCourse } from "@/api/batch";

const DeleteCourseModal = ({
    isOpen,
    onClose,
    onConfirm,
    courseId,
    courseTitle,
    loading: isDeleting
}) => {
    const [batches, setBatches] = useState([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && courseId) {
            const fetchBatches = async () => {
                try {
                    setLoadingBatches(true);
                    setError(null);
                    const data = await getBatchesByCourse(courseId);
                    setBatches(data || []);
                } catch (err) {
                    console.error("Error fetching batches for delete warning:", err);
                    setError("Failed to load attached batches information.");
                } finally {
                    setLoadingBatches(false);
                }
            };
            fetchBatches();
        } else {
            setBatches([]);
        }
    }, [isOpen, courseId]);

    if (!isOpen) return null;

    const totalStudents = batches.reduce((sum, b) => sum + (b.enrolledCount || 0), 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[540px] flex flex-col rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">Delete Course</h2>
                        <p className="text-xs text-gray-900 font-semibold line-clamp-1 mt-0.5">
                            {courseTitle || "Course Confirmation"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-modal-scrollbar">
                    
                    {/* Warning Box */}
                    <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-900">
                        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed">
                            <span className="font-bold block text-amber-950 mb-0.5">Warning: Deletion Impact</span>
                            Deleting this course will delete the course, lectures, quizzes, and all attached batches listed below.
                        </div>
                    </div>

                    {/* Batches Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Attached Batches ({batches.length})
                            </h3>
                            {totalStudents > 0 && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full">
                                    {totalStudents} Enrolled Student{totalStudents > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        {loadingBatches ? (
                            <div className="py-10 flex flex-col items-center justify-center gap-2 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                <Loader2 size={24} className="text-red-500 animate-spin" />
                                <span className="text-xs text-gray-500 font-medium">Loading batch details...</span>
                            </div>
                        ) : error ? (
                            <div className="p-4 border border-red-200 rounded-2xl bg-red-50 text-red-700 text-xs font-medium">
                                {error}
                            </div>
                        ) : batches.length === 0 ? (
                            <div className="py-8 px-4 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-gray-500 text-xs font-medium">
                                No batches are currently attached to this course.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {batches.map((batch) => (
                                    <div
                                        key={batch._id}
                                        className="p-3.5 bg-gray-50/80 hover:bg-gray-100/70 border border-gray-200/80 rounded-2xl transition-all space-y-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-bold text-gray-900 line-clamp-1">
                                                {batch.name}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                                                batch.genderType === 'Male'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                    : batch.genderType === 'Female'
                                                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                                {batch.genderType || "Unassigned"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 text-xs">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <User size={14} className="text-gray-400 shrink-0" />
                                                <span className="truncate">
                                                    Moderator: <strong className="text-gray-800 font-semibold">{batch.moderatorName || "Unassigned"}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-600 justify-end">
                                                <Users size={14} className="text-gray-400 shrink-0" />
                                                <span>
                                                    Students: <strong className="text-gray-800 font-semibold">{batch.enrolledCount || 0}</strong> / {batch.limit || 50}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-xs hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting || loadingBatches}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:from-red-600 hover:to-red-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={15} />
                                Confirm Delete
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-modal-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-modal-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-modal-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}} />
        </div>
    );
};

export default DeleteCourseModal;
