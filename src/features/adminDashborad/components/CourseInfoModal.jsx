import React from "react";
import {
    X,
    Info,
    User,
    Clock,
    Users,
    Video,
    Award,
    Unlock,
    Building2,
    Calendar,
    FileText,
    ExternalLink,
    Edit3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CourseInfoModal = ({ isOpen, onClose, courseData }) => {
    const navigate = useNavigate();

    if (!isOpen || !courseData) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const statusConfig = {
        published: {
            label: "Published (Active)",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            border: "border-emerald-200"
        },
        draft: {
            label: "Draft",
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-200"
        },
        inactive: {
            label: "Inactive",
            bg: "bg-gray-100",
            text: "text-gray-700",
            border: "border-gray-200"
        }
    };

    const currentStatus = statusConfig[courseData.status] || statusConfig.draft;

    const metadataCards = [
        {
            icon: <User className="text-[#3758EE]" size={18} />,
            label: "Instructor / Lecturer",
            value: courseData.instructor || "Not assigned",
            bgColor: "bg-blue-50/60"
        },
        {
            icon: <Clock className="text-[#8B5CF6]" size={18} />,
            label: "Course Duration",
            value: courseData.duration || "Not specified",
            bgColor: "bg-purple-50/60"
        },
        {
            icon: <Video className="text-[#10B981]" size={18} />,
            label: "Total Lectures",
            value: `${courseData.totalLectures || courseData.lectures?.length || 0} Lectures`,
            bgColor: "bg-emerald-50/60"
        },
        {
            icon: <Users className="text-[#F59E0B]" size={18} />,
            label: "Batch Strength",
            value: courseData.batchStrength ? `${courseData.batchStrength} Students / Group` : "50 Students / Group",
            bgColor: "bg-amber-50/60"
        },
        {
            icon: <Building2 className="text-[#06B6D4]" size={18} />,
            label: "Department",
            value: courseData.departmentId?.name || "General Department",
            bgColor: "bg-cyan-50/60"
        },
        {
            icon: <Award className="text-[#6366F1]" size={18} />,
            label: "Certificate Criteria",
            value: `${courseData.certificateCriteria ?? 90}% Progress required`,
            bgColor: "bg-indigo-50/60"
        },
        {
            icon: <Unlock className="text-[#14B8A6]" size={18} />,
            label: "Lecture Unlock Criteria",
            value: `${courseData.unlockCriteria ?? 90}% Watched to unlock next`,
            bgColor: "bg-teal-50/60"
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3758EE]">
                            <Info size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-900 leading-tight">Course Information</h2>
                                {courseData.courseId && (
                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-bold text-[11px] uppercase tracking-wide">
                                        {courseData.courseId}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{courseData.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-6 overflow-y-auto custom-modal-scrollbar">

                    {/* Banner Card: Thumbnail + Key overview */}
                    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                        {courseData.thumbnail ? (
                            <img
                                src={courseData.thumbnail}
                                alt={courseData.title}
                                className="w-full sm:w-36 h-24 object-cover rounded-xl border border-gray-200/80 shrink-0"
                            />
                        ) : (
                            <div className="w-full sm:w-36 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl flex items-center justify-center text-gray-400 text-xs shrink-0 border border-gray-200/60 font-medium">
                                No Thumbnail
                            </div>
                        )}

                        <div className="flex-1 flex flex-col justify-between gap-2">
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}>
                                        {currentStatus.label}
                                    </span>
                                    {courseData.isNewCourse && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                            New
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
                                    {courseData.title}
                                </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1 border-t border-gray-200/60">
                                <span>Added by: <strong className="text-gray-700 font-semibold">{courseData.addBy || "Admin"}</strong></span>
                                <span>Created: <strong className="text-gray-700 font-semibold">{formatDate(courseData.createdAt)}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                            Course Specifications
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {metadataCards.map((card, idx) => (
                                <div
                                    key={idx}
                                    className="p-3.5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all flex items-start gap-3 shadow-xs"
                                >
                                    <div className={`p-2 rounded-lg ${card.bgColor} shrink-0 mt-0.5`}>
                                        {card.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[11px] font-medium text-gray-400 leading-tight">
                                            {card.label}
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 truncate mt-0.5">
                                            {card.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Certificate Template Info */}
                    {courseData.certificateFile && (
                        <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#3758EE] shrink-0" />
                                <span className="text-gray-600 font-medium">Custom Certificate Template uploaded</span>
                            </div>
                            <a
                                href={courseData.certificateFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#3758EE] hover:underline"
                            >
                                View File <ExternalLink size={12} />
                            </a>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 px-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-all cursor-pointer"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            navigate(`/admin-add-course?edit=true&id=${courseData._id}`);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3758EE] text-white font-bold text-xs hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                    >
                        <Edit3 size={14} />
                        Edit Course
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

export default CourseInfoModal;

