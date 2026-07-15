import React, { useState } from 'react';
import { Monitor, MessageCircleQuestion, X } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';

const SelectContentTypeModal = ({ isOpen, onClose, onContinue }) => {
    const [selectedType, setSelectedType] = useState('Lecture');

    if (!isOpen) return null;

    const options = [
        {
            id: 'Lecture',
            title: 'Lecture',
            description: 'Add video content, text materials, or downloadable resources for students to learn from.',
            icon: Monitor,
        },
        {
            id: 'QA',
            title: 'Q&A',
            description: 'Add a Q&A session as a video lecture. Students can watch and attempt it the same way as a regular lecture.',
            icon: MessageCircleQuestion,
        },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
            <div className="bg-white w-full max-w-[830px] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden relative animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-gray-600 transition-colors z-20"
                >
                    <X size={20} className="md:w-6 md:h-6" />
                </button>

                <div className="px-6 py-6 md:px-10 md:py-10">
                    <div className="mb-6 md:mb-10">
                        <h2 className="text-[20px] md:text-[24px] font-bold text-[#0f172a] mb-2 tracking-tight">Select Content Type</h2>
                        <p className="text-[#64748b] text-[13px] md:text-[15px] font-medium leading-relaxed">Choose what you want to add inside this course structure.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {options.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => setSelectedType(option.id)}
                                className={`
                                    relative p-8 rounded-[20px] border-2 transition-all duration-300 cursor-pointer group flex flex-col items-start
                                    ${selectedType === option.id
                                        ? 'border-[#4f46e5] bg-[#f5f3ff] shadow-md shadow-[#4f46e5]/5'
                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}
                                `}
                            >
                                <div className={`
                                    w-12 h-12 md:w-14 md:h-14 rounded-[14px] flex items-center justify-center mb-4 md:mb-6 transition-all duration-300
                                    ${selectedType === option.id ? 'bg-[#4f46e5] text-white shadow-lg' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}
                                `}>
                                    <option.icon size={24} className="md:w-7 md:h-7" strokeWidth={2.5} />
                                </div>

                                <h3 className={`text-[18px] md:text-[20px] font-bold mb-2 md:mb-3 transition-colors ${selectedType === option.id ? 'text-[#0f172a]' : 'text-gray-400'}`}>
                                    {option.title}
                                </h3>
                                <p className={`text-[13px] md:text-[14px] leading-relaxed transition-colors ${selectedType === option.id ? 'text-gray-600 font-medium' : 'text-gray-300 font-medium'}`}>
                                    {option.description}
                                </p>

                                {selectedType === option.id && (
                                    <div className="absolute top-4 right-4">
                                        <div className="w-5 h-5 bg-[#4f46e5] rounded-full flex items-center justify-center p-1">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-5">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-10 py-3 text-[#64748b] border-[2px] border-gray-200 rounded-xl font-bold text-[14px] md:text-[15px] hover:text-[#0f172a] transition-all active:scale-95 order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <GradiantButton
                            onClick={() => onContinue(selectedType)}
                            className="w-full sm:w-auto px-14 py-3 font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-[14px] md:text-[15px] order-1 sm:order-2"
                        >
                            Continue
                        </GradiantButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectContentTypeModal;
