import React, { useState } from 'react';
import { Upload, ChevronDown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { createCourseWithLectures } from '@/api/course';
import { useAuth } from '@/context/AuthContext';

/* ─────────────────────────────────────── helpers ── */
const DURATIONS = ['3 Months', '12 Weeks', '60 Days', '6 Months', '1 Year'];
const UNLOCK_PCT = ['20', '40', '50', '60', '70', '80', '90', '100'];

/* ─────────────────────────────────────── LectureCard ── */
const LectureCard = ({ item }) => (
    <div className="w-full max-w-[320px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden font-sans">
        <div className="relative aspect-[16/10] bg-gray-900 group">
            <img
                src="https://images.unsplash.com/photo-1585829365234-781f353c3dce?auto=format&fit=crop&q=80&w=400"
                alt="Course Preview"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/40">
                    <img src="https://ui-avatars.com/api/?name=Abu+Yahya&background=random" alt="User" />
                </div>
                <span className="text-white text-[12px] font-bold shadow-sm">Instructor</span>
            </div>
            <div className="absolute bottom-3 left-3 text-white text-[12px] font-bold">
                Lecture-{String(item.lectureNo || item.number || 1).padStart(2, '0')}
            </div>
            <div className="absolute bottom-3 right-3 text-white text-[12px] font-bold">1:00:00</div>
        </div>
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-start">
                <h4 className="text-[17px] font-bold text-[#0f172a] leading-tight">{item.title || 'Untitled Lecture'}</h4>
                <span className="text-[11px] text-[#64748b] font-medium min-w-max">{item.type || 'Lecture'}</span>
            </div>
            {item.videoUrl && (
                <div className="space-y-1">
                    <span className="text-[11px] text-[#64748b] font-bold">Video</span>
                    <div className="flex items-center gap-2 bg-[#f8fafc] rounded-[10px] px-3 py-2">
                        <span className="text-[10px] text-[#0f172a] font-medium truncate">{item.videoUrl}</span>
                    </div>
                </div>
            )}
            {item.audioUrl && (
                <div className="space-y-1">
                    <span className="text-[11px] text-[#64748b] font-bold">Audio</span>
                    <div className="flex items-center gap-2 bg-[#f8fafc] rounded-[10px] px-3 py-2">
                        <span className="text-[10px] text-[#0f172a] font-medium truncate">{item.audioUrl}</span>
                    </div>
                </div>
            )}
            {item.pdfUrl && (
                <div className="space-y-1">
                    <span className="text-[11px] text-[#64748b] font-bold">PDF Resource</span>
                    <div className="flex items-center gap-2 bg-[#f8fafc] rounded-[10px] px-3 py-2">
                        <span className="text-[10px] text-[#0f172a] font-medium truncate">{item.pdfUrl}</span>
                    </div>
                </div>
            )}
        </div>
    </div>
);

/* ─────────────────────────────────────── main page ── */
const AddCoursePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    /* ── Course Setup State ── */
    const [courseForm, setCourseForm] = useState({
        title: '',
        instructor: '',
        batchStrength: '',
        totalLectures: '',
        certificateCriteria: '',
        unlockCriteria: '',
        duration: '',
        releaseDate: '',
        thumbnail: '',
        certificateFile: '',
    });

    /* ── Lectures State ── */
    const [courseItems, setCourseItems] = useState([]);

    /* ── Modal State ── */
    const [newItem, setNewItem] = useState({
        type: 'Lecture',
        title: '',
        videoUrl: '',
        audioUrl: '',
        pdfUrl: '',
    });

    const steps = [
        { id: 1, label: 'Course Setup' },
        { id: 2, label: 'Add Course Content' },
        { id: 3, label: 'Review & Publish' },
    ];

    const handleCourseFormChange = (field, value) => {
        setCourseForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveItem = () => {
        if (!newItem.title.trim()) return;
        setCourseItems(prev => [
            ...prev,
            {
                ...newItem,
                id: Date.now(),
                lectureNo: prev.length + 1,
            },
        ]);
        setNewItem({ type: 'Lecture', title: '', videoUrl: '', audioUrl: '', pdfUrl: '' });
        setIsModalOpen(false);
    };

    /* ── Submit to API ── */
    const handleSubmit = async (status = 'published') => {
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const payload = {
                title: courseForm.title,
                instructor: courseForm.instructor,
                addBy: user?.name || user?.firstname || 'Admin',
                batchStrength: Number(courseForm.batchStrength) || 0,
                totalLectures: Number(courseForm.totalLectures) || courseItems.length,
                certificateCriteria: Number(courseForm.certificateCriteria) || 0,
                unlockCriteria: Number(courseForm.unlockCriteria) || 0,
                duration: courseForm.duration,
                releaseDate: courseForm.releaseDate || new Date().toISOString(),
                thumbnail: courseForm.thumbnail || '',
                certificateFile: courseForm.certificateFile || '',
                status,
                lectures: courseItems.map((item, idx) => ({
                    title: item.title,
                    type: item.type || 'Lecture',
                    lectureNo: idx + 1,
                    videoUrl: item.videoUrl || '',
                    audioUrl: item.audioUrl || '',
                    pdfUrl: item.pdfUrl || '',
                })),
            };

            await createCourseWithLectures(payload);
            setSubmitSuccess(true);
            setTimeout(() => navigate('/admin-courses'), 1500);
        } catch (err) {
            console.error('Create course error:', err);
            setSubmitError(
                err?.response?.data?.message || 'Failed to create course. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ────────────────────────── render ── */
    return (
        <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center font-sans overflow-hidden font-['Public_Sans']">
            <div className="w-full max-w-[1920px] min-h-screen max-h-[1680px] flex flex-col">
                <Navbar />

                <div className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar relative z-10">
                    <div className="mx-auto flex flex-col min-h-full overflow-hidden">

                        {/* Header Row */}
                        <div className="px-10 py-10 flex items-center justify-between border-b border-gray-50 flex-nowrap">
                            <div className="flex items-center gap-4 min-w-max">
                                <div className="w-10 h-10 bg-[#eff6ff] rounded-[14px] flex items-center justify-center shadow-inner">
                                    <div className="w-5.5 h-5.5 bg-[#4f46e5] rounded-[6px] flex items-center justify-center p-1 shadow-sm">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                            <line x1="12" y1="22.08" x2="12" y2="12" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">Add New Course</h2>
                            </div>

                            {/* Stepper */}
                            <div className="flex items-center gap-4 ml-auto w-full max-w-[900px]">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex-1 group">
                                        <div className={`h-[4px] w-full rounded-full transition-all duration-300 ${currentStep >= step.id ? 'bg-[#3b82f6]' : 'bg-[#6b7280]'}`} />
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className={`w-[22px] h-[22px] rounded-full border-2 transition-all duration-300 flex-shrink-0 flex items-center justify-center ${currentStep >= step.id ? 'border-[#3b82f6]' : 'border-[#6b7280]'}`}>
                                                {currentStep > step.id && <div className="w-2 h-2 bg-[#3b82f6] rounded-full" />}
                                                {currentStep === step.id && <div className="w-2 h-2 bg-[#3b82f6] rounded-full" />}
                                            </div>
                                            <span className={`text-[13px] font-bold transition-all duration-300 whitespace-nowrap ${currentStep >= step.id ? 'text-[#3b82f6]' : 'text-[#6b7280]'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── STEP 1: Course Setup ── */}
                        {currentStep === 1 && (
                            <div className="px-10 py-10 flex-1">
                                <div className="max-w-[1300px] mx-auto">
                                    <div className="mb-10">
                                        <h3 className="text-[22px] font-bold text-[#0f172a] mb-2">Course Setup</h3>
                                        <p className="text-[#64748b] font-medium text-[15px]">Add basic course details including title, release month, duration, batch size, and certificate rules.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        {/* Left Column */}
                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Course Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter title"
                                                    value={courseForm.title}
                                                    onChange={e => handleCourseFormChange('title', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Instructor</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter name"
                                                    value={courseForm.instructor}
                                                    onChange={e => handleCourseFormChange('instructor', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Batch Strength</label>
                                                <input
                                                    type="number"
                                                    placeholder="10 students per batch"
                                                    value={courseForm.batchStrength}
                                                    onChange={e => handleCourseFormChange('batchStrength', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-500 shadow-sm"
                                                />
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">If 100 students enroll → system auto-creates 10 batches.</p>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Certificate Eligibility (%)</label>
                                                <input
                                                    type="number"
                                                    placeholder="Enter %"
                                                    value={courseForm.certificateCriteria}
                                                    onChange={e => handleCourseFormChange('certificateCriteria', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] shadow-sm"
                                                />
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium leading-tight">How much course progress is required to unlock certificate</p>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Course Duration</label>
                                                <div className="relative group">
                                                    <select
                                                        value={courseForm.duration}
                                                        onChange={e => handleCourseFormChange('duration', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-600 appearance-none bg-white shadow-sm"
                                                    >
                                                        <option value="">Select</option>
                                                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                </div>
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">Example 3 Months / 12 Weeks / 60 Days</p>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Release Date</label>
                                                <input
                                                    type="date"
                                                    value={courseForm.releaseDate}
                                                    onChange={e => handleCourseFormChange('releaseDate', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-600 bg-white shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">
                                                    Add by <span className="text-gray-400 font-normal text-[10px] lowercase">(read-only)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={user?.name || user?.firstname || 'Admin'}
                                                    className="w-full px-4 py-3 border border-gray-100 rounded-lg outline-none text-[14px] text-gray-500 bg-gray-50 shadow-sm cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Total Lectures</label>
                                                <input
                                                    type="number"
                                                    placeholder="Enter total lectures"
                                                    value={courseForm.totalLectures}
                                                    onChange={e => handleCourseFormChange('totalLectures', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                                />
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">Example 25 Lectures</p>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Certificate File URL</label>
                                                <input
                                                    type="text"
                                                    placeholder="https://example.com/certificate.pdf"
                                                    value={courseForm.certificateFile}
                                                    onChange={e => handleCourseFormChange('certificateFile', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Unlock Next Course (%)</label>
                                                <div className="relative group">
                                                    <select
                                                        value={courseForm.unlockCriteria}
                                                        onChange={e => handleCourseFormChange('unlockCriteria', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-600 appearance-none bg-white shadow-sm"
                                                    >
                                                        <option value="">Select %</option>
                                                        {UNLOCK_PCT.map(p => <option key={p} value={p}>{p}%</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                </div>
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">% of this course must be viewed to unlock next.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thumbnail URL */}
                                    <div className="mt-12">
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-4">Course Thumbnail URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://example.com/thumbnail.jpg"
                                            value={courseForm.thumbnail}
                                            onChange={e => handleCourseFormChange('thumbnail', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                        />
                                        {courseForm.thumbnail && (
                                            <div className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-[20px] py-6 flex items-center justify-center">
                                                <img src={courseForm.thumbnail} alt="Thumbnail preview" className="max-h-40 rounded-xl object-cover shadow" />
                                            </div>
                                        )}
                                        {!courseForm.thumbnail && (
                                            <div className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-[24px] py-14 flex flex-col items-center justify-center bg-transparent">
                                                <div className="w-16 h-16 bg-white rounded-[18px] shadow-lg border border-gray-50 flex items-center justify-center text-[#1e293b] mb-4">
                                                    <Upload size={32} strokeWidth={2.5} />
                                                </div>
                                                <p className="text-[12px] text-gray-400 font-medium">Paste a thumbnail URL above to preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Add Course Content ── */}
                        {currentStep === 2 && (
                            <div className="px-10 py-10 flex-1">
                                <div className="max-w-[1400px] w-full mx-auto">
                                    <div className="mb-10">
                                        <h3 className="text-[22px] font-bold text-[#0f172a] mb-2">Add Course Content</h3>
                                        <p className="text-[#64748b] font-medium text-[15px]">Upload lectures, quizzes, and assignments. Each item will auto-generate numbering and structure.</p>
                                    </div>

                                    <div className="flex flex-wrap items-stretch justify-start gap-8 mt-4">
                                        {courseItems.map((item) => (
                                            <LectureCard key={item.id} item={item} />
                                        ))}
                                        <div
                                            onClick={() => setIsModalOpen(true)}
                                            className="w-full max-w-[280px] bg-[#F7F4FF] rounded-[24px] flex flex-col items-center justify-center p-8 cursor-pointer group hover:shadow-xl hover:shadow-[#4f46e5]/10 border border-transparent hover:border-[#4f46e5]/20 transition-all duration-300 min-h-[300px]"
                                        >
                                            <div className="w-14 h-14 bg-[#3b82f6] rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            </div>
                                            <span className="text-[#3b82f6] text-[18px] font-bold">Add Lectures & Others</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Review & Publish ── */}
                        {currentStep === 3 && (
                            <div className="px-10 py-10 flex-1 space-y-12">
                                <div className="max-w-[1400px] mx-auto">

                                    {/* Success / Error Alerts */}
                                    {submitSuccess && (
                                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 mb-6">
                                            <CheckCircle size={20} />
                                            <span className="font-bold text-[14px]">Course created successfully! Redirecting…</span>
                                        </div>
                                    )}
                                    {submitError && (
                                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 mb-6">
                                            <AlertCircle size={20} />
                                            <span className="font-bold text-[14px]">{submitError}</span>
                                        </div>
                                    )}

                                    {/* Course Setup Review */}
                                    <div className="bg-white rounded-[24px] p-10 border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-[22px] font-bold text-[#0f172a]">Course Setup</h3>
                                            <button onClick={() => setCurrentStep(1)} className="text-[#3b82f6] font-bold text-[16px] hover:underline">Edit</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-10 gap-x-20">
                                            {[
                                                { label: 'Course Title', value: courseForm.title || '—' },
                                                { label: 'Release Date', value: courseForm.releaseDate || '—' },
                                                { label: 'Instructor', value: courseForm.instructor || '—' },
                                                { label: 'Add by (read-only)', value: user?.name || user?.firstname || 'Admin' },
                                                { label: 'Batch Strength', value: courseForm.batchStrength ? `${courseForm.batchStrength} students per batch` : '—' },
                                                { label: 'Total Lectures', value: courseForm.totalLectures || courseItems.length || '—' },
                                                { label: 'Course Duration', value: courseForm.duration || '—' },
                                                { label: 'Unlock Next Course (%)', value: courseForm.unlockCriteria ? `${courseForm.unlockCriteria}%` : '—' },
                                                { label: 'Certificate Eligibility (%)', value: courseForm.certificateCriteria ? `${courseForm.certificateCriteria}%` : '—' },
                                                { label: 'Certificate File', value: courseForm.certificateFile || '—' },
                                            ].map((field, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <span className="text-[12px] text-[#64748b] font-medium block">{field.label}</span>
                                                    <span className="text-[15px] text-[#0f172a] font-bold block">{field.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {courseForm.thumbnail && (
                                            <div className="mt-10">
                                                <span className="text-[12px] text-[#64748b] font-medium block mb-4">Thumbnail</span>
                                                <div className="w-full border-2 border-dashed border-gray-200 rounded-[20px] py-10 flex items-center justify-center">
                                                    <img src={courseForm.thumbnail} alt="Thumbnail" className="max-h-44 rounded-xl object-cover shadow-lg border border-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Lectures Review */}
                                    <div className="mt-10 bg-white rounded-[24px] p-10 border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-[22px] font-bold text-[#0f172a]">
                                                Lectures Content <span className="text-[16px] text-[#64748b] font-medium ml-2">({courseItems.length} lectures)</span>
                                            </h3>
                                            <button onClick={() => setCurrentStep(2)} className="text-[#3b82f6] font-bold text-[16px] hover:underline">Edit</button>
                                        </div>
                                        {courseItems.length === 0 ? (
                                            <p className="text-[#64748b] text-[14px] font-medium">No lectures added yet. Go to Step 2 to add lectures.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                                {courseItems.map((item) => (
                                                    <LectureCard key={item.id} item={item} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="px-10 py-8 flex justify-between items-center z-20 mt-auto">
                            <button
                                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/admin-dashboard')}
                                className="px-12 py-3.5 bg-[#f3f4f6] text-[#64748b] font-bold rounded hover:bg-gray-200 hover:text-[#0f172a] transition-all active:scale-95 shadow-sm"
                            >
                                {currentStep === 1 ? 'Cancel' : 'Back'}
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => currentStep === 3 ? handleSubmit('draft') : null}
                                    disabled={isSubmitting}
                                    className="px-12 py-3.5 bg-[#f3f4f6] text-[#64748b] font-bold rounded hover:bg-gray-200 hover:text-[#0f172a] transition-all active:scale-95 shadow-sm disabled:opacity-50"
                                >
                                    Save as draft
                                </button>
                                <GradiantButton
                                    onClick={() => currentStep < 3 ? setCurrentStep(currentStep + 1) : handleSubmit('published')}
                                    disabled={isSubmitting}
                                    className="px-12 py-3.5 font-bold rounded transition-all active:scale-95 shadow-sm disabled:opacity-70"
                                >
                                    {isSubmitting
                                        ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving…</span>
                                        : currentStep === 3 ? 'Save & Publish' : 'Next'
                                    }
                                </GradiantButton>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Add Lecture Modal ── */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
                        <div className="bg-white w-full max-w-[720px] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
                            <div className="px-8 pt-8 pb-6 bg-white">
                                <div className="flex items-start gap-4 mb-1">
                                    <div className="w-10 h-10 bg-[#eff6ff] rounded-[14px] flex items-center justify-center flex-shrink-0">
                                        <div className="w-5.5 h-5.5 bg-[#4f46e5] rounded-[6px] flex items-center justify-center p-1 shadow-sm">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                <line x1="12" y1="22.08" x2="12" y2="12" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">Add New Course Item</h2>
                                        <p className="text-[#64748b] text-[13px] font-medium leading-relaxed">Select the type of content and fill in the URLs for the required files.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8">
                                <div className="space-y-5">
                                    {/* Type */}
                                    <div>
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Select Type</label>
                                        <div className="relative group">
                                            <select
                                                value={newItem.type}
                                                onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-800 appearance-none shadow-sm cursor-pointer"
                                            >
                                                <option>Lecture</option>
                                                <option>Quiz</option>
                                                <option>Assignment</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Lecture Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter title"
                                            value={newItem.title}
                                            onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>

                                    {/* Video URL */}
                                    <div>
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Video URL <span className="text-gray-400 font-normal text-[11px]">(MP4 / MOV)</span></label>
                                        <input
                                            type="text"
                                            placeholder="https://example.com/lecture.mp4"
                                            value={newItem.videoUrl}
                                            onChange={e => setNewItem({ ...newItem, videoUrl: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>

                                    {/* Audio + PDF */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Audio URL <span className="text-gray-400 font-normal text-[11px]">(Optional)</span></label>
                                            <input
                                                type="text"
                                                placeholder="https://example.com/audio.mp3"
                                                value={newItem.audioUrl}
                                                onChange={e => setNewItem({ ...newItem, audioUrl: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Resource URL <span className="text-gray-400 font-normal text-[11px]">(Optional)</span></label>
                                            <input
                                                type="text"
                                                placeholder="https://example.com/resource.pdf"
                                                value={newItem.pdfUrl}
                                                onChange={e => setNewItem({ ...newItem, pdfUrl: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="mt-8 flex justify-between items-center bg-white gap-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-12 py-3 bg-[#f3f4f6] text-[#0f172a] font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-sm text-[14px]"
                                    >
                                        Cancel
                                    </button>
                                    <GradiantButton
                                        onClick={handleSaveItem}
                                        className="px-16 py-3 font-bold rounded-xl transition-all active:scale-95 shadow-sm text-[14px]"
                                    >
                                        Save
                                    </GradiantButton>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{
                    __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Public Sans', sans-serif; }
            `}} />
            </div>
        </div>
    );
};

export default AddCoursePage;
