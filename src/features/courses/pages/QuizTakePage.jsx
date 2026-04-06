import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/layouts/NavBar';
import { ChevronRight, RotateCcw, Trophy } from 'lucide-react';

const QuizTakePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);
    const totalQuestions = 7;
    const progress = (currentQuestion / totalQuestions) * 100;

    const options = [
        { id: 'A', text: '3 prayers' },
        { id: 'B', text: '4 prayers' },
        { id: 'C', text: '5 prayers' },
        { id: 'D', text: '6 prayers' },
    ];

    const [selectedOption, setSelectedOption] = useState(null);

    const handleNext = () => {
        if (currentQuestion < totalQuestions) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOption(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setIsCompleted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleRetry = () => {
        setCurrentQuestion(1);
        setIsCompleted(false);
        setSelectedOption(null);
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#F3F4F6] font-sans overflow-y-auto">
            {/* Top Navbar */}
            <div className="sticky top-0 z-50">
                <Navbar onMenuClick={() => { }} />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex items-start md:items-center justify-center p-4 md:p-6 lg:p-8">

                {!isCompleted ? (
                    // Quiz Questions View
                    <div className="w-full max-w-[800px] bg-white rounded-[16px] md:rounded-[24px] shadow-lg border border-gray-100/50 p-6 md:p-10 lg:p-12 my-4 md:my-0">
                        {/* Header: Question Progress */}
                        <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
                            <div className="flex justify-between items-center text-xs md:text-sm font-medium">
                                <span className="text-gray-400">Question {currentQuestion} of {totalQuestions}</span>
                                <span className="text-[#3758EE]">{Math.round(progress)}% Complete</span>
                            </div>
                            <div className="w-full h-2 md:h-2.5 bg-[#EEEFF1] rounded-full overflow-hidden">
                                <div className="h-full bg-[#3758EE] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        <h2 className="text-xl md:text-2xl lg:text-[28px] font-bold text-gray-800 mb-6 md:mb-10 leading-tight">
                            How many obligatory prayers are there in a day?
                        </h2>

                        <div className="flex flex-col gap-3 md:gap-4 mb-8 md:mb-12">
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedOption(option.id)}
                                    className={`flex items-center w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border text-left transition-all duration-200 ${selectedOption === option.id ? 'border-[#3758EE] bg-blue-50/30 ring-1 ring-[#3758EE]/50' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <span className={`text-sm md:text-base font-semibold ${selectedOption === option.id ? 'text-[#3758EE]' : 'text-gray-500'}`}>
                                        {option.id}. {option.text}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-50">
                            <button
                                onClick={handleNext}
                                disabled={!selectedOption}
                                className={`
                                    flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 font-bold rounded-xl transition-all group
                                    ${!selectedOption
                                        ? 'bg-[#E5E7EB] text-gray-400 cursor-not-allowed opacity-70'
                                        : 'bg-gradient-to-r from-[#3758EE] to-[#9333EA] text-white hover:opacity-90 shadow-lg'
                                    }
                                `}
                            >
                                <span>{currentQuestion === totalQuestions ? 'Finish Quiz' : 'Next Question'}</span>
                                <ChevronRight size={18} className={`${selectedOption ? 'group-hover:translate-x-1' : ''} transition-transform`} />
                            </button>
                        </div>
                    </div>
                ) : (
                    // Quiz Result View - Reponsive Optimized
                    <div className="w-full max-w-[620px] bg-white rounded-[16px] md:rounded-[24px] shadow-2xl border border-gray-100/50 p-6 sm:p-8 md:p-12 lg:p-14 text-center my-4 md:my-0 flex flex-col items-center">

                        {/* Trophy Icon */}
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FFF7ED] rounded-full flex items-center justify-center mb-4 md:mb-6 animate-bounce shadow-inner">
                            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-[#F97316]" />
                        </div>

                        {/* Title Section */}
                        <div className="mb-6 md:mb-8 px-2">
                            <h2 className="text-2xl md:text-[32px] font-bold text-gray-900 mb-2 leading-tight">Quiz Completed 🎊</h2>
                            <p className="text-[#64748B] text-sm md:text-base px-2">Great effort! Here is your result.</p>
                        </div>

                        {/* Score Board */}
                        <div className="w-full bg-[#F5F7FF] rounded-[20px] md:rounded-[24px] p-6 md:p-8 mb-6 md:mb-8 flex flex-col items-center">
                            <div className="mb-6 md:mb-10 text-center">
                                <p className="text-gray-400 text-xs md:text-sm font-medium mb-1 uppercase tracking-wider">Your Score</p>
                                <div className="flex items-baseline justify-center gap-1.5 md:gap-2">
                                    <span className="text-4xl md:text-[48px] font-bold text-[#3758EE]">0</span>
                                    <span className="text-xl md:text-[28px] font-medium text-gray-300">/ {totalQuestions}</span>
                                </div>
                            </div>

                            <div className="relative w-full flex flex-col items-center">
                                <p className="text-gray-400 text-xs md:text-sm font-medium mb-4 uppercase tracking-wider text-center">Correct Answers</p>

                                {/* Circle Progress Gauge - Responsive SVG */}
                                <div className="relative flex items-center justify-center">
                                    <svg className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90">
                                        {/* Background Circle */}
                                        <circle
                                            cx="50%" cy="50%" r="45%"
                                            stroke="#EEEFF1" strokeWidth="8" fill="transparent"
                                        />
                                        {/* Progress Circle (0% for now) */}
                                        <circle
                                            cx="50%" cy="50%" r="45%"
                                            stroke="#3758EE"
                                            strokeWidth="8"
                                            strokeDasharray="283%"
                                            strokeDashoffset="283%"
                                            fill="transparent"
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <span className="absolute text-xl md:text-[28px] font-bold text-gray-800">0%</span>
                                </div>
                            </div>
                        </div>

                        {/* Retry Prompt */}
                        <div className="w-full bg-[#F8F9FA] rounded-xl py-3 px-4 md:py-4 md:px-6 mb-8 md:mb-10 text-center border border-gray-100/50">
                            <p className="text-[#64748B] text-xs md:text-sm leading-relaxed">
                                You can retry the quiz to improve your score.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                            <button
                                onClick={handleRetry}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 border-2 border-[#3758EE] text-[#3758EE] font-bold text-sm md:text-[15px] rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap min-w-[140px]"
                            >
                                <RotateCcw size={16} />
                                <span>Retry Quiz</span>
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#3758EE] to-[#9333EA] text-white font-bold text-sm md:text-[15px] rounded-xl hover:opacity-90 transition-opacity shadow-md whitespace-nowrap"
                            >
                                <span>Finish & Continue Course</span>
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
