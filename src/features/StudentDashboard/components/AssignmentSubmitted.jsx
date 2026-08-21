import React, { useState } from 'react';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import GrayButton from '@/components/ui/buttons/GrayButton';
import { Check, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AssignmentSubmitted = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const { assignment, fileName, status, submittedAt, returnUrl } = location.state || {};
    const successMessage = assignment?.successMessage
        || 'Your assignment was submitted and is now marked complete.';

    const handleClose = () => {
        if (returnUrl) {
            navigate(returnUrl);
        } else {
            navigate(-1);
        }
    };

    const handleResubmit = () => navigate('/assignment', { state: { assignment, returnUrl } });

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#F8F9FA]">
            <Navbar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

                {/* Green Checkmark Icon */}
                <div className="w-16 h-16 rounded-full bg-[#ECFDF3] flex items-center justify-center mb-6">
                    <Check className="w-8 h-8 text-[#027A48] stroke-[1.5]" />
                </div>

                {/* Title */}
                <h2 className="text-[22px] md:text-2xl font-semibold text-gray-900 mb-3">
                    {t('assignment_submitted', 'Assignment submitted')}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-500 text-center max-w-[500px] leading-relaxed mb-8">
                    {successMessage}
                </p>

                {/* Details Card */}
                <div className="w-full max-w-[600px] bg-white rounded-[16px] shadow-sm px-6 py-2">

                    {/* File */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                        <span className="text-sm text-gray-500">{t('file', 'File')}</span>
                        <span className="text-sm font-medium text-gray-800">{fileName || 'assignment_document.pdf'}</span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                        <span className="text-sm text-gray-500">{t('status', 'Status')}</span>
                        <span className="text-sm font-medium text-[#027A48]">{status || 'Completed'}</span>
                    </div>

                    {/* Submitted At */}
                    <div className="flex justify-between items-center py-4">
                        <span className="text-sm text-gray-500">{t('submitted', 'Submitted')}</span>
                        <span className="text-sm font-medium text-gray-800">{submittedAt || new Date().toLocaleString()}</span>
                    </div>
                </div>

                {/* Grading Feedback Section */}
                <div className="w-full max-w-[600px] mt-6">
                    {location.state?.status === 'Graded' ? (
                        <div className="bg-white rounded-[16px] shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Grading & Feedback</h3>

                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Score / Marks</span>
                                    <span className="text-[15px] font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                                        {location.state?.score !== undefined && location.state?.score !== null ? location.state.score : '—'} / {location.state?.totalScore || 100}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-sm text-gray-500 block mb-2">Instructions / Feedback</span>
                                    <div className="bg-[#F8F9FA] rounded-lg p-4 text-[13px] text-gray-700 leading-relaxed min-h-[80px]">
                                        {location.state?.feedback || 'No additional feedback provided.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50/50 rounded-[16px] border border-blue-100 p-6 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <h4 className="text-[15px] font-semibold text-gray-900 mb-1">Waiting for review</h4>
                            <p className="text-[13px] text-gray-500 max-w-[350px]">Your assignment has been submitted successfully. An admin will review it and post your grades here.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 sm:px-12 py-4 flex items-center justify-between mt-auto shrink-0">
                {location.state?.isLate ? (
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                            <X size={16} strokeWidth={3} />
                        </span>
                        <span className="text-sm font-medium text-red-600">{t('late', 'Late - Past Due Date')}</span>
                    </div>
                ) : (
                    <GrayButton
                        onClick={handleResubmit}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors bg-white"
                    >
                        {t('resubmit_before_due_date', 'Resubmit Before Due Date')}
                    </GrayButton>
                )}

                <GradiantButton
                    onClick={handleClose}
                    className="px-8 py-2.5 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-500/20"
                >
                    {t('close', 'Close')}
                </GradiantButton>
            </div>
        </div>
    );
};

export default AssignmentSubmitted;
