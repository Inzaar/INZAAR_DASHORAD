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

            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 sm:px-12 py-4 flex items-center justify-between mt-auto shrink-0">
                <GrayButton
                    onClick={handleResubmit}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors bg-white"
                >
                    {t('resubmit_before_due_date', 'Resubmit Before Due Date')}
                </GrayButton>

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
