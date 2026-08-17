import React, { useState, useRef } from 'react';
import {
    ChevronLeft, FileText, Sparkles, Upload, PlusCircle, GripVertical,
    HelpCircle, Settings as SettingsIcon, Check, FileEdit,
    Copy, Trash2, ChevronDown, ChevronUp, Image as ImageIcon,
    MoreHorizontal, Download, Loader2, X, Film
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createQuiz, uploadQuizMedia, getQuizById, updateQuiz } from '@/api/quiz';
import { AlertCircle } from 'lucide-react';

const CreateQuiz = ({ onBackToSelection, onComplete, courseId, quizId }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(!!quizId);
    const [mediaUploading, setMediaUploading] = useState({}); // { [questionId]: boolean }
    const mediaInputRefs = useRef({});
    const csvInputRef = useRef(null);
    const [selectedCSV, setSelectedCSV] = useState(null);
    const [validationModal, setValidationModal] = useState({ isOpen: false, message: '' });
    const [method, setMethod] = useState('manual');
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        instructions: ''
    });

    const [questions, setQuestions] = useState([
        {
            id: 1,
            text: '',
            description: '',
            media: null,
            options: [
                { id: 'A', text: '', isCorrect: true },
                { id: 'B', text: '', isCorrect: false },
                { id: 'C', text: '', isCorrect: false },
                { id: 'D', text: '', isCorrect: false }
            ],
            explanation: '',
            points: 1,
            difficulty: 'Easy',
            shuffle: false,
            isExpanded: true
        }
    ]);

    const steps = quizId ? [
        { id: 1, label: 'Setup' },
        { id: 2, label: 'Questions' },
        { id: 3, label: 'Settings' }
    ] : [
        { id: 1, label: 'Setup' },
        { id: 2, label: 'Method' },
        { id: 3, label: 'Questions' },
        { id: 4, label: 'Settings' }
    ];

    const handleInputChange = (field, value) => {
        setQuizData(prev => ({ ...prev, [field]: value }));
    };

    const handleQuestionChange = (id, field, value) => {
        setQuestions(prev => prev.map(q =>
            String(q.id) === String(id) ? { ...q, [field]: value } : q
        ));
    };

    const handleMediaUpload = async (questionId, file) => {
        if (!file) return;
        setMediaUploading(prev => ({ ...prev, [questionId]: true }));
        try {
            const result = await uploadQuizMedia(file);
            handleQuestionChange(questionId, 'media', { url: result.url, mediaType: result.mediaType });
            toast.success('Media uploaded!');
        } catch (err) {
            console.error('Quiz media upload error:', err);
            toast.error('Media upload failed. Please try again.');
        } finally {
            setMediaUploading(prev => ({ ...prev, [questionId]: false }));
        }
    };

    const handleOptionChange = (qId, optId, value) => {
        setQuestions(prev => prev.map(q =>
            String(q.id) === String(qId) ? {
                ...q,
                options: q.options.map(opt =>
                    String(opt.id) === String(optId) ? { ...opt, text: value } : opt
                )
            } : q
        ));
    };

    const handleCorrectOption = (qId, optId) => {
        setQuestions(prev => prev.map(q =>
            String(q.id) === String(qId) ? {
                ...q,
                options: q.options.map(opt =>
                    ({ ...opt, isCorrect: String(opt.id) === String(optId) })
                )
            } : q
        ));
    };

    const handleAddOption = (qId) => {
        setQuestions(prev => prev.map(q => {
            if (String(q.id) === String(qId)) {
                if (q.options.length >= 4) {
                    toast.error("Maximum 4 options allowed per question.");
                    return q;
                }
                const newOptionId = `opt_${Date.now()}`;
                return {
                    ...q,
                    options: [...q.options, { id: newOptionId, text: '', isCorrect: false }]
                };
            }
            return q;
        }));
    };

    const addQuestion = () => {
        const newId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setQuestions([...questions, {
            id: newId,
            text: '',
            description: '',
            media: null,
            options: [
                { id: 'A', text: '', isCorrect: true },
                { id: 'B', text: '', isCorrect: false },
                { id: 'C', text: '', isCorrect: false },
                { id: 'D', text: '', isCorrect: false }
            ],
            explanation: '',
            points: 1,
            difficulty: 'Easy',
            shuffle: false,
            isExpanded: true
        }]);
    };

    const duplicateQuestion = (q) => {
        const newId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setQuestions([...questions, { ...q, id: newId, isExpanded: true }]);
    };

    const deleteQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const [quizSettings, setQuizSettings] = useState({
        passingScore: 70,
        totalMarks: 3,
        requirePassingScore: true,
        lockNextLecture: true,
        allowRetry: true,
        maxAttempts: 3,
        timeLimit: 30,
        shuffleQuestions: false,
        shuffleAnswerOptions: false
    });

    const handleSettingsChange = (field, value) => {
        setQuizSettings(prev => ({ ...prev, [field]: value }));
    };

    React.useEffect(() => {
        if (quizId) {
            const fetchQuiz = async () => {
                try {
                    const res = await getQuizById(quizId);
                    const quiz = res.data;

                    setQuizData({
                        title: quiz.title || '',
                        description: quiz.shortDescription || '',
                        instructions: quiz.instructions || ''
                    });

                    setQuizSettings({
                        passingScore: quiz.passingScorePercentage || 70,
                        totalMarks: quiz.totalMarks || 3,
                        requirePassingScore: quiz.requirePassingScoreToContinue !== undefined ? quiz.requirePassingScoreToContinue : true,
                        lockNextLecture: quiz.lockNextLectureUntilCompleted !== undefined ? quiz.lockNextLectureUntilCompleted : true,
                        allowRetry: quiz.allowRetry !== undefined ? quiz.allowRetry : true,
                        maxAttempts: quiz.maximumAttempts || 3,
                        timeLimit: quiz.timeLimitInMinutes || 30,
                        shuffleQuestions: quiz.shuffleQuestions !== undefined ? quiz.shuffleQuestions : false,
                        shuffleAnswerOptions: quiz.shuffleAllAnswerOptions !== undefined ? quiz.shuffleAllAnswerOptions : false
                    });

                    if (quiz.questions && quiz.questions.length > 0) {
                        setQuestions(quiz.questions.map((q, idx) => ({
                            id: q._id ? String(q._id) : `q_db_${idx}`,
                            text: q.questionText || '',
                            description: q.description || '',
                            media: q.mediaUrl ? { url: q.mediaUrl, mediaType: q.mediaUrl.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image' } : null,
                            options: q.options.map((opt, i) => ({
                                id: opt._id ? String(opt._id) : String(i),
                                text: opt.text || '',
                                isCorrect: opt.isCorrect || false
                            })),
                            explanation: q.explanation || '',
                            points: q.points || 1,
                            difficulty: q.difficulty || 'Easy',
                            shuffle: q.shuffleOptions || false,
                            isExpanded: false
                        })));
                    } else {
                        // Keep default empty question if none exist
                    }

                    setMethod(quiz.creationMethod || 'manual');
                } catch (err) {
                    console.error('Failed to fetch initial quiz data:', err);
                    toast.error('Failed to load quiz data.');
                } finally {
                    setIsLoadingInitialData(false);
                }
            };
            fetchQuiz();
        }
    }, [quizId]);

    const handleContinue = async () => {
        const totalSteps = quizId ? 3 : 4;
        if (currentStep < totalSteps) {
            // Validation for Step 1
            if (currentStep === 1) {
                if (!quizData.title.trim()) {
                    setValidationModal({
                        isOpen: true,
                        message: 'Please fill in the quiz name.'
                    });
                    return;
                }
            }
            setCurrentStep(prev => prev + 1);
            return;
        }

        // Step Final: Submit quiz to backend
        console.log('[CreateQuiz] Submitting quiz. courseId prop received:', courseId);

        if (!courseId) {
            console.error('[CreateQuiz] courseId is null or undefined!');
            toast.error('Course not saved yet. Please go back to Step 1 and try again.');
            return;
        }
        if (!quizData.title.trim()) {
            toast.error('Quiz title is required.');
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading('Creating quiz...');
        try {
            // Validate and Map local question shape → backend schema
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.text || !q.text.trim()) {
                    toast.error(`Question ${i + 1} is missing its text.`);
                    setIsSaving(false);
                    toast.dismiss(toastId);
                    return;
                }
                
                const validOptions = q.options.filter(opt => opt.text && opt.text.trim());
                if (validOptions.length < 2) {
                    toast.error(`Question ${i + 1} must have at least 2 valid options.`);
                    setIsSaving(false);
                    toast.dismiss(toastId);
                    return;
                }
                
                const hasCorrect = validOptions.some(opt => opt.isCorrect);
                if (!hasCorrect) {
                    toast.error(`Question ${i + 1} must have a correct option selected.`);
                    setIsSaving(false);
                    toast.dismiss(toastId);
                    return;
                }
            }

            const mappedQuestions = questions.map(q => {
                const validOptions = q.options.filter(opt => opt.text && opt.text.trim());
                return {
                    questionText: q.text,
                    description: q.description || '',
                    explanation: q.explanation || '',
                    points: q.points || 1,
                    difficulty: q.difficulty || 'Easy',
                    shuffleOptions: q.shuffle || false,
                    mediaUrl: q.media?.url || '',          // Cloudinary URL
                    options: validOptions.map(opt => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                    })),
                };
            });

            const payload = {
                courseId,
                title: quizData.title,
                shortDescription: quizData.description || '',
                instructions: quizData.instructions || '',
                creationMethod: method === 'bulk' ? 'csv' : 'manual',
                questions: mappedQuestions,
                passingScorePercentage: quizSettings.passingScore,
                requirePassingScoreToContinue: quizSettings.requirePassingScore,
                lockNextLectureUntilCompleted: quizSettings.lockNextLecture,
                allowRetry: quizSettings.allowRetry,
                maximumAttempts: quizSettings.maxAttempts,
                timeLimitInMinutes: quizSettings.timeLimit,
                shuffleQuestions: quizSettings.shuffleQuestions,
                shuffleAllAnswerOptions: quizSettings.shuffleAnswerOptions,
            };

            console.log('[CreateQuiz] Sending payload:', payload);

            let res;
            if (quizId) {
                res = await updateQuiz(quizId, payload);
                toast.success('Quiz updated successfully!', { id: toastId });
            } else {
                res = await createQuiz(payload);
                toast.success('Quiz created successfully!', { id: toastId });
            }

            const savedQuiz = res?.data;

            onComplete({ _id: savedQuiz?._id || quizId, title: savedQuiz?.title || quizData.title });
        } catch (err) {
            console.error('Quiz save error:', err);
            toast.error(err?.response?.data?.message || 'Failed to save quiz.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };


    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            onBackToSelection();
        }
    };

    const parseCSV = (text) => {
        const lines = text.split('\n');
        if (lines.length === 0) return [];

        // Basic header cleanup
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            // Regex to handle commas inside quotes
            const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const row = {};
            headers.forEach((header, index) => {
                let val = values[index]?.trim() || '';
                // Remove surrounding quotes
                val = val.replace(/^"|"$/g, '');
                row[header] = val;
            });
            result.push(row);
        }
        return result;
    };

    const handleCSVFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast.error('Please upload a valid CSV file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            try {
                const parsedData = parseCSV(text);
                const mappedQuestions = parsedData.map((row, index) => {
                    // Normalize correct answer index
                    const correctKey = (row.correct_answer || '').toLowerCase().trim();

                    return {
                        id: Date.now() + index,
                        text: row.question_text || '',
                        description: row.explanation || '',
                        options: [
                            { id: 'A', text: row.option_1 || '', isCorrect: correctKey === 'option_1' || correctKey === 'a' },
                            { id: 'B', text: row.option_2 || '', isCorrect: correctKey === 'option_2' || correctKey === 'b' },
                            { id: 'C', text: row.option_3 || '', isCorrect: correctKey === 'option_3' || correctKey === 'c' },
                            { id: 'D', text: row.option_4 || '', isCorrect: correctKey === 'option_4' || correctKey === 'd' }
                        ],
                        explanation: row.explanation || '',
                        points: parseInt(row.points) || 1,
                        difficulty: row.difficulty || 'Easy',
                        shuffle: false,
                        isExpanded: false
                    };
                });

                if (mappedQuestions.length === 0) {
                    toast.error('The CSV file appears to be empty or invalid.');
                    return;
                }

                setQuestions(mappedQuestions);
                setSelectedCSV(file);
                setMethod('manual'); // Transition to manual view to show parsed questions
                toast.success(`Successfully loaded ${mappedQuestions.length} questions! Review them below.`);
            } catch (err) {
                console.error('CSV Parse Error:', err);
                toast.error('Failed to parse CSV file. Please check the format.');
            }
        };
        reader.onerror = () => toast.error('Error reading file.');
        reader.readAsText(file);
    };

    if (isLoadingInitialData) {
        return (
            <div className="flex-1 flex flex-col w-full h-[80vh] items-center justify-center font-sans bg-[#f8fafc] lg:rounded-[32px] border-t lg:border border-gray-100 shadow-sm relative">
                <Loader2 size={40} className="animate-spin text-[#3758EE] mb-4" />
                <p className="text-[#64748b] font-medium">Loading Quiz Data...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col w-full h-[80vh] max-h-[850px] min-h-[500px] overflow-hidden font-sans bg-[#f8fafc] lg:rounded-2xl border-t lg:border border-gray-100 shadow-sm relative">
            {/* SVG Gradient Definition */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#B666E7" />
                        <stop offset="100%" stopColor="#3758EE" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Header Area */}
            <div className="mb-6 md:mb-8 px-6 md:px-10 pt-6 md:pt-8 text-left flex flex-col items-start">
                <button
                    onClick={onBackToSelection}
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#0f172a] transition-all text-[13px] md:text-[14px] font-medium mb-3 md:mb-4 group cursor-pointer"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Selection
                </button>
                <h1 className="text-[22px] md:text-[28px] font-bold text-[#0f172a] mb-1 md:mb-2 tracking-tight">{quizId ? 'Edit Quiz' : 'Create New Quiz'}</h1>
                <p className="text-[#64748b] text-[13px] md:text-[15px] font-medium leading-relaxed">Set up your quiz and choose how you want to add questions.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-8 md:mb-12 max-w-[900px] mx-auto w-full px-2 sm:px-4 md:px-0">
                {steps.map((s, idx) => (
                    <React.Fragment key={s.id}>
                        {/* Step Circle and Label */}
                        <div className="flex flex-col items-center gap-2 md:gap-3 relative">
                            <div className="flex flex-col items-center relative z-10">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-sm
                                    ${currentStep >= s.id
                                        ? 'bg-[#8b5cf6] border-transparent text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                                        : 'bg-white border-gray-100 text-gray-400'}`}
                                >
                                    {currentStep > s.id ? <Check size={18} /> : <span className="text-[13px] sm:text-[15px] font-bold">{s.id}</span>}
                                </div>
                                <span className={`absolute -bottom-7 sm:-bottom-8 text-[10px] sm:text-[13px] font-bold whitespace-nowrap transition-all duration-500
                                    ${currentStep >= s.id ? 'text-[#0f172a]' : 'text-gray-400'} 
                                    left-1/2 -translate-x-1/2`}
                                >
                                    {s.label}
                                </span>
                            </div>
                        </div>

                        {/* Connecting Line (except for the last step) */}
                        {idx < steps.length - 1 && (
                            <div className="w-6 sm:w-12 md:w-24 h-[2px] bg-gray-100 mb-5 sm:mb-6 relative rounded-full overflow-hidden">
                                <div
                                    className={`absolute left-0 top-0 h-full bg-[#8b5cf6] transition-all duration-700
                                        ${currentStep > s.id ? 'w-full' : 'w-0'}`}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Scrollable Content Wrapper */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 mb-4">
                {/* Form Content - Step 1: Setup */}
                {currentStep === 1 && (
                    <div className="flex-1 max-w-[1000px] mx-auto w-full px-4 md:px-0">
                        <div className="bg-white rounded-[20px] md:rounded-[24px] p-5 sm:p-6 md:p-10 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                            <h3 className="text-[16px] md:text-[18px] font-bold text-[#0f172a] mb-6 md:mb-8 text-center sm:text-left">Quiz Basic Details</h3>

                            <div className="space-y-6 md:space-y-8">
                                {/* Quiz Title */}
                                <div>
                                    <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Quiz Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter quiz title"
                                        value={quizData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[14px] shadow-sm"
                                    />
                                </div>

                                {/* Short Description */}
                                <div>
                                    <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Quiz Short Description</label>
                                    <textarea
                                        placeholder="Brief description of the quiz"
                                        rows={4}
                                        value={quizData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[14px] shadow-sm resize-none"
                                    />
                                </div>

                                {/* Quiz Instructions */}
                                <div>
                                    <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Quiz Instructions</label>
                                    <textarea
                                        placeholder="Instructions for students taking this quiz"
                                        rows={4}
                                        value={quizData.instructions}
                                        onChange={(e) => handleInputChange('instructions', e.target.value)}
                                        className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[14px] shadow-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Content - Step 2: Method */}
                {!quizId && currentStep === 2 && (
                    <div className="flex-1 max-w-[900px] mx-auto w-full px-4 md:px-0 bg-white rounded-[20px] md:rounded-[32px] p-6 md:p-12 border border-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] mb-8 md:mb-12">
                        <div className="text-center mb-8 md:mb-10">
                            <h3 className="text-[20px] md:text-[24px] font-bold text-[#0f172a] mb-2 leading-tight">Quiz Creation Method</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:px-8 lg:px-12">
                            {[
                                {
                                    id: 'manual',
                                    title: 'Manual Creation',
                                    line1: 'Add questions one by one',
                                    line2: 'Best for custom quizzes',
                                    icon: <FileEdit size={30} />,
                                },
                                {
                                    id: 'bulk',
                                    title: 'CSV Upload',
                                    line1: 'Bulk upload questions using CSV file',
                                    line2: 'Best for large assessments',
                                    icon: <Upload size={30} />,
                                }
                            ].map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={() => setMethod(opt.id)}
                                    className={`
                                    group p-6 sm:p-10 rounded-[20px] md:rounded-[24px] border-2 cursor-pointer transition-all duration-300 flex flex-col items-center md:items-start text-center md:text-left relative
                                    ${method === opt.id ? 'border-[#4f46e5]/40 bg-[#f5f3ff] shadow-xl shadow-[#4f46e5]/10' : 'border-gray-100 bg-white hover:border-gray-200'}
                                `}
                                >
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[12px] md:rounded-[16px] flex items-center justify-center mb-4 md:mb-6 transition-all duration-300 shadow-xl
                                    ${method === opt.id ? 'bg-[#8b5cf6] text-white shadow-[#8b5cf6]/30 scale-110' : 'bg-gray-50 text-[#64748b] group-hover:bg-gray-100'}
                                `}>
                                        {opt.icon}
                                    </div>
                                    <h4 className={`text-[16px] md:text-[18px] font-bold mb-2 md:mb-3 transition-colors ${method === opt.id ? 'text-[#0f172a]' : 'text-[#0f172a]'}`}>
                                        {opt.title}
                                    </h4>
                                    <div className="space-y-1 md:space-y-1.5">
                                        <p className="text-[12px] md:text-[13px] text-[#64748b] font-medium leading-relaxed">{opt.line1}</p>
                                        <p className="text-[11px] md:text-[12px] text-gray-400 font-medium">{opt.line2}</p>
                                    </div>
                                    {method === opt.id && (
                                        <div className="absolute top-4 right-4 md:top-6 md:right-6 w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#3758EE] text-white flex items-center justify-center animate-in zoom-in shadow-md">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* If method is bulk, show CSV Upload area */}
                {!quizId && currentStep === 3 && method === 'bulk' && (
                    <div className="flex-1 max-w-[800px] mx-auto w-full px-4 md:px-0">
                        <div className="bg-white rounded-[12px] md:rounded-[16px] p-5 sm:p-6 md:p-8 border border-gray-200 shadow-sm">
                            <h3 className="text-[16px] md:text-[17px] font-bold text-[#0f172a] mb-5 md:mb-6">Upload CSV File</h3>

                            <div
                                onClick={() => csvInputRef.current?.click()}
                                className="border-[1.5px] border-dashed border-gray-300 rounded-[12px] md:rounded-[16px] py-10 md:py-16 px-4 flex flex-col items-center justify-center bg-white group hover:border-[#8b5cf6]/50 transition-all cursor-pointer"
                            >
                                <input
                                    ref={csvInputRef}
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleCSVFileUpload}
                                />
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#f3e8ff] rounded-full flex items-center justify-center mb-3 md:mb-5">
                                    <Upload size={20} className="md:w-[24px] md:h-[24px] text-[#8b5cf6]" strokeWidth={2} />
                                </div>
                                <h4 className="text-[14px] md:text-[15px] font-bold text-[#0f172a] mb-1.5 md:mb-2 text-center">
                                    {selectedCSV ? `Selected: ${selectedCSV.name}` : 'Upload CSV File'}
                                </h4>
                                <p className="text-[12px] md:text-[13px] text-[#64748b] font-medium mb-5 md:mb-6 text-center max-w-[200px] sm:max-w-none">
                                    {selectedCSV ? 'Click to change file' : 'Drag and drop your file here, or click to browse'}
                                </p>

                                <button
                                    className="px-6 py-2 md:py-2.5 bg-white border border-gray-200 rounded-[8px] text-[12px] md:text-[13px] text-[#0f172a] font-semibold hover:bg-gray-50 transition-all shadow-sm w-full sm:w-auto max-w-[250px]"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        csvInputRef.current?.click();
                                    }}
                                >
                                    Browse Files
                                </button>

                            </div>
                            <div className="mt-5 md:mt-6 p-4 md:p-5 bg-blue-50 rounded-[8px] md:rounded-[10px] border border-blue-100 flex items-start gap-3 md:gap-4">
                                <AlertCircle className="text-blue-500 w-[18px] h-[18px] md:w-[20px] md:h-[20px] flex-shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="text-[13px] md:text-[14px] font-semibold text-blue-900 mb-1">CSV Format Requirements:</h5>
                                    <ul className="text-[12px] md:text-[13px] text-blue-800 space-y-1 list-disc list-inside">
                                        <li>Required columns: question_text, option_1, option_2, option_3, option_4, correct_answer</li>
                                        <li>Optional columns: explanation, points, difficulty</li>
                                        <li>correct_answer should be 'option_1', 'option_2', etc., or 'a', 'b', etc.</li>
                                    </ul>
                                    <a
                                        href="/template.csv"
                                        download
                                        className="text-[12px] md:text-[13px] text-[#8b5cf6] font-semibold mt-2 md:mt-3 inline-block hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const csvContent = "data:text/csv;charset=utf-8,question_text,option_1,option_2,option_3,option_4,correct_answer,explanation,points,difficulty\\nWhat is HTML?,Hypertext Markup Language,Hypertext Main Language,Hypertool Machine Language,None,option_1,HTML is standard markup language,1,Easy";
                                            const encodedUri = encodeURI(csvContent);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", encodedUri);
                                            link.setAttribute("download", "quiz_template.csv");
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                    >
                                        Download Template
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Content - Questions List & Sidebar */}
                {currentStep === (quizId ? 2 : 3) && (!quizId ? method === 'manual' : true) && (
                    <div className="max-w-[1240px] mx-auto w-full flex flex-col lg:flex-row gap-6 md:gap-8 flex-1 min-h-0 overflow-hidden">
                        {/* Left Column: Questions List */}
                        <div className="flex-1 space-y-4 sm:space-y-6 pb-6 sm:pb-10 order-2 lg:order-1 min-w-0 overflow-y-auto custom-scrollbar pr-1 lg:pr-3">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="bg-white rounded-[16px] sm:rounded-[24px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300">
                                    {/* Question Header */}
                                    <div
                                        className="px-3 sm:px-6 py-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50/50"
                                        onClick={() => handleQuestionChange(q.id, 'isExpanded', !q.isExpanded)}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <GripVertical size={18} className="text-gray-300 cursor-grab active:cursor-grabbing" />
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#B666E7] to-[#3758EE] flex items-center justify-center text-white text-[11px] sm:text-[13px] font-bold shadow-lg shadow-purple-500/20">
                                                    Q{idx + 1}
                                                </div>
                                            </div>
                                            {q.isExpanded ? (
                                                <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                                            ) : (
                                                <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                                            )}
                                            <span className="text-[14px] font-bold text-[#0f172a] truncate hidden sm:block">
                                                {q.text || 'Add your question title'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); duplicateQuestion(q); }}
                                                className="p-1.5 sm:p-2 text-gray-400 hover:text-[#3758EE] hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                                                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {q.isExpanded && (
                                        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                            {/* Question Text */}
                                            <div>
                                                <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a] mb-2 sm:mb-2.5">Question Text *</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter your question"
                                                    value={q.text || ''}
                                                    onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                                                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[13px] sm:text-[14px] shadow-sm font-medium"
                                                />
                                            </div>

                                            {/* Question Description */}
                                            <div>
                                                <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a] mb-2 sm:mb-2.5">Question Description (Optional)</label>
                                                <textarea
                                                    placeholder="Additional context or hints"
                                                    rows={2}
                                                    value={q.description || ''}
                                                    onChange={(e) => handleQuestionChange(q.id, 'description', e.target.value)}
                                                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[13px] sm:text-[14px] shadow-sm resize-none font-medium"
                                                />
                                            </div>

                                            {/* Media Upload */}
                                            <div>
                                                <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a] mb-2 sm:mb-2.5">Attach Media (Optional)</label>

                                                {/* Hidden file input */}
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                                                    className="hidden"
                                                    ref={el => mediaInputRefs.current[q.id] = el}
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleMediaUpload(q.id, file);
                                                        e.target.value = '';
                                                    }}
                                                />

                                                {/* Upload Zone */}
                                                {!q.media && !mediaUploading[q.id] && (
                                                    <div
                                                        onClick={() => mediaInputRefs.current[q.id]?.click()}
                                                        className="border-2 border-dashed border-gray-100 rounded-[16px] sm:rounded-[20px] p-5 sm:p-8 flex flex-col items-center justify-center bg-gray-50/30 group hover:border-[#3758EE]/30 hover:bg-blue-50/20 transition-all cursor-pointer"
                                                    >
                                                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 mb-2 sm:mb-3 group-hover:text-[#3758EE] group-hover:scale-110 transition-all">
                                                            <ImageIcon size={18} />
                                                        </div>
                                                        <span className="text-[12px] sm:text-[14px] font-bold text-[#64748b] group-hover:text-[#3758EE] transition-all text-center">Click to upload image or video</span>
                                                        <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 mt-1">JPG, PNG, WEBP, MP4, MOV</span>
                                                    </div>
                                                )}

                                                {/* Uploading Spinner */}
                                                {mediaUploading[q.id] && (
                                                    <div className="border-2 border-dashed border-[#3758EE]/30 rounded-[16px] sm:rounded-[20px] p-5 sm:p-8 flex flex-col items-center justify-center bg-blue-50/20">
                                                        <Loader2 size={28} className="animate-spin text-[#3758EE] mb-2" />
                                                        <span className="text-[13px] font-bold text-[#3758EE]">Uploading to Cloudinary…</span>
                                                    </div>
                                                )}

                                                {/* Preview — Image */}
                                                {q.media && q.media.mediaType === 'image' && !mediaUploading[q.id] && (
                                                    <div className="relative rounded-[16px] overflow-hidden border border-gray-100 shadow-sm group">
                                                        <img
                                                            src={q.media.url}
                                                            alt="Question media"
                                                            className="w-full max-h-[220px] object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                                        <button
                                                            onClick={() => handleQuestionChange(q.id, 'media', null)}
                                                            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => mediaInputRefs.current[q.id]?.click()}
                                                            className="absolute bottom-2 right-2 px-3 py-1 bg-white/90 rounded-lg text-[11px] font-bold text-[#3758EE] shadow hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            Change
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Preview — Video */}
                                                {q.media && q.media.mediaType === 'video' && !mediaUploading[q.id] && (
                                                    <div className="relative rounded-[16px] overflow-hidden border border-gray-100 shadow-sm group">
                                                        <video
                                                            src={q.media.url}
                                                            controls
                                                            className="w-full max-h-[220px] object-cover bg-black"
                                                        />
                                                        <div className="absolute top-2 right-2 flex gap-2">
                                                            <button
                                                                onClick={() => mediaInputRefs.current[q.id]?.click()}
                                                                className="px-3 py-1 bg-white/90 rounded-lg text-[11px] font-bold text-[#3758EE] shadow hover:bg-white transition-all"
                                                            >
                                                                Change
                                                            </button>
                                                            <button
                                                                onClick={() => handleQuestionChange(q.id, 'media', null)}
                                                                className="w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Answer Options */}
                                            <div className="space-y-3 sm:space-y-4">
                                                <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a] mb-1">Answer Options *</label>
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={opt.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 group w-full">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                onClick={() => handleCorrectOption(q.id, opt.id)}
                                                                className={`min-w-[24px] w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0
                                                                ${opt.isCorrect
                                                                        ? 'border-[#3758EE] bg-[#3758EE]'
                                                                        : 'border-gray-200 bg-white group-hover:border-gray-300'}`}
                                                            >
                                                                {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                                            </div>
                                                            <span className="sm:hidden text-[13px] font-bold text-[#64748b]">Option {String.fromCharCode(65 + optIndex)}</span>
                                                        </div>
                                                        <div className="flex-1 relative flex items-center gap-2">
                                                            <div className="flex-1 relative">
                                                                <span className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 text-[13px] sm:text-[14px] font-bold text-[#64748b]">Option {String.fromCharCode(65 + optIndex)}</span>
                                                                <input
                                                                    type="text"
                                                                    placeholder={`Enter option ${String.fromCharCode(97 + optIndex)}`}
                                                                    value={opt.text || ''}
                                                                    onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)}
                                                                    className="w-full px-4 sm:px-5 sm:pl-[90px] py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[13px] sm:text-[14px] font-medium shadow-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                {q.options.length < 4 && (
                                                    <div className="pt-2">
                                                        <button
                                                            onClick={() => handleAddOption(q.id)}
                                                            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-[#64748b] font-bold hover:bg-white hover:border-[#3758EE]/30 hover:text-[#3758EE] transition-all group active:scale-95 text-[14px]"
                                                        >
                                                            <PlusCircle size={18} className="group-hover:scale-110 transition-all" /> Add Option
                                                        </button>
                                                    </div>
                                                )}
                                                <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 mt-2 ml-1">Select the circle to mark the correct answer</p>
                                            </div>

                                            {/* Explanation / Feedback */}
                                            <div>
                                                <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a] mb-2 sm:mb-2.5">Explanation / Feedback (Optional)</label>
                                                <textarea
                                                    placeholder="Explain why this is the correct answer"
                                                    rows={3}
                                                    value={q.explanation || ''}
                                                    onChange={(e) => handleQuestionChange(q.id, 'explanation', e.target.value)}
                                                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[13px] sm:text-[14px] shadow-sm resize-none font-medium"
                                                />
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                                {/* Points */}
                                                <div className="flex-1">
                                                    <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a] mb-2 sm:mb-2.5">Points</label>
                                                    <input
                                                        type="number"
                                                        value={q.points}
                                                        onChange={(e) => handleQuestionChange(q.id, 'points', parseInt(e.target.value))}
                                                        className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[13px] sm:text-[14px] font-bold shadow-sm"
                                                    />
                                                </div>

                                                {/* Difficulty */}
                                                <div className="flex-1">
                                                    <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a] mb-2 sm:mb-2.5">Difficulty</label>
                                                    <div className="relative">
                                                        <select
                                                            value={q.difficulty}
                                                            onChange={(e) => handleQuestionChange(q.id, 'difficulty', e.target.value)}
                                                            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[13px] sm:text-[14px] font-bold shadow-sm appearance-none cursor-pointer"
                                                        >
                                                            <option value="Easy">Easy</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="Hard">Hard</option>
                                                        </select>
                                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col space-y-6 sm:space-y-8">
                                                {/* Shuffle Toggle */}
                                                <div className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-[#f8fafc] border border-gray-100 rounded-2xl">
                                                    <div className="pr-2">
                                                        <p className="text-[13px] sm:text-[14px] font-bold text-[#0f172a]">Shuffle Answer Options</p>
                                                        <p className="text-[10px] sm:text-[12px] font-medium text-gray-400 leading-tight">Randomize order for each student</p>
                                                    </div>
                                                    <div
                                                        onClick={() => handleQuestionChange(q.id, 'shuffle', !q.shuffle)}
                                                        className={`min-w-[44px] sm:min-w-[48px] h-5 sm:h-6 rounded-full relative cursor-pointer transition-all duration-300 
                                                        ${q.shuffle ? 'bg-[#3758EE]' : 'bg-gray-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300
                                                        ${q.shuffle ? 'left-6 sm:left-7' : 'left-1'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <button
                                onClick={addQuestion}
                                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-[#64748b] font-bold hover:bg-white hover:border-[#3758EE]/30 hover:text-[#3758EE] transition-all group active:scale-95 text-[14px]"
                            >
                                <PlusCircle size={18} className="group-hover:scale-110 transition-all" />
                                Add Another Question
                            </button>
                        </div>

                        {/* Right Column: Sidebar Preview */}
                        <div className="w-full lg:w-[350px] order-1 lg:order-2 flex-shrink-0 h-full overflow-y-auto custom-scrollbar pr-1 bg-white rounded-[20px] sm:rounded-[24px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] self-start sticky top-0">
                            <div className="p-5 sm:p-6">
                                <h3 className="text-[16px] sm:text-[18px] font-bold text-[#0f172a] mb-4 sm:mb-6">Quiz Preview</h3>

                                {/* Stats Summary */}
                                <div className="p-4 sm:p-5 bg-[#f8fafc] rounded-xl sm:rounded-2xl border border-gray-50 mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                                    <h4 className="text-[15px] sm:text-[16px] font-bold text-[#0f172a] truncate">{quizData.title || 'Untitled Quiz'}</h4>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center justify-between text-[12px] sm:text-[13px] font-medium">
                                            <span className="text-[#64748b]">Total Questions:</span>
                                            <span className="text-[#0f172a] font-bold">{questions.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[12px] sm:text-[13px] font-medium">
                                            <span className="text-[#64748b]">Total Points:</span>
                                            <span className="text-[#0f172a] font-bold">{questions.reduce((acc, q) => acc + (q.points || 0), 0)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] sm:text-[12px] font-medium text-gray-400 pt-1">
                                            <HelpCircle size={14} />
                                            <span>Est. {questions.length * 2} minutes</span>
                                        </div>
                                    </div>
                                </div>

                                {/* All Questions List */}
                                <div className="space-y-3 sm:space-y-4 hidden sm:block">
                                    <h4 className="text-[12px] sm:text-[13px] font-bold text-gray-400 uppercase tracking-wider">All Questions</h4>
                                    <div className="space-y-2">
                                        {questions.map((q, idx) => (
                                            <div key={q.id} className={`p-3 sm:p-4 border rounded-xl flex items-center gap-3 transition-all
                                            ${idx === 0 || idx === 1 ? 'bg-purple-50 border-purple-100' : 'bg-blue-50/50 border-blue-100/50'}`}>
                                                <span className={`text-[11px] sm:text-[12px] font-bold ${idx === 0 || idx === 1 ? 'text-[#3758EE]' : 'text-[#3758EE]'}`}>Q{idx + 1}.</span>
                                                <span className={`text-[12px] sm:text-[13px] font-bold ${idx === 0 || idx === 1 ? 'text-[#3758EE]' : 'text-[#3758EE]'} truncate flex-1`}>{q.text || 'Name question'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Individual Question Preview(s) */}
                                {questions.length > 0 && (
                                    <div className="mt-6 sm:mt-8 space-y-6">
                                        {questions.map((q, qIdx) => (
                                            <div key={q.id} className="pt-6 sm:pt-8 border-t border-gray-50">
                                                <h4 className="text-[10px] sm:text-[11px] font-medium text-gray-400 mb-3 uppercase tracking-wider">Question {qIdx + 1} Preview</h4>
                                                <p className="text-[13px] sm:text-[14px] font-bold text-[#0f172a] mb-3 sm:mb-4">Question {qIdx + 1}</p>
                                                <div className="space-y-2">
                                                    {q.options.map((opt, optIndex) => (
                                                        <div key={opt.id} className={`p-3 sm:p-3.5 rounded-xl border transition-all text-[12px] sm:text-[13px] font-bold
                                                        ${opt.isCorrect
                                                                ? 'bg-green-50 border-green-100 text-green-600'
                                                                : 'bg-[#f8fafc] border-gray-100 text-[#64748b]'}`}>
                                                            {String.fromCharCode(65 + optIndex)}. {opt.text || `Option ${String.fromCharCode(65 + optIndex)}`}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Content - Settings */}
                {currentStep === (quizId ? 3 : 4) && (
                    <div className="flex-1 max-w-[800px] mx-auto w-full space-y-6 sm:space-y-8 px-4 md:px-0 pb-10">
                        {/* Quiz Behavior Card */}
                        <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-10 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-[18px] sm:text-[20px] font-bold text-[#0f172a]">Quiz Behavior</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                <div className="space-y-2.5">
                                    <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a]">Passing Score (%)</label>
                                    <input
                                        type="number"
                                        value={quizSettings.passingScore}
                                        onChange={(e) => handleSettingsChange('passingScore', parseInt(e.target.value))}
                                        className="w-full px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[14px] sm:text-[15px] font-bold shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a]">Total Marks</label>
                                    <input
                                        type="number"
                                        value={quizSettings.totalMarks}
                                        onChange={(e) => handleSettingsChange('totalMarks', parseInt(e.target.value))}
                                        className="w-full px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[14px] sm:text-[15px] font-bold shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 pt-2">
                                {/* Require Passing Score Toggle */}
                                <div className="flex items-center justify-between gap-4 group cursor-pointer" onClick={() => handleSettingsChange('requirePassingScore', !quizSettings.requirePassingScore)}>
                                    <div className="flex-1">
                                        <p className="text-[14px] sm:text-[15px] font-bold text-[#0f172a]">Require Passing Score to Continue</p>
                                        <p className="text-[12px] sm:text-[13px] font-medium text-gray-400">Students must pass to unlock next lecture</p>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${quizSettings.requirePassingScore ? 'bg-[#3758EE]' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${quizSettings.requirePassingScore ? 'left-7' : 'left-1'}`} />
                                    </div>
                                </div>

                                {/* Lock Next Lecture Toggle */}
                                <div className="flex items-center justify-between gap-4 group cursor-pointer" onClick={() => handleSettingsChange('lockNextLecture', !quizSettings.lockNextLecture)}>
                                    <div className="flex-1">
                                        <p className="text-[14px] sm:text-[15px] font-bold text-[#0f172a]">Lock Next Lecture Until Quiz Completed</p>
                                        <p className="text-[12px] sm:text-[13px] font-medium text-gray-400">Students must complete quiz to proceed</p>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${quizSettings.lockNextLecture ? 'bg-[#3758EE]' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${quizSettings.lockNextLecture ? 'left-7' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attempt Settings Card */}
                        <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-10 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 animate-in fade-in slide-in-from-bottom-4 transition-delay-150">
                            <h3 className="text-[18px] sm:text-[20px] font-bold text-[#0f172a]">Attempt Settings</h3>

                            <div className="space-y-8">
                                {/* Allow Retry Toggle */}
                                <div className="flex items-center justify-between gap-4 group cursor-pointer" onClick={() => handleSettingsChange('allowRetry', !quizSettings.allowRetry)}>
                                    <div className="flex-1">
                                        <p className="text-[14px] sm:text-[15px] font-bold text-[#0f172a]">Allow Retry</p>
                                        <p className="text-[12px] sm:text-[13px] font-medium text-gray-400">Let students retake the quiz if they fail</p>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${quizSettings.allowRetry ? 'bg-[#3758EE]' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${quizSettings.allowRetry ? 'left-7' : 'left-1'}`} />
                                    </div>
                                </div>

                                <div className="space-y-2.5 pt-2">
                                    <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a]">Maximum Attempts</label>
                                    <input
                                        type="number"
                                        value={quizSettings.maxAttempts}
                                        onChange={(e) => handleSettingsChange('maxAttempts', parseInt(e.target.value))}
                                        className="w-full px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[14px] sm:text-[15px] font-bold shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="block text-[13px] sm:text-[14px] font-bold text-[#0f172a]">Time Limit (minutes)</label>
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            value={quizSettings.timeLimit}
                                            onChange={(e) => handleSettingsChange('timeLimit', parseInt(e.target.value))}
                                            className="w-full px-5 py-3 sm:py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl outline-none focus:border-[#3758EE] focus:bg-white transition-all text-[14px] sm:text-[15px] font-bold shadow-sm"
                                        />
                                        <p className="text-[11px] sm:text-[12px] font-medium text-gray-400">Set to 0 for no time limit</p>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-2">
                                    {/* Shuffle Questions Toggle */}
                                    <div className="flex items-center justify-between gap-4 group cursor-pointer" onClick={() => handleSettingsChange('shuffleQuestions', !quizSettings.shuffleQuestions)}>
                                        <div className="flex-1">
                                            <p className="text-[14px] sm:text-[15px] font-bold text-[#0f172a]">Shuffle Questions</p>
                                            <p className="text-[12px] sm:text-[13px] font-medium text-gray-400">Randomize question order for each attempt</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${quizSettings.shuffleQuestions ? 'bg-[#3758EE]' : 'bg-gray-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${quizSettings.shuffleQuestions ? 'left-7' : 'left-1'}`} />
                                        </div>
                                    </div>

                                    {/* Shuffle Answer Options Toggle */}
                                    <div className="flex items-center justify-between gap-4 group cursor-pointer" onClick={() => handleSettingsChange('shuffleAnswerOptions', !quizSettings.shuffleAnswerOptions)}>
                                        <div className="flex-1">
                                            <p className="text-[14px] sm:text-[15px] font-bold text-[#0f172a]">Shuffle Answer Options</p>
                                            <p className="text-[12px] sm:text-[13px] font-medium text-gray-400">Randomize answer order for each question</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${quizSettings.shuffleAnswerOptions ? 'bg-[#3758EE]' : 'bg-gray-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${quizSettings.shuffleAnswerOptions ? 'left-7' : 'left-1'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between max-w-[1240px] mx-auto w-full gap-4 px-4 md:px-6 py-5 border-t border-gray-100 bg-[#f8fafc] z-20">
                <button
                    onClick={handleBack}
                    className="w-full sm:w-auto px-8 py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-[8px] hover:bg-gray-50 transition-all active:scale-95 text-[14px]"
                >
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium rounded-[8px] active:scale-95 transition-all text-[14px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <><Loader2 size={15} className="animate-spin" /> Saving...</>
                    ) : currentStep === (quizId ? 3 : 4) ? (quizId ? 'Update Quiz' : 'Create Quiz') : 'Continue'}
                </button>
            </div>

            {/* Validation Modal */}
            {validationModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-[400px] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="text-red-500 w-8 h-8" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[20px] font-bold text-[#0f172a] mb-2">Incomplete Form</h3>
                            <p className="text-[#64748b] text-[14px] font-medium leading-relaxed">
                                {validationModal.message}
                            </p>
                            <button
                                onClick={() => setValidationModal({ isOpen: false, message: '' })}
                                className="mt-8 w-full py-3.5 bg-gradient-to-r from-[#8b5cf6] to-[#4f46e5] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-[0.98]"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #8b5cf6;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #e2e8f0 transparent;
                }
            `}} />
        </div>
    );
};

export default CreateQuiz;
