import React, { useState } from 'react';
import { Mail, CheckCircle2, X } from 'lucide-react';

const ReminderModal = ({ isOpen, onClose, onConfirm, isSending, studentName, itemTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm font-sans p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto relative animate-in fade-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#3758EE]">
                        <Mail size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Student Has Not Completed
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-6 px-4">
                        <span className="font-semibold text-gray-700">{studentName || 'This student'}</span> has not completed <span className="italic">"{itemTitle || 'this item'}"</span> yet. Would you like to send them a reminder notification?
                    </p>
                    
                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isSending}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3758EE] to-[#9333EA] text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            {isSending ? (
                                <span className="animate-pulse">Sending...</span>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    Send Reminder
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;
