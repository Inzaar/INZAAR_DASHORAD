import React, { useEffect, useState } from 'react';
import { GraduationCap, Loader } from 'lucide-react';
import { getQuizById } from '@/api/quiz';

const LectureQuizAssessment = ({ quizId, onStart, isAdminView, onEdit, onCancel }) => {
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!quizId) {
            setLoading(false);
            return;
        }
        
        const fetchQuiz = async () => {
            try {
                const res = await getQuizById(quizId);
                setQuizData(res.data);
            } catch (error) {
                console.error("Failed to fetch quiz for assessment popup", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const totalQuestions = quizData?.questions?.length || 0;
    const allowRetry = quizData?.allowRetry ?? true;

    return (
        <div className="w-full flex flex-col items-center justify-center font-sans">
            <div className="w-full bg-white rounded-2xl sm:rounded-[24px] shadow-2xl border border-gray-100/50 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-14 text-center relative animate-in fade-in zoom-in-95 duration-500">

                {/* Icon Circle */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-3 sm:mb-6 md:mb-8 shadow-sm">
                    <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#4F46E5]" />
                </div>

                {/* Title and Description */}
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-[#1E293B] mb-1.5 sm:mb-2 leading-tight px-1">
                    {quizData?.title || "Lecture Quiz Assessment"}
                </h2>
                <p className="text-[#64748B] text-xs sm:text-sm md:text-lg font-medium mb-4 sm:mb-8 md:mb-10 max-w-[600px] px-1">
                    {quizData?.shortDescription || "Test your understanding of the lecture before moving to the next lesson."}
                </p>

                {/* Info Box */}
                {loading ? (
                    <div className="w-full max-w-[600px] bg-[#F8FAFC] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-8 flex justify-center border border-gray-50">
                        <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="w-full max-w-[600px] bg-[#F8FAFC] rounded-xl sm:rounded-2xl p-3.5 sm:p-6 md:p-10 mb-4 sm:mb-8 md:mb-12 text-left border border-gray-50">
                        <ul className="space-y-2.5 sm:space-y-4">
                            <li className="flex items-center gap-2.5 sm:gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] flex-shrink-0"></div>
                                <span className="text-[#4F5E71] font-medium text-xs sm:text-sm md:text-base">Total Questions: {totalQuestions}</span>
                            </li>
                            <li className="flex items-center gap-2.5 sm:gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] flex-shrink-0"></div>
                                <span className="text-[#4F5E71] font-medium text-xs sm:text-sm md:text-base">Each question has 4 options</span>
                            </li>
                            {allowRetry && (
                                <li className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] flex-shrink-0"></div>
                                    <span className="text-[#4F5E71] font-medium text-xs sm:text-sm md:text-base">
                                        You can retry the quiz after completion
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Start/Edit and Cancel Buttons */}
                <div className="w-full max-w-[600px] flex flex-row gap-2.5 sm:gap-4 mb-3 sm:mb-6">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="w-1/3 py-2.5 sm:py-4 md:py-5 font-bold text-xs sm:text-base md:text-xl rounded-xl sm:rounded-2xl transition-all shadow-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-[0.98] shrink-0"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={isAdminView ? onEdit : onStart}
                        disabled={(!isAdminView && loading) || (!isAdminView && totalQuestions === 0)}
                        className={`w-full ${onCancel ? 'w-2/3' : 'max-w-[600px]'} py-2.5 sm:py-4 md:py-5 font-bold text-xs sm:text-base md:text-xl rounded-xl sm:rounded-2xl transition-all shadow-lg
                            ${((!isAdminView && loading) || (!isAdminView && totalQuestions === 0)) ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#4F46E5] to-[#A855F7] text-white hover:opacity-90 active:scale-[0.98] shadow-indigo-100'}
                        `}
                    >
                        {isAdminView ? 'Edit Quiz' : (totalQuestions === 0 && !loading ? 'No Questions Added' : 'Start Quiz')}
                    </button>
                </div>

                {/* Footer Text */}
                <p className="text-[#94A3B8] text-[11px] sm:text-xs md:text-sm font-medium">
                    {totalQuestions === 0 && !loading ? 'This quiz is not ready yet.' : 'Click start to begin the quiz.'}
                </p>
            </div>
        </div>
    );
};

export default LectureQuizAssessment;
