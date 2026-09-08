import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '@/components/layouts/NavBar';
import { ChevronRight, RotateCcw, Trophy, Loader, CheckCircle2, XCircle, FileText, ArrowLeft, HelpCircle } from 'lucide-react';
import { getQuizById, submitQuiz, getLatestQuizAttempt } from '@/api/quiz';
import LectureQuizAssessment from '../components/LectureQuizAssessment';

const QuizTakePage = () => {
    const navigate = useNavigate();
    const { id: quizId } = useParams();
    const location = useLocation();

    // Extract query parameters
    const queryParams = new URLSearchParams(location.search);
    const courseId = queryParams.get('courseId') || queryParams.get('id');
    const lectureId = queryParams.get('lectureId');
    const isAdminView = location.pathname.includes('admin') || queryParams.get('admin') === 'true';

    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionId }

    const [isCompleted, setIsCompleted] = useState(location.state?.viewStudent || false);
    const [result, setResult] = useState(location.state?.result || null); // Data from submission
    const [showReview, setShowReview] = useState(false);

    const [selectedOption, setSelectedOption] = useState(null); // Currently selected option in UI
    const [isStarted, setIsStarted] = useState(location.state?.viewStudent || false);

    useEffect(() => {
        const fetchQuizAndAttempt = async () => {
            try {
                const res = await getQuizById(quizId);
                setQuizData(res.data);

                // Fetch latest attempt if not available in location state
                if (!result) {
                    try {
                        const attemptRes = await getLatestQuizAttempt(quizId);
                        if (attemptRes?.data) {
                            setResult(attemptRes.data);
                            if (attemptRes.data.submittedAnswers) {
                                setSelectedAnswers(attemptRes.data.submittedAnswers);
                            }
                        }
                    } catch (err) {
                        console.log("No previous attempt found", err);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch quiz", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizAndAttempt();
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

    const handleEditQuiz = () => {
        if (courseId && lectureId) {
            navigate(`/admin-add-course?edit=true&id=${courseId}&openQuizId=${quizId}&lectureId=${lectureId}`);
        } else {
            console.error("Missing courseId or lectureId in URL params.");
        }
    };

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
        setShowReview(false);
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

    if (!loading && !quizData) {
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
                            isAdminView={isAdminView}
                            onEdit={handleEditQuiz}
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
                ) : showReview ? (
                    <div className="w-full max-w-[800px] bg-white rounded-[16px] md:rounded-[24px] shadow-2xl border border-gray-100/50 p-6 md:p-10 my-4 md:my-0 flex flex-col gap-6 animate-in fade-in duration-300">
                        {/* Header bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-100 gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${result?.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {result?.isPassed ? 'Passed' : 'Needs Improvement'}
                                    </span>
                                    {result?.attemptNumber && (
                                        <span className="text-gray-400 text-xs font-medium">Attempt #{result.attemptNumber}</span>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mt-1">Quiz Attempt Review</h2>
                                <p className="text-sm text-gray-500">Review your selected choices and correct options for each question</p>
                            </div>

                            <button
                                onClick={() => setShowReview(false)}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0"
                            >
                                <ArrowLeft size={16} />
                                <span>Back to Summary</span>
                            </button>
                        </div>

                        {/* Score Stats Bar */}
                        <div className="grid grid-cols-3 gap-3 bg-[#F8FAFC] rounded-2xl p-4 text-center border border-gray-100">
                            <div>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Score</p>
                                <p className="text-lg md:text-xl font-bold text-gray-800">{result?.score || 0} / {result?.totalPossibleScore || quizData?.totalMarks || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Percentage</p>
                                <p className={`text-lg md:text-xl font-bold ${result?.isPassed ? 'text-green-600' : 'text-purple-600'}`}>{Math.round(result?.percentage || 0)}%</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Questions</p>
                                <p className="text-lg md:text-xl font-bold text-gray-800">{questions.length}</p>
                            </div>
                        </div>

                        {/* Questions Review List */}
                        <div className="space-y-6">
                            {questions.map((q, qIdx) => {
                                const userSelectedId = selectedAnswers[q._id] !== undefined
                                    ? selectedAnswers[q._id]
                                    : (result?.submittedAnswers && result.submittedAnswers[q._id]);

                                // Determine if question was answered correctly
                                const evalAnswer = result?.answers?.find(a => String(a.questionId) === String(q._id));
                                const isQuestionCorrect = evalAnswer
                                    ? evalAnswer.isCorrect
                                    : q.options?.some((opt, idx) => {
                                        const optIdStr = opt._id ? String(opt._id) : String(idx);
                                        return (optIdStr === String(userSelectedId) || String(idx) === String(userSelectedId)) && opt.isCorrect;
                                    });

                                return (
                                    <div key={q._id || qIdx} className="bg-gray-50/70 rounded-2xl border border-gray-200/80 p-5 md:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                                                    {qIdx + 1}
                                                </span>
                                                <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug">
                                                    {q.questionText}
                                                </h3>
                                            </div>

                                            {userSelectedId !== undefined && userSelectedId !== null ? (
                                                isQuestionCorrect ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full shrink-0 flex items-center gap-1">
                                                        <CheckCircle2 size={14} /> Correct
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full shrink-0 flex items-center gap-1">
                                                        <XCircle size={14} /> Incorrect
                                                    </span>
                                                )
                                            ) : (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full shrink-0">
                                                    Not Answered
                                                </span>
                                            )}
                                        </div>

                                        {q.description && (
                                            <p className="text-gray-500 text-sm pl-10">{q.description}</p>
                                        )}

                                        {q.mediaUrl && (
                                            <div className="pl-10 my-2">
                                                {q.mediaType === 'video' ? (
                                                    <video src={q.mediaUrl} controls className="max-w-full max-h-[220px] rounded-xl border" />
                                                ) : (
                                                    <img src={q.mediaUrl} alt="Question Media" className="max-w-full max-h-[220px] object-contain rounded-xl border" />
                                                )}
                                            </div>
                                        )}

                                        {/* Options List */}
                                        <div className="space-y-2.5 pt-1">
                                            {q.options?.map((opt, optIdx) => {
                                                const optIdStr = opt._id ? String(opt._id) : String(optIdx);
                                                const isUserChoice = String(userSelectedId) === optIdStr || String(userSelectedId) === String(optIdx);
                                                const isRightOption = Boolean(opt.isCorrect);

                                                let optionStyle = "border-gray-200 bg-white text-gray-700";
                                                let badge = null;

                                                if (isUserChoice && isRightOption) {
                                                    optionStyle = "border-green-500 bg-green-50/90 text-green-900 font-semibold ring-2 ring-green-500/20";
                                                    badge = (
                                                        <span className="ml-auto px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0">
                                                            <CheckCircle2 size={12} /> Your Choice (Correct)
                                                        </span>
                                                    );
                                                } else if (isUserChoice && !isRightOption) {
                                                    optionStyle = "border-red-400 bg-red-50/90 text-red-900 font-semibold ring-2 ring-red-400/20";
                                                    badge = (
                                                        <span className="ml-auto px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0">
                                                            <XCircle size={12} /> Your Choice (Incorrect)
                                                        </span>
                                                    );
                                                } else if (isRightOption) {
                                                    optionStyle = "border-emerald-400 bg-emerald-50/70 text-emerald-900 font-semibold";
                                                    badge = (
                                                        <span className="ml-auto px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0">
                                                            <CheckCircle2 size={12} /> Correct Option
                                                        </span>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={opt._id || optIdx}
                                                        className={`w-full px-4 py-3 rounded-xl border flex items-center gap-3 transition-all ${optionStyle}`}
                                                    >
                                                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        <span className="text-sm flex-1">{opt.text}</span>
                                                        {badge}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Explanation */}
                                        {q.explanation && (
                                            <div className="mt-3 p-3.5 bg-blue-50/80 border border-blue-200/60 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs md:text-sm">
                                                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-bold block text-blue-950 mb-0.5">Explanation:</span>
                                                    <span>{q.explanation}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Buttons */}
                        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
                            <button
                                onClick={() => setShowReview(false)}
                                className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
                            >
                                Back to Summary
                            </button>
                            <div className="flex gap-3 w-full sm:w-auto">
                                {quizData.allowRetry && (!quizData.maximumAttempts || result?.attemptNumber < quizData.maximumAttempts) && (
                                    <button
                                        onClick={() => { setShowReview(false); handleRetry(); }}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 border-2 border-[#3758EE] text-[#3758EE] font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
                                    >
                                        <RotateCcw size={16} />
                                        <span>Retry Quiz</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleContinue}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#3758EE] to-[#9333EA] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-md whitespace-nowrap"
                                >
                                    <span>{result?.isPassed ? 'Continue Course' : 'Go Back'}</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
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

                        {/* Review Quiz Answers Button */}
                        <button
                            onClick={() => setShowReview(true)}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold text-sm md:text-[15px] rounded-xl hover:bg-indigo-100 transition-all mb-6 shadow-sm"
                        >
                            <FileText size={18} />
                            <span>Review Quiz Answers & Attempt</span>
                        </button>

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
