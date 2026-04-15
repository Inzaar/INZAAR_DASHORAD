import React from 'react';
import ReactDOM from 'react-dom';
import { LogOut, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white w-[90%] max-w-[400px] rounded-[32px] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                <div className="p-10 flex flex-col items-center text-center">
                    {/* Icon Area */}
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8 relative">
                        <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping duration-1000" />
                        <LogOut className="text-red-500 w-10 h-10 relative z-10" strokeWidth={2.5} />
                    </div>
                    
                    {/* Text Area */}
                    <h3 className="text-[24px] font-bold text-[#0f172a] mb-3 font-sans tracking-tight">Confirm Logout</h3>
                    <p className="text-[#64748b] text-[15px] font-medium leading-relaxed font-sans px-2">
                        Are you sure you want to leave? All unsaved progress in your current session may be lost.
                    </p>
                    
                    {/* Actions */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-1/2 py-4 bg-gray-50 text-[#64748b] font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-[0.98] font-sans text-[15px]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="w-full sm:w-1/2 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-2xl shadow-[0_10px_25px_-5px_rgba(239,68,68,0.4)] hover:from-red-600 hover:to-red-700 hover:shadow-[0_15px_30px_-5px_rgba(239,68,68,0.5)] transition-all active:scale-[0.98] font-sans text-[15px]"
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Close Button (X) */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
                >
                    <X size={22} />
                </button>
            </div>
        </div>,
        document.body
    );
};

export default LogoutModal;
