import React, { useState } from "react";
import { X, Calendar } from "lucide-react";

const ScheduleBatchModal = ({ isOpen, onClose, onSchedule, loading, initialData }) => {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [enrollmentStartDate, setEnrollmentStartDate] = useState("");
    const [enrollmentEndDate, setEnrollmentEndDate] = useState("");

    // Update state when modal opens or initial data changes
    React.useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || "");
            // Extract the date part (YYYY-MM-DD) if it's a full ISO string
            const formatDate = (dateStr) => dateStr ? dateStr.split("T")[0] : "";
            
            setStartDate(formatDate(initialData?.startDate));
            setEndDate(formatDate(initialData?.endDate));
            setEnrollmentStartDate(formatDate(initialData?.enrollmentStartDate));
            setEnrollmentEndDate(formatDate(initialData?.enrollmentEndDate));
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && startDate && endDate && enrollmentStartDate) {
            onSchedule({ name, startDate, endDate, enrollmentStartDate, enrollmentEndDate, id: initialData?._id });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{initialData ? "Edit Semester Batch" : "Schedule Semester Batch"}</h2>
                    <button onClick={onClose} disabled={loading} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Fall Semester 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3758EE] focus:border-[#3758EE] text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3758EE] focus:border-[#3758EE] text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3758EE] focus:border-[#3758EE] text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    required
                                    value={enrollmentStartDate}
                                    onChange={(e) => setEnrollmentStartDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3758EE] focus:border-[#3758EE] text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment End Date (Optional)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    value={enrollmentEndDate}
                                    onChange={(e) => setEnrollmentEndDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3758EE] focus:border-[#3758EE] text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">If blank, defaults to 1 month before course ends.</p>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name || !startDate || !endDate || !enrollmentStartDate}
                            className="px-6 py-2 rounded-xl bg-[#3758EE] text-white font-medium text-sm hover:bg-blue-700 shadow-sm disabled:opacity-50"
                        >
                            {loading ? (initialData ? "Updating..." : "Scheduling...") : (initialData ? "Update" : "Schedule")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleBatchModal;
