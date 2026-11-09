import React, { useState, useMemo } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * Calculates end date (YYYY-MM-DD) based on start date and course duration string.
 * Supports e.g. "4 Weeks", "8 Weeks", "12 Weeks", "6 Months", "60 Days".
 */
export const calculateEndDateFromDuration = (startDateStr, durationStr) => {
    if (!startDateStr || !durationStr) return "";

    const parts = String(startDateStr).split("T")[0].split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return "";
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return "";

    const match = String(durationStr).trim().match(/^(\d+)\s*(week|month|day|yr|year)?/i);
    if (!match) return "";

    const value = parseInt(match[1], 10);
    const unit = (match[2] || "week").toLowerCase();

    if (unit.startsWith("week")) {
        date.setDate(date.getDate() + value * 7);
    } else if (unit.startsWith("month")) {
        date.setMonth(date.getMonth() + value);
    } else if (unit.startsWith("day")) {
        date.setDate(date.getDate() + value);
    } else if (unit.startsWith("year") || unit.startsWith("yr")) {
        date.setFullYear(date.getFullYear() + value);
    } else {
        date.setDate(date.getDate() + value * 7);
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const ScheduleBatchModal = ({ isOpen, onClose, onSchedule, loading, initialData, courseDuration }) => {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [enrollmentStartDate, setEnrollmentStartDate] = useState("");
    const [enrollmentEndDate, setEnrollmentEndDate] = useState("");

    const todayStr = useMemo(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }, []);

    // Course end date is today or has already passed (gone)
    const isCourseEndTodayOrPast = Boolean(endDate && endDate <= todayStr);

    // Update state when modal opens or initial data changes
    React.useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || "");
            // Extract the date part (YYYY-MM-DD) if it's a full ISO string
            const formatDate = (dateStr) => dateStr ? dateStr.split("T")[0] : "";
            
            const initialStart = formatDate(initialData?.startDate);
            const initialEnd = formatDate(initialData?.endDate);

            setStartDate(initialStart);

            let computedEnd = initialEnd;
            if (!computedEnd && initialStart && courseDuration) {
                computedEnd = calculateEndDateFromDuration(initialStart, courseDuration);
            }
            setEndDate(computedEnd || "");

            const initialEnrStart = formatDate(initialData?.enrollmentStartDate);
            const initialEnrEnd = formatDate(initialData?.enrollmentEndDate);

            // If course end date is today or past, clear enrollment start date
            if (computedEnd && computedEnd <= todayStr) {
                setEnrollmentStartDate("");
                setEnrollmentEndDate("");
            } else {
                setEnrollmentStartDate(initialEnrStart);
                setEnrollmentEndDate(initialEnrEnd);
            }
        }
    }, [isOpen, initialData, courseDuration, todayStr]);

    const handleStartDateChange = (val) => {
        setStartDate(val);
        if (val && courseDuration) {
            const calculatedEnd = calculateEndDateFromDuration(val, courseDuration);
            if (calculatedEnd) {
                setEndDate(calculatedEnd);
                if (calculatedEnd <= todayStr) {
                    setEnrollmentStartDate("");
                    setEnrollmentEndDate("");
                } else {
                    if (enrollmentStartDate && enrollmentStartDate >= calculatedEnd) {
                        setEnrollmentStartDate("");
                    }
                    if (enrollmentEndDate && enrollmentEndDate > calculatedEnd) {
                        setEnrollmentEndDate("");
                    }
                }
            }
        }
    };

    const handleEndDateChange = (val) => {
        setEndDate(val);
        if (val && val <= todayStr) {
            setEnrollmentStartDate("");
            setEnrollmentEndDate("");
        } else if (val) {
            if (enrollmentStartDate && enrollmentStartDate >= val) {
                setEnrollmentStartDate("");
            }
            if (enrollmentEndDate && enrollmentEndDate > val) {
                setEnrollmentEndDate("");
            }
        }
    };

    const handleEnrollmentStartDateChange = (val) => {
        if (!endDate) {
            toast.error("Please set Course Start & End Date first.");
            return;
        }
        if (isCourseEndTodayOrPast) {
            toast.error("Course End Date is today or has already passed. Enrollment cannot be scheduled.");
            return;
        }
        if (val >= endDate) {
            toast.error("Enrollment Start Date must be earlier than the Course End Date.");
            return;
        }
        setEnrollmentStartDate(val);
        if (enrollmentEndDate && enrollmentEndDate < val) {
            setEnrollmentEndDate("");
        }
    };

    const handleEnrollmentEndDateChange = (val) => {
        if (!val) {
            setEnrollmentEndDate("");
            return;
        }
        if (!endDate) {
            toast.error("Please set Course End Date first.");
            return;
        }
        if (val > endDate) {
            toast.error("Enrollment End Date cannot be greater than Course End Date.");
            return;
        }
        if (enrollmentStartDate && val < enrollmentStartDate) {
            toast.error("Enrollment End Date cannot be earlier than Enrollment Start Date.");
            return;
        }
        setEnrollmentEndDate(val);
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isCourseEndTodayOrPast) {
            toast.error("Course End Date is today or has already passed. Enrollment cannot be scheduled.");
            return;
        }
        if (enrollmentStartDate && endDate && enrollmentStartDate >= endDate) {
            toast.error("Enrollment Start Date must be earlier than Course End Date.");
            return;
        }
        if (enrollmentEndDate && endDate && enrollmentEndDate > endDate) {
            toast.error("Enrollment End Date cannot be greater than Course End Date.");
            return;
        }
        if (enrollmentEndDate && enrollmentStartDate && enrollmentEndDate < enrollmentStartDate) {
            toast.error("Enrollment End Date cannot be earlier than Enrollment Start Date.");
            return;
        }
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
                                    onChange={(e) => handleStartDateChange(e.target.value)}
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
                                    onChange={(e) => handleEndDateChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3758EE] focus:border-[#3758EE] text-sm"
                                />
                            </div>
                            {courseDuration && !isCourseEndTodayOrPast && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Auto-calculated from course duration ({courseDuration}).
                                </p>
                            )}
                            {isCourseEndTodayOrPast && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mt-1">
                                    <AlertCircle size={14} className="shrink-0" />
                                    <span>Course End Date is today or in the past. Enrollment cannot be opened.</span>
                                </div>
                            )}
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
                                    disabled={isCourseEndTodayOrPast || !endDate}
                                    value={enrollmentStartDate}
                                    max={endDate || undefined}
                                    onChange={(e) => handleEnrollmentStartDateChange(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#3758EE] focus:border-[#3758EE] text-sm ${
                                        isCourseEndTodayOrPast || !endDate ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-200"
                                    }`}
                                />
                            </div>
                            {isCourseEndTodayOrPast ? (
                                <p className="text-xs text-red-500 font-medium mt-1">
                                    Cannot choose enrollment start date because course end date has passed or is today.
                                </p>
                            ) : !endDate ? (
                                <p className="text-xs text-gray-400 mt-1">Please set Course Start Date first.</p>
                            ) : (
                                <p className="text-xs text-gray-500 mt-1">Must be earlier than Course End Date ({endDate}).</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment End Date (Optional)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    disabled={isCourseEndTodayOrPast || !endDate}
                                    value={enrollmentEndDate}
                                    min={enrollmentStartDate || undefined}
                                    max={endDate || undefined}
                                    onChange={(e) => handleEnrollmentEndDateChange(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#3758EE] focus:border-[#3758EE] text-sm ${
                                        isCourseEndTodayOrPast || !endDate ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-200"
                                    }`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Cannot be greater than Course End Date ({endDate || "N/A"}). If blank, defaults to 1 month before course ends.
                            </p>
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
                            disabled={loading || !name || !startDate || !endDate || !enrollmentStartDate || isCourseEndTodayOrPast}
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
