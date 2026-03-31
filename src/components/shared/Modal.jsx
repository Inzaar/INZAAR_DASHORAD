import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
            <div
                className="bg-white w-[98%] sm:w-[95%] lg:w-full max-w-[1261px] rounded-[10px] sm:rounded-[14px] shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[96vh] overflow-y-auto no-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (Optional if you want a dedicated 'X') */}
                {/* <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button> */}

                <div className="p-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
