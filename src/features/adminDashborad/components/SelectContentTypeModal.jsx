import React, { useState } from 'react';
import { BookOpen, FileQuestion, ClipboardList, X } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';

const SelectContentTypeModal = ({ isOpen, onClose, onContinue }) => {
    const [selectedType, setSelectedType] = useState('Quiz');

    if (!isOpen) return null;

    const options = [
        {
            id: 'Lecture',
            title: 'Lecture',
            description: 'Add video content, text materials, or downloadable resources for students to learn from.',
            icon: BookOpen,
        },
        {
            id: 'Quiz',
            title: 'Quiz',
            description: 'Add an assessment between lectures with multiple questions, options, scoring, and completion settings.',
            icon: FileQuestion,
        },
        {
            id: 'Assignment',
            title: 'Assignment',
            description: 'Add a task students must submit a file for. Required before the next lecture unlocks.',
            icon: ClipboardList,
        },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
            <div className="bg-white w-full max-w-[900px] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden relative animate-in fade-in zoom-in duration-300">

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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {options.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => setSelectedType(option.id)}
                                className={`
                                    relative p-6 md:p-8 rounded-[20px] border-2 transition-all duration-300 cursor-pointer group flex flex-col items-start
                                    ${selectedType === option.id
                                        ? 'border-[#6366f1] bg-[#f5f3ff] shadow-sm'
                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 bg-white'}
                                `}
                            >
                                <div className={`
                                    w-12 h-12 md:w-14 md:h-14 rounded-[14px] flex items-center justify-center mb-4 md:mb-6 transition-all duration-300 border
                                    ${selectedType === option.id 
                                        ? 'bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] border-transparent text-white shadow-lg shadow-[#3758EE]/30' 
                                        : 'bg-white border-gray-100 text-gray-600 group-hover:border-gray-200 group-hover:bg-gray-50'}
                                `}>
                                    <option.icon size={24} className="md:w-7 md:h-7" strokeWidth={2} />
                                </div>

                                <h3 className="text-[18px] md:text-[20px] font-bold mb-2 md:mb-3 text-[#0f172a] transition-colors">
                                    {option.title}
                                </h3>
                                <p className="text-[13px] md:text-[14px] leading-relaxed text-[#64748b] font-medium">
                                    {option.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 md:mt-12">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-10 py-3 text-gray-700 bg-white border-[1px] border-gray-200 rounded-xl font-bold text-[14px] md:text-[15px] hover:bg-gray-50 transition-all active:scale-95 order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <GradiantButton
                            onClick={() => onContinue(selectedType)}
                            className="w-full sm:w-auto px-14 py-3 font-bold rounded-xl shadow-md shadow-[#3758EE]/20 active:scale-95 transition-all text-[14px] md:text-[15px] order-1 sm:order-2"
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

