import React, { useState, useRef } from 'react';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import GrayButton from '@/components/ui/buttons/GrayButton';
import { Upload, FileText, X, Info, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { uploadPdf, submitAssignmentProgress } from '@/api/course';
import toast from 'react-hot-toast';

const AssignmentSubmission = () => {
    const location = useLocation();
    const { assignment, returnUrl } = location.state || {};
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showCancelPopup, setShowCancelPopup] = useState(false);
    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

    React.useEffect(() => {
        const handlePopState = (e) => {
            if (isUploading) {
                // Trap the user on the page without breaking location state
                window.history.pushState(window.history.state, '', window.location.href);
                
                // Abort the upload
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                setIsUploading(false);
                toast.dismiss('upload-assignment');
                setShowCancelPopup(true);
            }
        };

        const handleBeforeUnload = (e) => {
            if (isUploading) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        if (isUploading) {
            // Push a dummy state so the first back action just pops this state
            window.history.pushState(window.history.state, '', window.location.href);
            window.addEventListener('popstate', handlePopState);
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (isUploading) {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                toast.dismiss('upload-assignment');
            }
        };
    }, [isUploading]);

    const isAdminView = location.pathname.includes('admin') || location.search.includes('admin=true') || location.state?.isAdminView;

    const handleEditAssignment = () => {
        const queryParams = new URLSearchParams(location.search);
        const courseId = queryParams.get('courseId') || queryParams.get('id') || assignment?.courseId;
        const lectureId = location.state?.lecture?._id || queryParams.get('lectureId') || location.state?.lecture?.id;

        if (courseId && lectureId && assignment) {
            navigate(`/admin-add-course?edit=true&id=${courseId}&openAssignmentId=${assignment.id || assignment._id}&lectureId=${lectureId}`);
        } else {
            console.error("Missing required parameters to edit assignment.", { courseId, lectureId, assignment });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setSelectedFile(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;
            toast.loading(t('uploading_assignment', 'Uploading assignment...'), { id: 'upload-assignment' });

            // Upload to Cloudinary using existing API
            const result = await uploadPdf(selectedFile, { signal });
            const cloudinaryUrl = result.url;

            // Call backend API to mark assignment as completed in user's enrollment
            const targetCourseId = assignment?.courseId;
            const targetAssignmentId = assignment?.id || assignment?._id;
            if (targetCourseId && targetAssignmentId) {
                try {
                    await submitAssignmentProgress(targetCourseId, targetAssignmentId, cloudinaryUrl, selectedFile.name, { signal });
                } catch (progressErr) {
                    if (progressErr.name === 'CanceledError' || progressErr.code === 'ERR_CANCELED') throw progressErr;
                    console.error("Failed to update assignment progress in backend:", progressErr);
                }
            }

            toast.success(t('assignment_uploaded', 'Assignment uploaded successfully!'), { id: 'upload-assignment' });

            const now = new Date();
            const submittedAt = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                + ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            const updatedAssignment = {
                ...assignment,
                status: 'Submitted',
                isCompleted: true
            };

            navigate('/assignment-submitted', {
                replace: true,
                state: {
                    assignment: updatedAssignment,
                    fileName: selectedFile.name,
                    fileUrl: cloudinaryUrl,
                    status: 'Submitted',
                    submittedAt,
                    returnUrl,
                    isLate: assignment.isLate || false
                }
            });
        } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                console.log("Upload aborted by user.");
            } else {
                console.error("Upload error:", error);
                toast.error(t('upload_failed', 'Failed to upload assignment. Please try again.'), { id: 'upload-assignment' });
            }
        } finally {
            setIsUploading(false);
        }
    };

    if (!assignment) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
                <h1 className="text-2xl font-bold text-gray-700 mb-4">{t('assignment_not_found', 'Assignment not found')}</h1>
                <button 
                    onClick={() => navigate(-1)} 
                    className="bg-[#4E6BFF] hover:bg-[#3f5be0] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    {t('go_back', 'Go Back')}
                </button>
            </div>
        );
    }

    const handleClose = () => {
        if (returnUrl) {
            navigate(returnUrl);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={`h-screen w-full flex flex-col bg-[#F8F9FA] overflow-hidden ${isUploading ? 'select-none' : ''}`}>
            {isUploading && (
                <div className="fixed inset-0 z-[9999] cursor-not-allowed" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />
            )}
            
            {/* Cancel Popup Modal */}
            {showCancelPopup && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <X size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('upload_cancelled_title', 'Upload Cancelled')}</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                {t('upload_cancelled_desc', 'Your assignment submission has been stopped. Please try submitting again.')}
                            </p>
                            <button
                                onClick={() => setShowCancelPopup(false)}
                                className="w-full bg-[#4E6BFF] hover:bg-[#3f5be0] text-white py-2.5 rounded-lg font-medium transition-colors"
                            >
                                {t('ok', 'OK')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <Navbar />

            {/* Popup Overlay Background */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gray-900/30 backdrop-blur-sm overflow-hidden">

                {/* Popup Container */}
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-5xl flex flex-col max-h-full animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-white rounded-t-2xl shrink-0">
                        <div>
                            <p className="text-sm font-semibold text-[#3758EE] mb-1">
                                {t('assignment_label', 'Assignment')} {assignment.number}
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                                {assignment.title}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {assignment.description}
                            </p>
                        </div>
                    </div>

                    {/* Content Grid (Scrollable) */}
                    <div className="flex flex-col lg:flex-row gap-6 px-6 py-6 overflow-y-auto custom-scrollbar bg-gray-50/30">
                        {/* Left Column: Instructions + Upload */}
                        <div className="flex-1 flex flex-col gap-5">
                            {/* Instructions Card */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">
                                    {t('instructions', 'Instructions')}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {assignment.instructions}
                                </p>

                                {assignment.pdfUrl && (Array.isArray(assignment.pdfUrl) ? assignment.pdfUrl.length > 0 : typeof assignment.pdfUrl === 'string') && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                                        <h4 className="text-sm font-semibold text-gray-800">{t('attached_documents', 'Attached Documents')}</h4>
                                        {(Array.isArray(assignment.pdfUrl) ? assignment.pdfUrl : [assignment.pdfUrl]).map((url, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="w-5 h-5 text-[#3758EE] flex-shrink-0" />
                                                    <span className="text-sm text-gray-700 truncate">
                                                        {url.split('/').pop() || `Attachment ${idx + 1}`}
                                                    </span>
                                                </div>
                                                <a
                                                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-1.5 bg-blue-100 text-[#3758EE] text-xs font-semibold rounded hover:bg-blue-200 transition-colors"
                                                >
                                                    {t('open', 'Open')}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Upload Card */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {t('upload_your_file', 'Upload your file')}
                                </h3>

                                {/* Drop Zone */}
                                <div
                                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 px-4 transition-colors duration-200 cursor-pointer
                                        ${dragOver
                                            ? 'border-[#3758EE] bg-blue-50'
                                            : 'border-gray-200 bg-gray-50 hover:border-[#3758EE] hover:bg-blue-50/30'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                                >
                                    {selectedFile ? (
                                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm w-full max-w-xs">
                                            <FileText className="w-6 h-6 text-[#3758EE] flex-shrink-0" />
                                            <span className="text-sm text-gray-700 truncate flex-1">{selectedFile.name}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                                                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                                <Upload className="w-6 h-6 text-[#3758EE]" />
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3">
                                                {t('drag_drop', 'Drag & drop or')}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                className="border border-[#3758EE] text-[#3758EE] text-sm px-5 py-1.5 rounded-full hover:bg-blue-50 transition-colors font-medium"
                                            >
                                                {t('browse_file', 'Browse file')}
                                            </button>
                                            <p className="text-xs text-gray-400 mt-3 text-center">
                                                {assignment.acceptedFormats.split(',').map(f => f.trim()).join(' / ')} — worksheet or task brief for students
                                            </p>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {/* Info Note */}
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>
                                        {t('max_file_size_note', `Max file size ${assignment.maxFileSizeMB} MB. You can resubmit anytime before the due date.`)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:w-[320px] flex-shrink-0">
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-0">
                                <div className="divide-y divide-gray-100">
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <span className="text-sm text-gray-500">{t('due_date', 'Due date')}</span>
                                        <span className="text-sm font-medium text-gray-800">{assignment.dueDate}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <span className="text-sm text-gray-500">{t('status', 'Status')}</span>
                                        <span className={`text-sm font-semibold ${(assignment.status === 'Submitted' || assignment.status === 'Completed' || assignment.isCompleted) ? 'text-green-500' : 'text-orange-500'
                                            }`}>
                                            {(assignment.status === 'Submitted' || assignment.status === 'Completed' || assignment.isCompleted) ? t('submitted', 'Submitted') : t(assignment.status ? assignment.status.toLowerCase().replace(/ /g, '_') : 'not_submitted', assignment.status || 'Not submitted')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <span className="text-sm text-gray-500">{t('accepted_formats', 'Accepted formats')}</span>
                                        <span className="text-sm font-medium text-gray-800">{assignment.acceptedFormats}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <span className="text-sm text-gray-500">{t('attempts', 'Attempts')}</span>
                                        <span className="text-sm font-medium text-gray-800">{assignment.attempts}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white rounded-b-2xl shrink-0">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isUploading}
                            className={`bg-gray-100 flex items-center justify-center transition-colors px-5 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-200'}`}
                        >
                            {t('cancel', 'Cancel')}
                        </button>
                        {isAdminView ? (
                            <GradiantButton
                                onClick={handleEditAssignment}
                                className="px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2"
                            >
                                {t('edit_assignment', 'Edit Assignment')}
                            </GradiantButton>
                        ) : (
                            <GradiantButton
                                onClick={handleSubmit}
                                disabled={!selectedFile || isUploading}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 ${(!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isUploading ? t('submitting', 'Submitting...') : t('submit_assignment', 'Submit Assignment')}
                            </GradiantButton>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}} />
        </div>
    );
};

export default AssignmentSubmission;
