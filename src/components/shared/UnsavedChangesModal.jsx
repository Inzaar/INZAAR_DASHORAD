import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UnsavedChangesModal = ({ isOpen, onProceed, onCancel }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
            <div
                className="bg-white rounded-[24px] w-full max-w-[400px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <h2 className="text-[20px] font-bold text-[#0f172a] mb-2">
                        {t('unsavedChangesTitle', 'Unsaved Changes')}
                    </h2>
                    <p className="text-[14px] text-gray-500 mb-6">
                        {t('unsavedChangesMessage', 'You have unsaved changes. If you leave this page, your modifications will be lost.')}
                    </p>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onProceed}
                            className="px-5 py-2.5 text-[14px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                            {t('leavePage', 'Leave Page')}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 text-[14px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                        >
                            {t('stayAndEdit', 'Stay / Keep Editing')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnsavedChangesModal;
