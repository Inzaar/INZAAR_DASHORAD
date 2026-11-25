import React, { useState } from 'react';
import { BookOpen, FileQuestion, ClipboardList, X, Info } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import toast from 'react-hot-toast';

const SelectContentTypeModal = ({ isOpen, onClose, onContinue, hasLectures = false }) => {
    const [selectedType, setSelectedType] = useState('Lecture');

    if (!isOpen) return null;

    const handleSelectOption = (optionId) => {
        if (!hasLectures) {
            if (optionId === 'Quiz' || optionId === 'Assignment') {
                const message = optionId === 'Quiz'
                    ? 'No lecture available. You cannot create a quiz until a lecture is created.'
                    : 'No lecture available. You cannot create an assignment until a lecture is created.';

                toast.custom((t) => (
                    <div
                        className={`${
                            t.visible ? 'animate-in fade-in zoom-in-95' : 'animate-out fade-out zoom-out-95'
                        } max-w-md w-full bg-white shadow-[0_12px_40px_rgba(15,23,42,0.15)] rounded-2xl pointer-events-auto flex items-center p-4 border border-indigo-100 gap-3.5 transition-all duration-200`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center flex-shrink-0">
                            <Info size={22} className="stroke-[2.5]" />
                        </div>
                        <div className="flex-1 text-[14px] font-medium text-[#0f172a] leading-snug">
                            {message}
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ), { id: 'no-lecture-info-toast', duration: 4000 });
            }
        }
        setSelectedType(optionId);
    };

    const isContinueDisabled = !hasLectures && selectedType !== 'Lecture';

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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-3 sm:p-4 font-sans overflow-y-auto">
            <div className="bg-white w-full max-w-[1050px] max-h-[94vh] rounded-[20px] sm:rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-y-auto relative animate-in fade-in zoom-in duration-300 my-auto custom-scrollbar-thin">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-5 sm:right-5 lg:top-6 lg:right-6 text-gray-400 hover:text-gray-600 transition-colors z-20 p-1"
                >
                    <X size={20} className="w-4.5 h-4.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </button>

                <div className="p-4 sm:p-6 md:p-7 lg:p-10">
                    <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-10 pr-6 sm:pr-8">
                        <h2 className="text-[17px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-bold text-[#0f172a] mb-0.5 sm:mb-1.5 md:mb-2 tracking-tight">Select Content Type</h2>
                        <p className="text-[#64748b] text-[12px] sm:text-[13px] md:text-[13.5px] lg:text-[15px] font-medium leading-normal sm:leading-relaxed">Choose what you want to add inside this course structure.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-6 mb-4 sm:mb-5 md:mb-6 lg:mb-10">
                        {options.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => handleSelectOption(option.id)}
                                className={`
                                    relative p-3 sm:p-4 md:p-[18px] lg:p-8 rounded-[14px] sm:rounded-[16px] md:rounded-[18px] lg:rounded-[20px] border-2 transition-all duration-300 cursor-pointer group flex flex-col items-start
                                    ${selectedType === option.id
                                        ? 'border-[#4f46e5] bg-[#f5f3ff] shadow-md shadow-[#4f46e5]/5'
                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}
                                `}
                            >
                                <div className={`
                                    w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-14 lg:h-14 rounded-[8px] sm:rounded-[10px] md:rounded-[12px] lg:rounded-[14px] flex items-center justify-center mb-1.5 sm:mb-3 md:mb-3.5 lg:mb-6 transition-all duration-300
                                    ${selectedType === option.id ? 'bg-[#4f46e5] text-white shadow-lg' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}
                                `}>
                                    <option.icon size={18} className="w-4 h-4 sm:w-5 sm:h-5 md:w-[22px] md:h-[22px] lg:w-7 lg:h-7" strokeWidth={2.5} />
                                </div>

                                <h3 className={`text-[14.5px] sm:text-[16px] md:text-[17px] lg:text-[20px] font-bold mb-0.5 sm:mb-1.5 md:mb-2 lg:mb-3 transition-colors ${selectedType === option.id ? 'text-[#0f172a]' : 'text-gray-400'}`}>
                                    {option.title}
                                </h3>
                                <p className={`text-[11.5px] sm:text-[12px] md:text-[12.5px] lg:text-[14px] leading-snug md:leading-relaxed transition-colors ${selectedType === option.id ? 'text-gray-600 font-medium' : 'text-gray-300 font-medium'}`}>
                                    {option.description}
                                </p>

                                {selectedType === option.id && (
                                    <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 lg:top-4 lg:right-4">
                                        <div className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 bg-[#4f46e5] rounded-full flex items-center justify-center p-0.5 md:p-1">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-row justify-end gap-2 sm:gap-4 lg:gap-5">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-initial sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-2.5 lg:px-10 lg:py-3 text-[#64748b] border-[2px] border-gray-200 rounded-xl font-bold text-[12.5px] sm:text-[13px] md:text-[14px] lg:text-[15px] hover:text-[#0f172a] transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <GradiantButton
                            onClick={() => onContinue(selectedType)}
                            disabled={isContinueDisabled}
                            className="flex-1 sm:flex-initial sm:w-auto px-6 py-2 sm:px-10 sm:py-2.5 md:px-11 md:py-2.5 lg:px-14 lg:py-3 font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-[12.5px] sm:text-[13px] md:text-[14px] lg:text-[15px]"
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
