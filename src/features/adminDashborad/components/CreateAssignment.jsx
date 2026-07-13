import React, { useState, useRef } from 'react';
import { ChevronLeft, CloudUpload, Check, Lock } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';

const CreateAssignment = ({ onBackToSelection, onComplete, courseId }) => {
    const [assignmentData, setAssignmentData] = useState({
        title: '',
        instructions: '',
        maxFileSize: '',
        maxAttempts: '',
        requireDueDate: false,
        acceptedTypes: {
            pdf: true,
            doc: true,
            image: true
        }
    });

    const fileInputRef = useRef(null);
    const [referenceFile, setReferenceFile] = useState(null);

    const handleInputChange = (field, value) => {
        setAssignmentData(prev => ({ ...prev, [field]: value }));
    };

    const toggleFileType = (type) => {
        setAssignmentData(prev => ({
            ...prev,
            acceptedTypes: {
                ...prev.acceptedTypes,
                [type]: !prev.acceptedTypes[type]
            }
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setReferenceFile(file);
        }
    };

    const handleContinue = () => {
        if (!assignmentData.title.trim()) {
            // Basic validation
            return;
        }
        // Save to backend or pass to parent
        onComplete({
            title: assignmentData.title,
            type: 'Assignment'
        });
    };

    return (
        <div className="flex-1 flex flex-col w-full min-h-0 overflow-hidden font-sans bg-white relative">

            {/* Header Area */}
            <div className="px-6 py-6 md:px-10 md:py-8 border-b border-gray-50 flex-shrink-0">
                <button
                    onClick={onBackToSelection}
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#0f172a] transition-all text-[13px] md:text-[14px] font-medium mb-4 group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Selection
                </button>
                <h1 className="text-[22px] md:text-[28px] font-bold text-[#0f172a] mb-1 tracking-tight">Add New Assignment</h1>
                <p className="text-[#64748b] text-[14px] md:text-[15px] font-medium leading-relaxed">Set up your Assignment.</p>
            </div>

            {/* Scrollable Content Wrapper */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-8">
                <div className="w-full space-y-8">

                    {/* Row 1: Title and Auto-generated Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[13px] md:text-[14px] font-bold text-[#0f172a] mb-2.5">Assignment Title</label>
                            <input
                                type="text"
                                placeholder="Enter title"
                                value={assignmentData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#6366f1] transition-all text-[14px] shadow-sm font-medium placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] md:text-[14px] font-bold text-[#0f172a] mb-2.5">Assignment Number (Auto-Generated)</label>
                            <input
                                type="text"
                                placeholder="Assignment-05"
                                readOnly
                                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl outline-none text-[14px] text-gray-500 shadow-sm cursor-not-allowed font-medium"
                            />
                        </div>
                    </div>

                    {/* Row 2: Instructions */}
                    <div>
                        <label className="block text-[13px] md:text-[14px] font-bold text-[#0f172a] mb-2.5">Instructions</label>
                        <textarea
                            placeholder="Describe what the student needs to complete and submit"
                            rows={4}
                            value={assignmentData.instructions}
                            onChange={(e) => handleInputChange('instructions', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#6366f1] transition-all text-[14px] shadow-sm resize-none font-medium placeholder:text-gray-400"
                        />
                    </div>

                    {/* Row 3: Upload Reference File */}
                    <div>
                        <label className="block text-[13px] md:text-[14px] font-bold text-[#0f172a] mb-2.5">
                            Upload Reference File <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-[1.5px] border-dashed border-[#c7d2fe] rounded-[24px] bg-[#f8faff] transition-all duration-200 flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-blue-50/50"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6366f1] mb-4 shadow-sm border border-[#e0e7ff]">
                                <CloudUpload size={22} />
                            </div>
                            <span className="text-[13px] font-medium text-[#64748b] mb-3">Drag & drop or</span>
                            <button type="button" className="px-6 py-2 bg-white text-[#6366f1] border border-[#6366f1] text-[13px] font-bold rounded-full mb-3 hover:bg-indigo-50 transition-colors">
                                Browse file
                            </button>
                            <p className="text-[12px] text-gray-400 font-medium">PDF / DOCX — worksheet or task brief for students</p>
                            {referenceFile && (
                                <p className="mt-3 text-[13px] text-[#0f172a] font-bold">{referenceFile.name}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 4: Accepted File Types */}
                    <div>
                        <label className="block text-[13px] md:text-[14px] font-bold text-[#0f172a] mb-3">Accepted Submission File Types</label>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => toggleFileType('pdf')}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 text-[13px] font-bold transition-all border
                                    ${assignmentData.acceptedTypes.pdf
                                        ? 'border-[#6366f1] text-[#6366f1] bg-white'
                                        : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'}`}
                            >
                                {assignmentData.acceptedTypes.pdf && <Check size={14} strokeWidth={3} />}
                                PDF
                            </button>
                            <button
                                onClick={() => toggleFileType('doc')}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 text-[13px] font-bold transition-all border
                                    ${assignmentData.acceptedTypes.doc
                                        ? 'border-[#6366f1] text-[#6366f1] bg-white'
                                        : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'}`}
                            >
                                {assignmentData.acceptedTypes.doc && <Check size={14} strokeWidth={3} />}
                                DOC / DOCX
                            </button>
                            <button
                                onClick={() => toggleFileType('image')}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 text-[13px] font-bold transition-all border
                                    ${assignmentData.acceptedTypes.image
                                        ? 'border-[#6366f1] text-[#6366f1] bg-white'
                                        : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'}`}
                            >
                                {assignmentData.acceptedTypes.image && <Check size={14} strokeWidth={3} />}
                                Image (JPG/PNG)
                            </button>
                        </div>
                    </div>

                    {/* Row 5: Max File Size and Max Attempts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[13px] md:text-[14px] font-bold text-[#0f172a] mb-2.5">Max File Size</label>
                            <input
                                type="text"
                                placeholder="e.g. 10 MB"
                                value={assignmentData.maxFileSize}
                                onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#6366f1] transition-all text-[14px] shadow-sm font-medium placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] md:text-[14px] font-bold text-[#0f172a] mb-2.5">Max Attempts</label>
                            <input
                                type="text"
                                placeholder="e.g. 3"
                                value={assignmentData.maxAttempts}
                                onChange={(e) => handleInputChange('maxAttempts', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#6366f1] transition-all text-[14px] shadow-sm font-medium placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Row 6: Set Due Date Toggle */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-8 pb-4">
                        <div>
                            <h4 className="text-[14px] md:text-[15px] font-bold text-[#0f172a] mb-1">Set Due Date</h4>
                            <p className="text-[#64748b] text-[12px] md:text-[13px] font-medium">Optional — leave off for no deadline.</p>
                        </div>
                        <div
                            onClick={() => handleInputChange('requireDueDate', !assignmentData.requireDueDate)}
                            className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0
                                ${assignmentData.requireDueDate ? 'bg-[#6366f1]' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-[2px] w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300
                                ${assignmentData.requireDueDate ? 'left-[22px]' : 'left-[2px]'}`}
                            />
                        </div>
                    </div>

                    {/* Alert Box */}
                    <div className="bg-[#f5f3ff] border border-[#e0e7ff] rounded-xl p-4 flex items-start gap-3 mt-4">
                        <Lock size={18} className="text-[#6366f1] mt-0.5" />
                        <p className="text-[13.5px] text-[#6366f1] font-medium leading-relaxed">
                            <span className="font-bold">Submission required to continue.</span> Students must upload this assignment before the next lecture unlocks.
                        </p>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 md:px-10 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                    onClick={onBackToSelection}
                    className="w-full sm:w-auto px-8 py-3 bg-white text-[#0f172a] border border-gray-200 font-bold rounded-xl text-[14px] hover:bg-gray-50 transition-all active:scale-95 order-2 sm:order-1"
                >
                    Back
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                    <button
                        className="w-full sm:w-auto px-8 py-3 bg-[#f8fafc] text-[#64748b] border border-transparent font-bold rounded-xl text-[14px] hover:bg-gray-100 hover:text-[#0f172a] transition-all active:scale-95"
                    >
                        Save as draft
                    </button>
                    <GradiantButton
                        onClick={handleContinue}
                        className="w-full sm:w-auto px-10 py-3 font-bold rounded-xl shadow-md shadow-[#3758EE]/20 active:scale-95 transition-all text-[14px]"
                    >
                        Continue
                    </GradiantButton>
                </div>
            </div>
        </div>
    );
};

export default CreateAssignment;
