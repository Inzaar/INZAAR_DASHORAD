import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Upload, Check, Lock, ChevronDown, FileText, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateAssignment = ({ onBackToSelection, onComplete, courseId, nextAssignmentNumber, initialData, lectures = [] }) => {
    const isEditMode = Boolean(initialData);

    const [assignmentData, setAssignmentData] = useState({
        selectedLecture: initialData?.selectedLecture || initialData?.lectureId || '',
        title: initialData?.title || '',
        instructions: initialData?.instructions || '',
        maxFileSize: initialData?.maxFileSize || '25 MB',
        maxAttempts: initialData?.maxAttempts || '3',
        setDueDate: initialData?.setDueDate ?? (initialData?.dueDate || initialData?.maxDays ? true : false),
        maxDays: initialData?.maxDays || '1-Day',
        acceptedTypes: Array.isArray(initialData?.acceptedTypes) && initialData.acceptedTypes.length > 0
            ? (initialData.acceptedTypes.filter(t => !t.toLowerCase().includes('image') && !t.toLowerCase().includes('jpg') && !t.toLowerCase().includes('png')).length > 0
                ? initialData.acceptedTypes.filter(t => !t.toLowerCase().includes('image') && !t.toLowerCase().includes('jpg') && !t.toLowerCase().includes('png'))
                : ['PDF'])
            : ['PDF'],
        referenceFileUrl: initialData?.referenceFileUrl || (Array.isArray(initialData?.pdfUrl) ? initialData.pdfUrl[0] : initialData?.pdfUrl) || '',
        referenceFileName: '',
    });

    const [uploadingFile, setUploadingFile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const [isLectureDropdownOpen, setIsLectureDropdownOpen] = useState(false);
    const lectureDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (lectureDropdownRef.current && !lectureDropdownRef.current.contains(e.target)) {
                setIsLectureDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (initialData) {
            const refUrl = initialData.referenceFileUrl || (Array.isArray(initialData.pdfUrl) ? initialData.pdfUrl[0] : initialData.pdfUrl) || '';
            setAssignmentData(prev => ({
                ...prev,
                title: initialData.title || '',
                instructions: initialData.instructions || '',
                maxFileSize: initialData.maxFileSize || '25 MB',
                maxAttempts: initialData.maxAttempts || '3',
                setDueDate: initialData.setDueDate ?? (initialData.dueDate || initialData.maxDays ? true : false),
                maxDays: initialData.maxDays || '1-Day',
                acceptedTypes: Array.isArray(initialData.acceptedTypes) && initialData.acceptedTypes.length > 0
                    ? (initialData.acceptedTypes.filter(t => !t.toLowerCase().includes('image') && !t.toLowerCase().includes('jpg') && !t.toLowerCase().includes('png')).length > 0
                        ? initialData.acceptedTypes.filter(t => !t.toLowerCase().includes('image') && !t.toLowerCase().includes('jpg') && !t.toLowerCase().includes('png'))
                        : ['PDF'])
                    : ['PDF'],
                referenceFileUrl: refUrl,
                referenceFileName: refUrl ? refUrl.split('/').pop() : '',
                selectedLecture: initialData.selectedLecture || initialData.lectureId || prev.selectedLecture
            }));
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

    const handleUploadReferenceFile = async (file) => {
        if (!file) return;

        const isAllowed = file.type.includes('pdf') ||
                          file.type.includes('document') ||
                          file.type.includes('msword') ||
                          file.name.match(/\.(pdf|doc|docx)$/i);

        if (!isAllowed) {
            toast.error("Only PDF and DOC/DOCX files are allowed for reference file.");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploadingFile(true);
        try {
            const { uploadPdf } = await import('@/api/course');
            const res = await uploadPdf(file);
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
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleUploadReferenceFile(file);
    };

    const handleReferenceFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file) handleUploadReferenceFile(file);
    };

    const handleContinue = async () => {
        if (!assignmentData.selectedLecture) {
            toast.error("Please select a lecture to attach this assignment to.");
            return;
        }

        if (!assignmentData.title.trim()) {
            toast.error("Please enter assignment title.");
            return;
        }

        const assignmentItem = {
            ...(initialData?._id ? { _id: initialData._id, id: initialData._id } : (initialData?.id ? { id: initialData.id } : {})),
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
            selectedLecture: assignmentData.selectedLecture,
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
        <div className="flex-1 flex flex-col w-full h-full min-h-full bg-white md:bg-[#f8fafc] overflow-hidden font-sans relative rounded-xl sm:rounded-2xl border border-gray-100/80 shadow-sm">
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 sm:pb-6">
                <div className="max-w-[1200px] mx-auto w-full px-2 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-10">

                    {/* Header Area */}
                    <div className="mb-4 sm:mb-6 md:mb-10 text-left flex flex-col items-start">
                        <button
                            onClick={onBackToSelection}
                            className="flex items-center gap-1.5 sm:gap-2 text-[#64748b] hover:text-[#0f172a] transition-all text-[12.5px] sm:text-[14px] font-medium mb-2.5 sm:mb-4 group cursor-pointer"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Selection
                        </button>
                        <h1 className="text-[20px] sm:text-[24px] md:text-[28px] font-bold text-[#0f172a] mb-1 sm:mb-2 tracking-tight">
                            {isEditMode ? 'Edit Assignment' : 'Add New Assignment'}
                        </h1>
                        <p className="text-[#64748b] text-[12.5px] sm:text-[14px] md:text-[15px] font-medium leading-relaxed">
                            {isEditMode ? 'Modify assignment configuration and guidelines.' : 'Set up your Assignment.'}
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 p-3.5 sm:p-6 md:p-10 mb-4 sm:mb-8 md:mb-10">

                        {/* Lectures Dropdown */}
                        <div className="mb-4 sm:mb-6 md:mb-8">
                            <label className="block text-[12.5px] sm:text-[13px] font-bold text-[#0f172a] mb-1.5 sm:mb-2">Lectures *</label>
                            <div className="relative z-20" ref={lectureDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsLectureDropdownOpen(!isLectureDropdownOpen)}
                                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:ring-2 focus:ring-[#3758EE]/20 transition-all text-[13px] sm:text-[14px] shadow-sm font-medium text-[#0f172a] cursor-pointer flex items-center justify-between text-left"
                                >
                                    <span className={!assignmentData.selectedLecture ? 'text-gray-400' : 'text-[#0f172a]'}>
                                        {(() => {
                                            if (!assignmentData.selectedLecture) return 'Select a lecture';
                                            const selected = lectures.find((lec, idx) => {
                                                const lId = lec.id || lec._id || idx;
                                                return String(lId) === String(assignmentData.selectedLecture);
                                            });
                                            if (selected) {
                                                const lNo = selected.lectureNo ? `Lecture ${selected.lectureNo}: ` : '';
                                                const lTitle = selected.title || 'Untitled Lecture';
                                                return `${lNo}${lTitle}`;
                                            }
                                            return 'Select a lecture';
                                        })()}
                                    </span>
                                    <ChevronDown className={`text-gray-400 transition-transform duration-200 ${isLectureDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                </button>
                                {isLectureDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleInputChange('selectedLecture', '');
                                                setIsLectureDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3.5 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-[14px] text-gray-400 hover:bg-gray-50 cursor-pointer ${
                                                !assignmentData.selectedLecture ? 'bg-blue-50/60 font-semibold text-blue-600' : ''
                                            }`}
                                        >
                                            Select a lecture
                                        </button>
                                        {lectures.map((lec, idx) => {
                                            const lId = lec.id || lec._id || idx;
                                            const lTitle = lec.title || `Lecture ${idx + 1}`;
                                            const lNo = lec.lectureNo ? `Lecture ${lec.lectureNo}: ` : '';
                                            const fullText = `${lNo}${lTitle}`;
                                            const isSelected = String(assignmentData.selectedLecture) === String(lId);
                                            return (
                                                <button
                                                    key={lId}
                                                    type="button"
                                                    onClick={() => {
                                                        handleInputChange('selectedLecture', lId);
                                                        setIsLectureDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3.5 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-[14px] transition-colors cursor-pointer flex items-center justify-between ${
                                                        isSelected ? 'bg-blue-50 font-semibold text-[#3758EE]' : 'text-[#0f172a] hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span>{fullText}</span>
                                                    {isSelected && <Check size={16} className="text-[#3758EE]" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title and Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
                            <div>
                                <label className="block text-[12.5px] sm:text-[13px] font-bold text-[#0f172a] mb-1.5 sm:mb-2">Assignment Title *</label>
                                <input
                                    type="text"
                                    placeholder="Enter title"
                                    value={assignmentData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:ring-2 focus:ring-[#3758EE]/20 transition-all text-[13px] sm:text-[14px] shadow-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[12.5px] sm:text-[13px] font-bold text-[#0f172a] mb-1.5 sm:mb-2">Assignment Number (Auto-Generated)</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={`Assignment-${String(nextAssignmentNumber || 1).padStart(2, '0')}`}
                                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gray-50/50 border border-gray-100 rounded-xl outline-none text-[13px] sm:text-[14px] text-gray-400 font-medium shadow-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mb-4 sm:mb-6 md:mb-8">
                            <label className="block text-[12.5px] sm:text-[13px] font-bold text-[#0f172a] mb-1.5 sm:mb-2">Instructions</label>
                            <textarea
                                placeholder="Describe what the student needs to complete and submit"
                                rows={3}
                                value={assignmentData.instructions}
                                onChange={(e) => handleInputChange('instructions', e.target.value)}
                                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:ring-2 focus:ring-[#3758EE]/20 transition-all text-[13px] sm:text-[14px] shadow-sm resize-none font-medium"
                            />
                        </div>

                        {/* Upload Reference File */}
                        <div className="mb-4 sm:mb-6 md:mb-8">
                            <label className="block text-[12.5px] sm:text-[13px] font-bold text-[#0f172a] mb-1.5 sm:mb-2">
                                Upload Reference File <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleReferenceFileDrop}
                                className="w-full py-6 sm:py-10 px-3 sm:px-6 border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc]/50 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all hover:bg-[#f8fafc]"
                            >
                                {uploadingFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#8b5cf6] animate-spin" />
                                        <p className="text-xs font-semibold text-[#8b5cf6]">Uploading reference file...</p>
                                    </div>
                                ) : assignmentData.referenceFileUrl ? (
                                    <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 px-3.5 sm:px-5 rounded-xl border border-gray-200 shadow-sm max-w-full overflow-hidden">
                                        <FileText className="text-[#8b5cf6] flex-shrink-0" size={18} />
                                        <span className="text-[11.5px] sm:text-xs font-bold text-gray-700 max-w-[180px] sm:max-w-[250px] truncate">
                                            {assignmentData.referenceFileName || assignmentData.referenceFileUrl.split('/').pop()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setAssignmentData(prev => ({ ...prev, referenceFileUrl: '', referenceFileName: '' }))}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 cursor-pointer flex-shrink-0"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-2.5 sm:mb-4">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                        </div>
                                        <p className="text-[12px] sm:text-[13px] text-gray-500 font-medium mb-2 sm:mb-3">Drag & drop or</p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-5 sm:px-6 py-1.5 sm:py-2 bg-white border border-[#8b5cf6] text-[#8b5cf6] text-[12px] sm:text-[13px] font-bold rounded-full hover:bg-purple-50 transition-colors shadow-sm mb-2 sm:mb-3 cursor-pointer"
                                        >
                                            Browse file
                                        </button>
                                        <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium text-center">PDF / DOC / DOCX — worksheet or task brief for students</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Accepted Submission File Types */}
                        <div className="mb-4 sm:mb-6 md:mb-8">
                            <label className="block text-[12.5px] sm:text-[13px] font-bold text-[#0f172a] mb-2 sm:mb-3">Accepted Submission File Types</label>
                            <div className="flex flex-wrap gap-2.5 sm:gap-3">
                                {['PDF', 'DOC / DOCX'].map((type) => {
                                    const isSelected = assignmentData.acceptedTypes.includes(type);
                                    return (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => toggleAcceptedType(type)}
                                            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] font-bold transition-all cursor-pointer
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
                            <div>
                                <label className="block text-[12.5px] sm:text-[13px] font-bold text-[#0f172a] mb-1.5 sm:mb-2">Max File Size</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 10 MB"
                                    value={assignmentData.maxFileSize}
                                    onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] transition-all text-[13px] sm:text-[14px] shadow-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[12.5px] sm:text-[13px] font-bold text-[#0f172a] mb-1.5 sm:mb-2">Max Attempts</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 3"
                                    value={assignmentData.maxAttempts}
                                    onChange={(e) => handleInputChange('maxAttempts', e.target.value)}
                                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] transition-all text-[13px] sm:text-[14px] shadow-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Adjust Max Days Toggle */}
                        <div className="flex items-start justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
                            <div className="flex flex-col gap-2.5 sm:gap-3">
                                <div>
                                    <h4 className="text-[13px] sm:text-[14px] font-bold text-[#0f172a] mb-0.5 sm:mb-1">Adjust Max Days</h4>
                                    <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium">Optional — leave off for no deadline.</p>
                                </div>
                                {assignmentData.setDueDate && (
                                    <div className="relative w-[125px] sm:w-[140px] animate-in fade-in slide-in-from-top-2 duration-300">
                                        <select
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#8b5cf6] transition-all text-[12.5px] sm:text-[13px] shadow-sm appearance-none cursor-pointer text-gray-600 font-medium"
                                            value={assignmentData.maxDays || '1-Day'}
                                            onChange={(e) => handleInputChange('maxDays', e.target.value)}
                                        >
                                            <option value="1-Day">1-Day</option>
                                            <option value="2-Days">2-Days</option>
                                            <option value="3-Days">3-Days</option>
                                            <option value="1-Week">1-Week</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                )}
                            </div>
                            <div
                                onClick={() => handleInputChange('setDueDate', !assignmentData.setDueDate)}
                                className={`w-11 sm:w-12 h-6 rounded-full cursor-pointer relative transition-colors duration-300 mt-1 flex-shrink-0 ${assignmentData.setDueDate ? 'bg-[#8b5cf6]' : 'bg-gray-200'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-300 ${assignmentData.setDueDate ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5'}`} />
                            </div>
                        </div>

                        {/* Submission required box */}
                        <div className="bg-[#f5f3ff] border border-[#ede9fe] rounded-xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                <Lock size={15} className="text-[#8b5cf6]" />
                            </div>
                            <p className="text-[12px] sm:text-[13px] text-[#6b21a8] font-medium leading-relaxed">
                                <span className="font-bold">Submission required to continue.</span> Students must upload this assignment before the next lecture unlocks.
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Sticky Footer */}
            <div className="w-full flex-shrink-0 bg-white border-t border-gray-150 py-3 sm:py-5 px-3.5 sm:px-6 md:px-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 sm:gap-4 z-40">
                <div className="flex items-center gap-2 sm:gap-4 order-2 sm:order-1">
                    <button
                        type="button"
                        onClick={onBackToSelection}
                        className="flex-1 sm:flex-none sm:w-auto px-4 sm:px-6 md:px-10 py-2.5 sm:py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm text-[13px] sm:text-[14px] cursor-pointer"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={onBackToSelection}
                        className="flex-1 sm:flex-none sm:w-auto px-4 sm:px-6 md:px-10 py-2.5 sm:py-3 bg-[#f8fafc] text-gray-500 font-bold rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-all active:scale-95 shadow-sm text-[13px] sm:text-[14px] cursor-pointer sm:hidden"
                    >
                        Cancel
                    </button>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 order-1 sm:order-2">
                    <button
                        type="button"
                        onClick={onBackToSelection}
                        className="hidden sm:block sm:w-auto px-6 md:px-10 py-3 bg-[#f8fafc] text-gray-500 font-bold rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-all active:scale-95 shadow-sm text-[14px] cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 md:px-12 py-2.5 sm:py-3 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#7c3aed] transition-all active:scale-95 shadow-lg shadow-purple-500/20 text-[13px] sm:text-[14px] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
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
