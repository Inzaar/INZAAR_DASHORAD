import React from 'react';
import { GraduationCap } from 'lucide-react';

const LectureQuizAssessment = ({ quizData, onStart }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center py-6 md:py-10 px-4 font-sans">
            <div className="w-full max-w-[680px] bg-white rounded-[24px] md:rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-50 flex flex-col items-center p-6 md:p-10 lg:p-12 text-center relative overflow-hidden">

                {/* Icon Circle */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-inner">
                    <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-[#4F46E5]" />
                </div>

                {/* Title and Description */}
                <h2 className="text-2xl md:text-[28px] font-bold text-[#1E293B] mb-2 leading-tight px-2">
                    Lecture Quiz Assessment
                </h2>
                <p className="text-[#64748B] text-sm md:text-[16px] mb-8 md:mb-10 max-w-[480px] leading-relaxed px-4">
                    Test your understanding of the lecture before moving to the next lesson.
                </p>

                {/* Info Box */}
                <div className="w-full bg-[#F8FAFC] rounded-2xl p-6 md:p-8 mb-8 md:mb-10 text-left border border-gray-50">
                    <ul className="space-y-3 md:space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-2 flex-shrink-0"></div>
                            <span className="text-[#1E293B] font-medium text-sm md:text-[15px]">Total Questions: {quizData?.totalQuestions || 7}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-2 flex-shrink-0"></div>
                            <span className="text-[#1E293B] font-medium text-sm md:text-[15px]">Each question has 4 options</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-2 flex-shrink-0"></div>
                            <span className="text-[#1E293B] font-medium text-sm md:text-[15px]">You can retry the quiz after completion</span>
                        </li>
                    </ul>
                </div>

                {/* Start Button */}
                <button
                    onClick={onStart}
                    className="w-full py-3.5 md:py-4.5 bg-gradient-to-r from-[#4F46E5] to-[#A855F7] text-white font-bold text-base md:text-[18px] rounded-xl hover:scale-[1.01] transition-all active:scale-[0.98] shadow-lg shadow-indigo-100 mb-5"
                >
                    Start Quiz
                </button>

                {/* Footer Text */}
                <p className="text-[#94A3B8] text-xs md:text-sm font-medium">
                    Click start to begin the quiz.
                </p>
            </div>
        </div>
    );
};

export default LectureQuizAssessment;
