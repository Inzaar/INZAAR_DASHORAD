import React from 'react';
import ReactDOM from 'react-dom';
import { LogOut, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop - covers everything including sidebar */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-150 ease-out animate-in fade-in fill-mode-both"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white w-full max-w-[340px] rounded-[28px] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-150 ease-out will-change-transform">
                <div className="p-7 sm:p-9 flex flex-col items-center text-center">
                    {/* Icon Area */}
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping duration-[2000ms]" />
                        <LogOut className="text-red-500 w-8 h-8 relative z-10" strokeWidth={2.5} />
                    </div>
                    
                    {/* Text Area */}
                    <h3 className="text-[20px] sm:text-[22px] font-bold text-[#0f172a] mb-2 font-sans tracking-tight">Confirm Logout</h3>
                    <p className="text-[#64748b] text-[13px] sm:text-[14px] font-medium leading-relaxed font-sans px-1">
                        Are you sure you want to logout? You'll need to sign in again to access your dashboard.
                    </p>
                    
                    {/* Actions */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-1/2 py-3.5 bg-gray-50 text-[#64748b] font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98] font-sans text-[14px]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="w-full sm:w-1/2 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-[0_8px_20px_-5px_rgba(239,68,68,0.3)] hover:from-red-600 hover:to-red-700 hover:shadow-[0_12px_25px_-5px_rgba(239,68,68,0.4)] transition-all active:scale-[0.98] font-sans text-[14px]"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Close Button (X) */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
                >
                    <X size={18} />
                </button>
            </div>
        </div>,
        document.body
    );
};

export default LogoutModal;
