import React, { useState, useEffect } from "react";
import { Trash2, AlertTriangle, Users, User, X, Loader2 } from "lucide-react";
import { getBatchById } from "@/api/batch";

const DeleteBatchModal = ({
    isOpen,
    onClose,
    onConfirm,
    batch,
    loading: isDeleting
}) => {
    const [batchDetails, setBatchDetails] = useState(null);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [error, setError] = useState(null);

    const batchId = batch?._id || batch?.id;
    const batchName = batch?.name || "Unnamed Batch";

    useEffect(() => {
        if (isOpen && batchId) {
            const fetchBatchDetails = async () => {
                try {
                    setLoadingGroups(true);
                    setError(null);
                    const data = await getBatchById(batchId);
                    setBatchDetails(data);
                } catch (err) {
                    console.error("Error fetching batch details for deletion warning:", err);
                    setError("Failed to load attached groups information.");
                } finally {
                    setLoadingGroups(false);
                }
            };
            fetchBatchDetails();
        } else {
            setBatchDetails(null);
            setError(null);
        }
    }, [isOpen, batchId]);

    if (!isOpen) return null;

    const groups = batchDetails?.groups || [];
    const totalStudents = groups.reduce((sum, g) => sum + (g.currentEnrollment || 0), 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[540px] flex flex-col rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">Delete Batch</h2>
                        <p className="text-xs text-gray-700 font-semibold line-clamp-1 mt-0.5">
                            {batchName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
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
                            Deleting this batch will permanently delete all groups associated with this batch, and all student enrollments in those groups will also be deleted.
                        </div>
                    </div>

                    {/* Groups Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Associated Groups ({groups.length})
                            </h3>
                            {totalStudents > 0 && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full">
                                    {totalStudents} Enrolled Student{totalStudents > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        {loadingGroups ? (
                            <div className="py-10 flex flex-col items-center justify-center gap-2 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                <Loader2 size={24} className="text-red-500 animate-spin" />
                                <span className="text-xs text-gray-500 font-medium">Loading attached groups...</span>
                            </div>
                        ) : error ? (
                            <div className="p-4 border border-red-200 rounded-2xl bg-red-50 text-red-700 text-xs font-medium">
                                {error}
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="py-8 px-4 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-gray-500 text-xs font-medium">
                                No groups are currently attached to this batch.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {groups.map((group) => {
                                    const moderatorName = group.assignedModerator 
                                        ? `${group.assignedModerator.firstname || ""} ${group.assignedModerator.lastname || ""}`.trim() || group.assignedModerator.name || group.assignedModerator.username
                                        : "Unassigned";

                                    return (
                                        <div
                                            key={group._id}
                                            className="p-3.5 bg-gray-50/80 hover:bg-gray-100/70 border border-gray-200/80 rounded-2xl transition-all space-y-2"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-bold text-gray-900 line-clamp-1">
                                                    {group.name}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                                                    group.genderType === 'Male'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : group.genderType === 'Female'
                                                        ? 'bg-pink-50 text-pink-700 border-pink-200'
                                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}>
                                                    {group.genderType || "Unassigned"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 text-xs">
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <User size={14} className="text-gray-400 shrink-0" />
                                                    <span className="truncate">
                                                        Moderator: <strong className="text-gray-800 font-semibold">{moderatorName}</strong>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-600 justify-end">
                                                    <Users size={14} className="text-gray-400 shrink-0" />
                                                    <span>
                                                        Students: <strong className="text-gray-800 font-semibold">{group.currentEnrollment || 0}</strong> / {group.limit || 50}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
                        disabled={isDeleting || loadingGroups}
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

export default DeleteBatchModal;
