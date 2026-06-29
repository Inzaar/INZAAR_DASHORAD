import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '@/components/layouts/NavBar';
import { ChevronRight, RotateCcw, Trophy, Loader } from 'lucide-react';
import { getQuizById, submitQuiz } from '@/api/quiz';
import LectureQuizAssessment from '../components/LectureQuizAssessment';

const QuizTakePage = () => {
    const navigate = useNavigate();
    const { id: quizId } = useParams();
    const location = useLocation();
    
    // Extract query parameters
    const queryParams = new URLSearchParams(location.search);
    const courseId = queryParams.get('courseId');
    const lectureId = queryParams.get('lectureId');

    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionId }
    
    const [isCompleted, setIsCompleted] = useState(false);
    const [result, setResult] = useState(null); // Data from submission
    
    const [selectedOption, setSelectedOption] = useState(null); // Currently selected option in UI
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await getQuizById(quizId);
                setQuizData(res.data);
            } catch (error) {
                console.error("Failed to fetch quiz", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    // Derived states
    const questions = quizData?.questions || [];
    const totalQuestions = questions.length;
    const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;
    const currentQuestion = questions[currentQuestionIndex];

    // Load saved option if navigating backward? We only go forward for now.
    useEffect(() => {
        if (currentQuestion) {
            setSelectedOption(selectedAnswers[currentQuestion._id] || null);
        }
    }, [currentQuestionIndex, currentQuestion, selectedAnswers]);

    const handleNext = async () => {
        if (!currentQuestion) return;

        // Save selected answer
        const newAnswers = {
            ...selectedAnswers,
            [currentQuestion._id]: selectedOption
        };
        setSelectedAnswers(newAnswers);

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Finish Quiz
            await handleSubmit(newAnswers);
        }
    };

    const handleSubmit = async (finalAnswers) => {
        setSubmitting(true);
        try {
            const res = await submitQuiz(quizId, {
                courseId,
                submittedAnswers: finalAnswers
            });
            setResult(res.data);
            setIsCompleted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit quiz: " + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setIsCompleted(false);
        setSelectedOption(null);
        setSelectedAnswers({});
        setResult(null);
    };

    const handleContinue = () => {
        const returnPath = queryParams.get('returnPath');
        if (returnPath) {
            navigate(decodeURIComponent(returnPath));
        } else if (courseId && lectureId) {
            // Safe fallback if returnPath is completely missing
            navigate(`/course-play?id=${courseId}&lectureId=${lectureId}`);
        } else {
            navigate(-1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6]">
                <Loader className="w-10 h-10 animate-spin text-[#3758EE] mb-4" />
                <p className="text-gray-500 font-medium">Loading Quiz...</p>
            </div>
        );
    }

    if (!quizData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6]">
                <p className="text-gray-500 font-medium mb-4">Quiz not found.</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-500 text-white rounded">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#F3F4F6] font-sans overflow-y-auto">
            <div className="sticky top-0 z-50">
                <Navbar onMenuClick={() => { }} />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 md:py-16 md:px-8">
                {!isStarted ? (
                    <div className="w-full max-w-[700px] flex items-center justify-center">
                        <LectureQuizAssessment 
                            quizId={quizId} 
                            onStart={() => setIsStarted(true)} 
                        />
                    </div>
                ) : !isCompleted ? (
                    <div className="w-full max-w-[800px] bg-white rounded-[16px] md:rounded-[24px] shadow-lg border border-gray-100/50 p-6 md:p-10 lg:p-12 my-4 md:my-0">
                        {/* Header: Question Progress */}
                        <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
                            <div className="flex justify-between items-center text-xs md:text-sm font-medium">
                                <span className="text-gray-400">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                                <span className="text-[#3758EE]">{Math.round(progress)}% Complete</span>
                            </div>
                            <div className="w-full h-2 md:h-2.5 bg-[#EEEFF1] rounded-full overflow-hidden">
                                <div className="h-full bg-[#3758EE] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        {/* Question content */}
                        <h2 className="text-xl md:text-2xl lg:text-[28px] font-bold text-gray-800 mb-2 leading-tight">
                            {currentQuestion?.questionText}
                        </h2>
                        {currentQuestion?.description && (
                            <p className="text-gray-500 text-sm md:text-base mb-6 md:mb-10">{currentQuestion.description}</p>
                        )}
                        {!currentQuestion?.description && <div className="mb-6 md:mb-10"></div>}

                        {/* Media Display */}
                        {currentQuestion?.mediaUrl && (
                            <div className="mb-8 rounded-xl overflow-hidden bg-gray-50 border max-h-[300px] flex items-center justify-center">
                                {currentQuestion.mediaType === 'video' ? (
                                    <video src={currentQuestion.mediaUrl} controls className="max-w-full max-h-[300px]" />
                                ) : (
                                    <img src={currentQuestion.mediaUrl} alt="Question Media" className="max-w-full max-h-[300px] object-contain" />
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 md:gap-4 mb-8 md:mb-12">
                            {currentQuestion?.options?.map((option, idx) => (
                                <button
                                    key={option._id || idx}
                                    onClick={() => setSelectedOption(option._id || idx.toString())}
                                    className={`flex items-center w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border text-left transition-all duration-200 ${selectedOption === (option._id || idx.toString()) ? 'border-[#3758EE] bg-blue-50/30 ring-1 ring-[#3758EE]/50' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <span className={`text-sm md:text-base font-semibold ${selectedOption === (option._id || idx.toString()) ? 'text-[#3758EE]' : 'text-gray-500'}`}>
                                        {String.fromCharCode(65 + idx)}. {option.text}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-50">
                            <button
                                onClick={handleNext}
                                disabled={!selectedOption || submitting}
                                className={`
                                    flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 font-bold rounded-xl transition-all group
                                    ${(!selectedOption || submitting)
                                        ? 'bg-[#E5E7EB] text-gray-400 cursor-not-allowed opacity-70'
                                        : 'bg-gradient-to-r from-[#3758EE] to-[#9333EA] text-white hover:opacity-90 shadow-lg'
                                    }
                                `}
                            >
                                {submitting && <Loader className="w-4 h-4 animate-spin mr-1" />}
                                <span>{currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                                {!submitting && <ChevronRight size={18} className={`${selectedOption ? 'group-hover:translate-x-1' : ''} transition-transform`} />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-[620px] bg-white rounded-[16px] md:rounded-[24px] shadow-2xl border border-gray-100/50 p-6 sm:p-8 md:p-12 lg:p-14 text-center my-4 md:my-0 flex flex-col items-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FFF7ED] rounded-full flex items-center justify-center mb-4 md:mb-6 animate-bounce shadow-inner">
                            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-[#F97316]" />
                        </div>

                        <div className="mb-6 md:mb-8 px-2">
                            <h2 className="text-2xl md:text-[32px] font-bold text-gray-900 mb-2 leading-tight">
                                {result?.isPassed ? 'Quiz Passed! 🎊' : 'Needs Improvement 📚'}
                            </h2>
                            <p className="text-[#64748B] text-sm md:text-base px-2">
                                {result?.isPassed ? 'Great effort! Here is your result.' : 'Review the material and try again to unlock the next lecture.'}
                            </p>
                        </div>

                        <div className="w-full bg-[#F5F7FF] rounded-[20px] md:rounded-[24px] p-6 md:p-8 mb-6 md:mb-8 flex flex-col items-center">
                            <div className="mb-6 md:mb-10 text-center">
                                <p className="text-gray-400 text-xs md:text-sm font-medium mb-1 uppercase tracking-wider">Your Score</p>
                                <div className="flex items-baseline justify-center gap-1.5 md:gap-2">
                                    <span className={`text-4xl md:text-[48px] font-bold ${result?.isPassed ? 'text-green-500' : 'text-[#3758EE]'}`}>{result?.score}</span>
                                    <span className="text-xl md:text-[28px] font-medium text-gray-300">/ {result?.totalPossibleScore}</span>
                                </div>
                            </div>

                            <div className="relative w-full flex flex-col items-center">
                                <p className="text-gray-400 text-xs md:text-sm font-medium mb-4 uppercase tracking-wider text-center">Correct Percentage</p>
                                <div className="relative flex items-center justify-center">
                                    <svg className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90">
                                        <circle cx="50%" cy="50%" r="45%" stroke="#EEEFF1" strokeWidth="8" fill="transparent" />
                                        <circle
                                            cx="50%" cy="50%" r="45%"
                                            stroke={result?.isPassed ? '#22C55E' : '#3758EE'}
                                            strokeWidth="8"
                                            strokeDasharray={`${(result?.percentage || 0) * 2.83}% 283%`}
                                            fill="transparent"
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <span className="absolute text-xl md:text-[28px] font-bold text-gray-800">
                                        {Math.round(result?.percentage || 0)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {quizData.allowRetry && (!quizData.maximumAttempts || result?.attemptNumber < quizData.maximumAttempts) && (
                            <div className="w-full bg-[#F8F9FA] rounded-xl py-3 px-4 md:py-4 md:px-6 mb-8 md:mb-10 text-center border border-gray-100/50">
                                <p className="text-[#64748B] text-xs md:text-sm leading-relaxed">
                                    You can retry the quiz to improve your score.
                                </p>
                            </div>
                        )}

                        <div className="w-full flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                            {quizData.allowRetry && (!quizData.maximumAttempts || result?.attemptNumber < quizData.maximumAttempts) && (
                                <button
                                    onClick={handleRetry}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 border-2 border-[#3758EE] text-[#3758EE] font-bold text-sm md:text-[15px] rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap min-w-[140px]"
                                >
                                    <RotateCcw size={16} />
                                    <span>Retry Quiz</span>
                                </button>
                            )}
                            <button
                                onClick={handleContinue}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#3758EE] to-[#9333EA] text-white font-bold text-sm md:text-[15px] rounded-xl hover:opacity-90 transition-opacity shadow-md whitespace-nowrap"
                            >
                                <span>{result?.isPassed ? 'Continue Course' : 'Go Back'}</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                .font-sans { font-family: 'Roboto', sans-serif; }
                @keyframes bounce { 0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); } }
                .animate-bounce { animation: bounce 1s infinite; }
            `}} />
        </div>
    );
};

export default QuizTakePage;
