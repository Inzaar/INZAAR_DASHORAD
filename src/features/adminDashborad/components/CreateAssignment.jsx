import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Upload, Check, Lock, ChevronDown, FileText, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateAssignment = ({ onBackToSelection, onComplete, courseId, nextAssignmentNumber, initialData }) => {
    const isEditMode = Boolean(initialData);

    const [assignmentData, setAssignmentData] = useState({
        title: initialData?.title || '',
        instructions: initialData?.instructions || '',
        maxFileSize: initialData?.maxFileSize || '25 MB',
        maxAttempts: initialData?.maxAttempts || '3',
        setDueDate: initialData?.setDueDate ?? (initialData?.dueDate || initialData?.maxDays ? true : false),
        maxDays: initialData?.maxDays || '1-Day',
        acceptedTypes: Array.isArray(initialData?.acceptedTypes) && initialData.acceptedTypes.length > 0
            ? initialData.acceptedTypes
            : ['PDF'],
        referenceFileUrl: initialData?.referenceFileUrl || (Array.isArray(initialData?.pdfUrl) ? initialData.pdfUrl[0] : initialData?.pdfUrl) || '',
        referenceFileName: '',
    });

    const [uploadingFile, setUploadingFile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            const refUrl = initialData.referenceFileUrl || (Array.isArray(initialData.pdfUrl) ? initialData.pdfUrl[0] : initialData.pdfUrl) || '';
            setAssignmentData({
                title: initialData.title || '',
                instructions: initialData.instructions || '',
                maxFileSize: initialData.maxFileSize || '25 MB',
                maxAttempts: initialData.maxAttempts || '3',
                setDueDate: initialData.setDueDate ?? (initialData.dueDate || initialData.maxDays ? true : false),
                maxDays: initialData.maxDays || '1-Day',
                acceptedTypes: Array.isArray(initialData.acceptedTypes) && initialData.acceptedTypes.length > 0
                    ? initialData.acceptedTypes
                    : ['PDF'],
                referenceFileUrl: refUrl,
                referenceFileName: refUrl ? refUrl.split('/').pop() : '',
            });
        }
    }, [initialData]);

    const handleInputChange = (field, value) => {
        setAssignmentData(prev => ({ ...prev, [field]: value }));
    };

    const toggleAcceptedType = (type) => {
        setAssignmentData(prev => {
            if (prev.acceptedTypes.includes(type)) {
                return { ...prev, acceptedTypes: prev.acceptedTypes.filter(t => t !== type) };
            } else {
                return { ...prev, acceptedTypes: [...prev.acceptedTypes, type] };
            }
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFile(true);
        try {
            const { uploadPdf, uploadImage } = await import('@/api/course');
            let res;
            if (file.type.includes('pdf')) {
                res = await uploadPdf(file);
            } else {
                res = await uploadImage(file);
            }
            if (res?.url) {
                setAssignmentData(prev => ({
                    ...prev,
                    referenceFileUrl: res.url,
                    referenceFileName: file.name
                }));
                toast.success("Reference file uploaded successfully!");
            }
        } catch (err) {
            console.error("Reference file upload failed:", err);
            toast.error("Failed to upload reference file.");
        } finally {
            setUploadingFile(false);
        }
    };

    const handleContinue = async () => {
        if (!assignmentData.title.trim()) {
            toast.error("Please enter assignment title.");
            return;
        }

        const assignmentItem = {
            ...(initialData?._id ? { _id: initialData._id, id: initialData._id } : {}),
            title: assignmentData.title,
            instructions: assignmentData.instructions,
            maxFileSize: assignmentData.maxFileSize,
            maxAttempts: assignmentData.maxAttempts,
            setDueDate: assignmentData.setDueDate,
            maxDays: assignmentData.maxDays,
            acceptedTypes: assignmentData.acceptedTypes,
            type: 'Assignment',
            pdfUrl: assignmentData.referenceFileUrl ? [assignmentData.referenceFileUrl] : (initialData?.pdfUrl || []),
            referenceFileUrl: assignmentData.referenceFileUrl,
        };

        if (onComplete) {
            setIsSubmitting(true);
            try {
                await onComplete(assignmentItem);
            } catch (err) {
                console.error("Error saving assignment:", err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full h-full min-h-screen bg-white md:bg-[#f8fafc] overflow-hidden font-sans relative">
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 md:pt-10">
                    
                    {/* Header Area */}
                    <div className="mb-8 md:mb-10 text-center flex flex-col items-center">
                        <button
                            onClick={onBackToSelection}
                            className="flex items-center gap-2 text-[#64748b] hover:text-[#0f172a] transition-all text-[14px] font-medium mb-4 group cursor-pointer"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Selection
                        </button>
                        <h1 className="text-[24px] md:text-[28px] font-bold text-[#0f172a] mb-2 tracking-tight">
                            {isEditMode ? 'Edit Assignment' : 'Add New Assignment'}
                        </h1>
                        <p className="text-[#64748b] text-[15px] font-medium leading-relaxed">
                            {isEditMode ? 'Modify assignment configuration and guidelines.' : 'Set up your Assignment.'}
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white md:rounded-[24px] md:shadow-[0_4px_20px_rgb(0,0,0,0.02)] md:border border-gray-100 p-6 md:p-10 mb-10">
                        
                        {/* Title and Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-[13px] font-bold text-[#0f172a] mb-2">Assignment Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter title"
                                    value={assignmentData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:ring-2 focus:ring-[#3758EE]/20 transition-all text-[14px] shadow-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#0f172a] mb-2">Assignment Number (Auto-Generated)</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={`Assignment-${String(nextAssignmentNumber || 1).padStart(2, '0')}`}
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl outline-none text-[14px] text-gray-400 font-medium shadow-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mb-8">
                            <label className="block text-[13px] font-bold text-[#0f172a] mb-2">Instructions</label>
                            <textarea
                                placeholder="Describe what the student needs to complete and submit"
                                rows={4}
                                value={assignmentData.instructions}
                                onChange={(e) => handleInputChange('instructions', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:ring-2 focus:ring-[#3758EE]/20 transition-all text-[14px] shadow-sm resize-none font-medium"
                            />
                        </div>

                        {/* Upload Reference File */}
                        <div className="mb-8">
                            <label className="block text-[13px] font-bold text-[#0f172a] mb-2">
                                Upload Reference File <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="w-full py-10 px-6 border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc]/50 rounded-2xl flex flex-col items-center justify-center transition-all hover:bg-[#f8fafc]">
                                {uploadingFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
                                        <p className="text-xs font-semibold text-[#8b5cf6]">Uploading reference file...</p>
                                    </div>
                                ) : assignmentData.referenceFileUrl ? (
                                    <div className="flex items-center gap-3 bg-white p-3 px-5 rounded-xl border border-gray-200 shadow-sm">
                                        <FileText className="text-[#8b5cf6]" size={20} />
                                        <span className="text-xs font-bold text-gray-700 max-w-[250px] truncate">
                                            {assignmentData.referenceFileName || assignmentData.referenceFileUrl.split('/').pop()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setAssignmentData(prev => ({ ...prev, referenceFileUrl: '', referenceFileName: '' }))}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 cursor-pointer"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                        </div>
                                        <p className="text-[13px] text-gray-500 font-medium mb-3">Drag & drop or</p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-2 bg-white border border-[#8b5cf6] text-[#8b5cf6] text-[13px] font-bold rounded-full hover:bg-purple-50 transition-colors shadow-sm mb-3 cursor-pointer"
                                        >
                                            Browse file
                                        </button>
                                        <p className="text-[11px] text-gray-400 font-medium">PDF / DOCX — worksheet or task brief for students</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Accepted Submission File Types */}
                        <div className="mb-8">
                            <label className="block text-[13px] font-bold text-[#0f172a] mb-3">Accepted Submission File Types</label>
                            <div className="flex flex-wrap gap-3">
                                {['PDF', 'DOC / DOCX', 'Image (JPG/PNG)'].map((type) => {
                                    const isSelected = assignmentData.acceptedTypes.includes(type);
                                    return (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => toggleAcceptedType(type)}
                                            className={`px-4 py-2 rounded-full border flex items-center gap-2 text-[13px] font-bold transition-all cursor-pointer
                                                ${isSelected 
                                                    ? 'border-[#8b5cf6] text-[#8b5cf6] bg-purple-50/30' 
                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}
                                        >
                                            {isSelected && <Check size={14} strokeWidth={3} />}
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Max File Size and Max Attempts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-[13px] font-bold text-[#0f172a] mb-2">Max File Size</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 10 MB"
                                    value={assignmentData.maxFileSize}
                                    onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] transition-all text-[14px] shadow-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#0f172a] mb-2">Max Attempts</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 3"
                                    value={assignmentData.maxAttempts}
                                    onChange={(e) => handleInputChange('maxAttempts', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] transition-all text-[14px] shadow-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Adjust Max Days Toggle */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <h4 className="text-[14px] font-bold text-[#0f172a] mb-1">Adjust Max Days</h4>
                                    <p className="text-[12px] text-gray-400 font-medium">Optional — leave off for no deadline.</p>
                                </div>
                                {assignmentData.setDueDate && (
                                    <div className="relative w-[140px] animate-in fade-in slide-in-from-top-2 duration-300">
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#8b5cf6] transition-all text-[13px] shadow-sm appearance-none cursor-pointer text-gray-600 font-medium"
                                            value={assignmentData.maxDays || '1-Day'}
                                            onChange={(e) => handleInputChange('maxDays', e.target.value)}
                                        >
                                            <option value="1-Day">1-Day</option>
                                            <option value="2-Days">2-Days</option>
                                            <option value="3-Days">3-Days</option>
                                            <option value="1-Week">1-Week</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                )}
                            </div>
                            <div 
                                onClick={() => handleInputChange('setDueDate', !assignmentData.setDueDate)}
                                className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors duration-300 mt-1 ${assignmentData.setDueDate ? 'bg-[#8b5cf6]' : 'bg-gray-200'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-300 ${assignmentData.setDueDate ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </div>
                        </div>

                        {/* Submission required box */}
                        <div className="bg-[#f5f3ff] border border-[#ede9fe] rounded-xl p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                <Lock size={16} className="text-[#8b5cf6]" />
                            </div>
                            <p className="text-[13px] text-[#6b21a8] font-medium leading-relaxed">
                                <span className="font-bold">Submission required to continue.</span> Students must upload this assignment before the next lecture unlocks.
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 py-5 px-6 md:px-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 z-40 shadow-[0_-6px_20px_rgba(0,0,0,0.04)]">
                <button
                    type="button"
                    onClick={onBackToSelection}
                    className="w-full sm:w-auto px-6 md:px-10 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm text-[14px] cursor-pointer"
                >
                    Back
                </button>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={onBackToSelection}
                        className="w-full sm:w-auto px-6 md:px-10 py-3 bg-[#f8fafc] text-gray-500 font-bold rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-all active:scale-95 shadow-sm text-[14px] cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 md:px-12 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#7c3aed] transition-all active:scale-95 shadow-lg shadow-purple-500/20 text-[14px] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            isEditMode ? 'Save Changes' : 'Continue'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateAssignment;
