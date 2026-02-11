import React, { useState } from 'react';
import { Upload, ChevronDown, Bell, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';

const LectureCard = ({ item }) => {
    return (
        <div className="w-full max-w-[320px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden font-sans">
            {/* Thumbnail Area */}
            <div className="relative aspect-[16/10] bg-gray-900 group">
                <img
                    src="https://images.unsplash.com/photo-1585829365234-781f353c3dce?auto=format&fit=crop&q=80&w=400"
                    alt="Course Preview"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />

                {/* Header Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/40">
                        <img src="https://ui-avatars.com/api/?name=Abu+Yahya&background=random" alt="User" />
                    </div>
                    <span className="text-white text-[12px] font-bold shadow-sm">Abu Yahya</span>
                </div>

                <div className="absolute top-3 right-3 text-white cursor-pointer p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                </div>

                {/* Footer Overlay */}
                <div className="absolute bottom-3 left-3 text-white text-[12px] font-bold">
                    Lecture-{item.number || '01'}
                </div>
                <div className="absolute bottom-3 right-3 text-white text-[12px] font-bold">
                    1:00:00
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <h4 className="text-[17px] font-bold text-[#0f172a] leading-tight">{item.title || "Quran Recitation"}</h4>
                    <span className="text-[11px] text-[#64748b] font-medium min-w-max">10-Jan-2025</span>
                </div>

                {/* Audio Player UI */}
                <div className="space-y-2">
                    <span className="text-[11px] text-[#64748b] font-bold">Audio</span>
                    <div className="flex items-center gap-3 bg-[#f8fafc] rounded-[10px] px-3 py-2">
                        <div className="w-5 h-5 flex items-center justify-center text-[#0f172a] cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                        <span className="text-[10px] text-[#0f172a] font-bold whitespace-nowrap">0:00 / 1:00:00</span>
                        <div className="flex-1 h-[3px] bg-gray-200 rounded-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1/3 h-full bg-[#0f172a] rounded-full" />
                        </div>
                        <div className="w-5 h-5 flex items-center justify-center text-[#64748b]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        </div>
                    </div>
                </div>

                {/* PDF Info */}
                <div className="space-y-2">
                    <span className="text-[11px] text-[#64748b] font-bold">Pdf Lecture</span>
                    <div className="flex items-center gap-3 bg-[#f8fafc] rounded-[10px] px-3 py-2 border border-transparent hover:border-blue-100 transition-colors cursor-pointer">
                        <div className="w-6 h-6 bg-white rounded-md border border-gray-100 flex items-center justify-center p-1 shadow-sm">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 11V16M12 16L10.5 14.5M12 16L13.5 14.5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 2H9C6.23858 2 4 4.23858 4 7V17C4 19.7614 6.23858 22 9 22H15C17.7614 22 20 19.7614 20 17V7C20 4.23858 17.7614 2 15 2Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 2V5C15 6.10457 15.8954 7 17 7H20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <span className="text-[11px] text-[#0f172a] font-bold truncate">Lecture-01-pdf</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddCoursePage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseItems, setCourseItems] = useState([]);

    // Form state for modal
    const [newItem, setNewItem] = useState({
        type: 'Lecture',
        title: '',
        number: ''
    });

    const steps = [
        { id: 1, label: 'Course Setup' },
        { id: 2, label: 'Add Course Content' },
        { id: 3, label: 'Review & Publish' }
    ];

    const handleSaveItem = () => {
        if (!newItem.title) return;
        setCourseItems([...courseItems, { ...newItem, id: Date.now() }]);
        setNewItem({ type: 'Lecture', title: '', number: '' });
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center font-sans overflow-hidden font-['Public_Sans']">
            <div className='w-full max-w-[1920px] min-h-screen max-h-[1680px] flex flex-col'>
                {/* Top Navigation Bar */}
                <Navbar />

                {/* Main Content Area */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar relative z-10">
                    <div className=" mx-auto flex flex-col min-h-full overflow-hidden">

                        {/* Header Row: Title + Stepper */}
                        <div className="px-10 py-10 flex items-center justify-between border-b border-gray-50 flex-nowrap">
                            <div className="flex items-center gap-4 min-w-max">
                                <div className="w-10 h-10 bg-[#eff6ff] rounded-[14px] flex items-center justify-center shadow-inner">
                                    <div className="w-5.5 h-5.5 bg-[#4f46e5] rounded-[6px] flex items-center justify-center p-1 shadow-sm">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                    </div>
                                </div>
                                <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">Add New Course</h2>
                            </div>

                            {/* Stepper Implementation */}
                            <div className="flex items-center gap-4 ml-auto w-full max-w-[900px]">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex-1 group">
                                        <div className={`h-[4px] w-full rounded-full transition-all duration-300 ${currentStep >= step.id ? 'bg-[#3b82f6]' : 'bg-[#6b7280]'
                                            }`} />
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className={`w-[22px] h-[22px] rounded-full border-2 transition-all duration-300 flex-shrink-0 flex items-center justify-center ${currentStep >= step.id ? 'border-[#3b82f6]' : 'border-[#6b7280]'
                                                }`}>
                                                {currentStep > step.id && (
                                                    <div className="w-2 h-2 bg-[#3b82f6] rounded-full" />
                                                )}
                                                {currentStep === step.id && step.id === 1 && (
                                                    <div className="w-2 h-2 bg-[#3b82f6] rounded-full" />
                                                )}
                                            </div>
                                            <span className={`text-[13px] font-bold transition-all duration-300 whitespace-nowrap ${currentStep >= step.id ? 'text-[#3b82f6]' : 'text-[#6b7280]'
                                                }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {currentStep === 1 ? (
                            /* Step 1: Course Setup Form Section */
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
                                                <input type="text" placeholder="Enter title" className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Instructor</label>
                                                <input type="text" placeholder="Enter name" className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Batch Strength</label>
                                                <input type="text" placeholder="10 students per batch" className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-500 shadow-sm" />
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">If 100 students enroll → system auto-creates 10 batches.</p>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Certificate Eligibility (%)</label>
                                                <input type="text" placeholder="Enter" className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] shadow-sm" />
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium leading-tight">How much course progress is required to unlock certificate</p>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Course Duration</label>
                                                <div className="relative group">
                                                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-400 appearance-none bg-white shadow-sm">
                                                        <option>Select</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
                                                </div>
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">Example 3 Months / 12 Weeks / 60 Days</p>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Release Date</label>
                                                <div className="relative group">
                                                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-400 appearance-none bg-white shadow-sm">
                                                        <option>Select</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Add by <span className="text-gray-400 font-normal text-[10px] lowercase">(read-only)</span></label>
                                                <div className="relative group">
                                                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-400 appearance-none bg-white shadow-sm">
                                                        <option>Select</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Total Lectures</label>
                                                <input type="text" placeholder="Enter total lectures" className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm" />
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">Example 25 Lectures</p>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Upload Certificate</label>
                                                <div className="w-full h-[46px] px-4 py-2 border border-gray-200 rounded-lg flex items-center bg-white shadow-sm">
                                                    <button className="px-5 py-1.5 bg-[#f3f4f6] text-[#0f172a] text-[12px] font-bold rounded-md hover:bg-gray-200 transition-all">Browse file</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Unlock Next Course (%)</label>
                                                <div className="relative group">
                                                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-400 appearance-none bg-white shadow-sm">
                                                        <option>Enter</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
                                                </div>
                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">60% of this course must be viewed.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thumbnail Upload Dashed Area */}
                                    <div className="mt-12 relative">
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-4">Upload Course Thumbnail</label>
                                        <div className="w-full border-2 border-dashed border-gray-300 rounded-[24px] py-14 flex flex-col items-center justify-center bg-transparent transition-all group hover:border-blue-400 hover:bg-blue-50/10 cursor-pointer">
                                            <div className="w-16 h-16 bg-white rounded-[18px] shadow-lg border border-gray-50 flex items-center justify-center text-[#1e293b] mb-6 group-hover:scale-105 transition-transform duration-300">
                                                <Upload size={32} strokeWidth={2.5} />
                                            </div>
                                            <button className="px-8 py-2.5 bg-[#f3f4f6] text-[#0f172a] text-[13px] font-bold rounded-xl mb-4 hover:bg-gray-200 transition-colors shadow-sm active:scale-95">Browse file</button>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">MP4 / MOV</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : currentStep === 2 ? (
                            /* Step 2: Add Course Content Section */
                            <div className="px-10 py-10 flex-1">
                                <div className="max-w-[1400px] w-full mx-auto">
                                    <div className="mb-10">
                                        <h3 className="text-[22px] font-bold text-[#0f172a] mb-2">Add Course Content</h3>
                                        <p className="text-[#64748b] font-medium text-[15px]">Upload lectures, quizzes, and assignments. Each item will auto-generate numbering and structure.</p>
                                    </div>

                                    <div className="flex flex-wrap items-stretch justify-start gap-8 mt-4">
                                        {/* Render Added Course Items */}
                                        {courseItems.map((item) => (
                                            <LectureCard key={item.id} item={item} />
                                        ))}

                                        {/* Add Lectures & Others Card */}
                                        <div
                                            onClick={() => setIsModalOpen(true)}
                                            className="w-full max-w-[280px] bg-[#F7F4FF] rounded-[24px] flex flex-col items-center justify-center p-8 cursor-pointer group hover:shadow-xl hover:shadow-[#4f46e5]/10 border border-transparent hover:border-[#4f46e5]/20 transition-all duration-300 min-h-[300px]"
                                        >
                                            <div className="w-14 h-14 bg-[#3b82f6] rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            </div>
                                            <span className="text-[#3b82f6] text-[18px] font-bold">Add Lectures & Others</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Step 3: Review & Publish Section */
                            <div className="px-10 py-10 flex-1 space-y-12">
                                <div className="max-w-[1400px] mx-auto">
                                    {/* Course Setup Review */}
                                    <div className="bg-white rounded-[24px] p-10 border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-[22px] font-bold text-[#0f172a]">Course Setup</h3>
                                            <button
                                                onClick={() => setCurrentStep(1)}
                                                className="text-[#3b82f6] font-bold text-[16px] hover:underline transition-all"
                                            >
                                                Edit
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-10 gap-x-20">
                                            {[
                                                { label: 'Course Title', value: 'Quran Recitation' },
                                                { label: 'Release Date', value: '10-Jan-2025' },
                                                { label: 'Instructor', value: 'Abu Yahya' },
                                                { label: 'Add by(read-only)', value: 'Admin 1' },
                                                { label: 'Batch Strength', value: '10 students per batch' },
                                                { label: 'Total Lectures', value: '8' },
                                                { label: 'Course Duration', value: '60 Days' },
                                                { label: 'Unlock Next Course (%)', value: '80%' },
                                                { label: 'Certificate Eligibility (%)', value: '70%' },
                                                { label: 'Upload Certificate', value: 'Lecture-01-pdf', isFile: true },
                                            ].map((field, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <span className="text-[12px] text-[#64748b] font-medium block">{field.label}</span>
                                                    {field.isFile ? (
                                                        <div className="bg-[#f8fafc] px-4 py-2 rounded-lg border border-gray-100 flex items-center gap-3 w-fit pr-10">
                                                            <div className="w-5 h-5 flex items-center justify-center">
                                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 11V16M12 16L10.5 14.5M12 16L13.5 14.5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 2H9C6.23858 2 4 4.23858 4 7V17C4 19.7614 6.23858 22 9 22H15C17.7614 22 20 19.7614 20 17V7C20 4.23858 17.7614 2 15 2Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 2V5C15 6.10457 15.8954 7 17 7H20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                            </div>
                                                            <span className="text-[13px] text-[#0f172a] font-bold">{field.value}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[15px] text-[#0f172a] font-bold block">{field.value}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-10">
                                            <span className="text-[12px] text-[#64748b] font-medium block mb-4">Upload Course Thumbnail</span>
                                            <div className="w-full border-2 border-dashed border-gray-200 rounded-[20px] py-10 flex items-center justify-center bg-transparent">
                                                <div className="max-w-[220px] rounded-xl overflow-hidden shadow-lg border border-white">
                                                    <img
                                                        src="https://images.unsplash.com/photo-1544923246-77307dd654ca?auto=format&fit=crop&q=80&w=400"
                                                        alt="Thumbnail"
                                                        className="w-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lectures Content Review */}
                                    <div className="mt-16 bg-white rounded-[24px] p-10 border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-[22px] font-bold text-[#0f172a]">Lectures Content</h3>
                                            <button
                                                onClick={() => setCurrentStep(2)}
                                                className="text-[#3b82f6] font-bold text-[16px] hover:underline transition-all"
                                            >
                                                Edit
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                            {/* Dummy cards matching screenshot grid */}
                                            {Array.from({ length: 8 }).map((_, idx) => (
                                                <LectureCard key={idx} item={{ number: '01', title: 'Quran Recitation' }} />
                                            ))}
                                        </div>
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
                                <button className="px-12 py-3.5 bg-[#f3f4f6] text-[#64748b] font-bold rounded hover:bg-gray-200 hover:text-[#0f172a] transition-all active:scale-95 shadow-sm">Save as draft</button>
                                <GradiantButton
                                    onClick={() => currentStep < 3 ? setCurrentStep(currentStep + 1) : navigate('/admin-dashboard')}
                                    className="px-15 py-3.5 font-bold rounded transition-all active:scale-95 shadow-sm"
                                >
                                    {currentStep === 3 ? 'Save' : 'Next'}
                                </GradiantButton>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add New Course Item Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
                        <div className="bg-white w-full max-w-[720px] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
                            {/* Modal Header */}
                            <div className="px-8 pt-8 pb-6 bg-white">
                                <div className="flex items-start gap-4 mb-1">
                                    <div className="w-10 h-10 bg-[#eff6ff] rounded-[14px] flex items-center justify-center flex-shrink-0">
                                        <div className="w-5.5 h-5.5 bg-[#4f46e5] rounded-[6px] flex items-center justify-center p-1 shadow-sm">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">Add New Course Item</h2>
                                        <p className="text-[#64748b] text-[13px] font-medium leading-relaxed">Select the type of content you want to add and upload the required files.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="px-8 pb-8">
                                <div className="space-y-6">
                                    {/* Select Type */}
                                    <div>
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Select Type</label>
                                        <div className="relative group">
                                            <select
                                                value={newItem.type}
                                                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-800 appearance-none shadow-sm cursor-pointer"
                                            >
                                                <option>Lecture</option>
                                                <option>Quiz</option>
                                                <option>Assignment</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
                                        </div>
                                    </div>

                                    {/* Name & Number Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Lecture name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter title"
                                                value={newItem.title}
                                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Lecture Number <span className="text-[#64748b] font-medium text-[10px]">(Auto-Generated)</span></label>
                                            <input
                                                type="text"
                                                placeholder="Enter title"
                                                value={newItem.number}
                                                onChange={(e) => setNewItem({ ...newItem, number: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Multi-Upload Area */}
                                    <div className="space-y-6">
                                        {/* Large Video Upload */}
                                        <div className="relative">
                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Upload Video Lecture</label>
                                            <div className="w-full border-2 border-dashed border-gray-300 rounded-[18px] py-8 flex flex-col items-center justify-center bg-transparent group hover:border-[#3b82f6] hover:bg-blue-50/5 cursor-pointer">
                                                {/* 'M' Badge */}
                                                <div className="absolute top-[34px] left-1/2 -translate-x-1/2 w-8 h-8 bg-[#334155] rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
                                                    <span className="text-white text-[12px] font-bold">M</span>
                                                </div>

                                                <div className="w-12 h-12 bg-white rounded-[14px] shadow-sm border border-gray-100 flex items-center justify-center text-[#1e293b] mb-4 mt-2 group-hover:scale-105 transition-transform duration-300">
                                                    <Upload size={24} strokeWidth={2.5} />
                                                </div>
                                                <button className="px-6 py-1.5 bg-[#f3f4f6] text-[#0f172a] text-[11px] font-bold rounded-lg mb-2 hover:bg-gray-200 transition-colors shadow-sm">Browse file</button>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">MP4 / MOV</span>
                                            </div>
                                        </div>

                                        {/* Small Combined Uploads */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Optional Audio Upload</label>
                                                <div className="w-full border-2 border-dashed border-gray-300 rounded-[18px] py-6 flex flex-col items-center justify-center bg-transparent group hover:border-[#3b82f6] cursor-pointer">
                                                    <div className="w-10 h-10 bg-white rounded-[12px] shadow-sm border border-gray-100 flex items-center justify-center text-[#1e293b] mb-3 group-hover:scale-105 transition-transform duration-300">
                                                        <Upload size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <button className="px-5 py-1.5 bg-[#f3f4f6] text-[#0f172a] text-[10px] font-bold rounded-lg mb-2 hover:bg-gray-200 transition-colors shadow-sm">Browse file</button>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">MP3 / WAV</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Upload Resources <span className="text-[#64748b] font-medium text-[11px]">(Optional)</span></label>
                                                <div className="w-full border-2 border-dashed border-gray-300 rounded-[18px] py-6 flex flex-col items-center justify-center bg-transparent group hover:border-[#3b82f6] cursor-pointer">
                                                    <div className="w-10 h-10 bg-white rounded-[12px] shadow-sm border border-gray-100 flex items-center justify-center text-[#1e293b] mb-3 group-hover:scale-105 transition-transform duration-300">
                                                        <Upload size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <button className="px-5 py-1.5 bg-[#f3f4f6] text-[#0f172a] text-[10px] font-bold rounded-lg mb-2 hover:bg-gray-200 transition-colors shadow-sm">Browse file</button>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">PDF / PPT / DOC</span>
                                                </div>
                                            </div>
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
