import React from 'react';
import ReactDOM from 'react-dom';
import { LogOut, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop - covers everything including sidebar */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-150 ease-out animate-in fade-in fill-mode-both"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white w-full max-w-[300px] sm:max-w-[340px] rounded-[28px] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-150 ease-out will-change-transform">
                <div className="p-5 sm:p-9 flex flex-col items-center text-center">
                    {/* Icon Area */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4 sm:mb-6 relative">
                        <div className="absolute inset-0 bg-[#6366F1]/10 rounded-full animate-ping duration-[2000ms]" />
                        <LogOut className="text-[#6366F1] w-7 h-7 sm:w-8 sm:h-8 relative z-10" strokeWidth={2.5} />
                    </div>
                    
                    {/* Text Area */}
                    <h3 className="text-[19px] sm:text-[22px] font-bold text-[#0f172a] mb-2 font-sans tracking-tight">{t('auth.confirm_logout', 'Confirm Logout')}</h3>
                    <p className="text-[#64748b] text-[12px] sm:text-[14px] font-medium leading-relaxed font-sans px-1">
                        {t('auth.logout_confirmation_text', 'Are you sure you want to logout? You\'ll need to sign in again to access your dashboard.')}
                    </p>
                    
                    {/* Actions */}
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-1/2 py-3 sm:py-3.5 bg-gray-50 text-[#64748b] font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98] font-sans text-[13px] sm:text-[14px]"
                        >
                            {t('auth.cancel', 'Cancel')}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="w-full sm:w-1/2 py-3.5 sm:py-4 bg-gradient-to-r from-[#6366F1] to-[#4f46e5] text-white font-bold rounded-xl shadow-[0_8px_20px_-5px_rgba(99,102,241,0.3)] hover:from-[#4f46e5] hover:to-[#3730a3] hover:shadow-[0_12px_25px_-5px_rgba(99,102,241,0.4)] transition-all active:scale-[0.98] font-sans text-[13px] sm:text-[14px]"
                        >
                            {t('auth.logout', 'Logout')}
                        </button>
                    </div>
                </div>

                {/* Close Button (X) */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
                >
                    <X size={18} />
                </button>
            </div>
        </div>,
        document.body
    );
};

export default LogoutModal;
