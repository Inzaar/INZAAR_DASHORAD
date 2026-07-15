import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Plus, Minus, ChevronDown, Loader2 } from 'lucide-react';
import { getAllCourses, getCourseDetails } from '@/api/course';
import { useAuth } from '@/context/AuthContext';
import { submitSupportIssue } from '@/api/support';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const HelpCenter = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('contact');
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [issue, setIssue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !issue.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading("Sending your message to admin support...");
        try {
            const response = await submitSupportIssue({ name, email, issue });
            if (response && response.success) {
                toast.success("Support ticket sent successfully to admin!", { id: toastId });
                setIssue('');
            } else {
                toast.error(response?.message || "Failed to send support request", { id: toastId });
            }
        } catch (error) {
            console.error("Support submission error:", error);
            toast.error(error?.response?.data?.message || "An error occurred while sending your request.", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const [complaintType, setComplaintType] = useState({
        course: false,
        lecture: false
    });

    // Data State
    const [courses, setCourses] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedLecture, setSelectedLecture] = useState('');
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingLectures, setLoadingLectures] = useState(false);

    // Dropdown Open State
    const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
    const [isLectureDropdownOpen, setIsLectureDropdownOpen] = useState(false);

    // Fetch enrolled courses
    useEffect(() => {
        const fetchCourses = async () => {
            if (complaintType.course || complaintType.lecture) {
                setLoadingCourses(true);
                try {
                    const res = await getAllCourses();
                    setCourses(res.data.data || []);
                } catch (error) {
                    console.error("Error fetching courses:", error);
                } finally {
                    setLoadingCourses(false);
                }
            }
        };
        fetchCourses();
    }, [complaintType.course, complaintType.lecture]);

    // Fetch lectures for selected course
    useEffect(() => {
        const fetchLectures = async () => {
            if (selectedCourse && complaintType.lecture) {
                setLoadingLectures(true);
                try {
                    const res = await getCourseDetails(selectedCourse);
                    setLectures(res.data.data.lectures || []);
                } catch (error) {
                    console.error("Error fetching lectures:", error);
                } finally {
                    setLoadingLectures(false);
                }
            } else {
                setLectures([]);
                setSelectedLecture('');
            }
        };
        fetchLectures();
    }, [selectedCourse, complaintType.lecture]);

    const handleCheckboxChange = (type) => {
        setComplaintType(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    // Helper to get course/lecture names
    const getSelectedCourseName = () => {
        const course = courses.find(c => (c._id || c.id) === selectedCourse);
        return course ? (course.title || course.courseId?.title) : "Choose a course...";
    };

    const getSelectedLectureName = () => {
        const lecture = lectures.find(l => (l._id || l.id) === selectedLecture);
        return lecture ? `Lec ${lecture.lectureNo}: ${lecture.title}` : "Choose a lecture...";
    };

    const faqs = [
        {
            question: t("faq_q1", "Why is the next lecture locked?"),
            answer: t("faq_a1", "The next lecture unlocks only after you watch at least 70% of the current lecture. This helps ensure proper understanding before moving forward.")
        },
        {
            question: t("faq_q2", "When will my course certificate be available?"),
            answer: t("faq_a2", "Certificates are automatically generated and available for download once you have completed 100% of the course content and passed all required assessments.")
        },
        {
            question: t("faq_q3", "Can I enroll in more than one course at the same time?"),
            answer: t("faq_a3", "Yes, you can enroll in multiple courses simultaneously. Your progress for each course is tracked independently.")
        }
    ];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>

                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`
                        transition-transform duration-300 ease-in-out z-40
                        lg:translate-x-0 lg:static lg:block
                        fixed left-0 top-0 shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className="py-4 pr-2 flex flex-col gap-6">

                            {/* Header Section */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2 leading-[1.8] pt-2 pb-2">{t('support_center', 'Support Center')}</h2>
                                <p className="text-gray-500 text-sm leading-[1.8]">{t('support_center_desc', 'Find answers, report issues, and get in touch with our team to help you make the most of Inzaar Team.')}</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex bg-white rounded-lg p-1 w-full border border-gray-100 shadow-sm">
                                {activeTab === 'contact' ? (
                                    <GradiantButton
                                        onClick={() => setActiveTab('contact')}
                                        className="flex-1 py-4 text-sm font-medium rounded-md shadow-sm"
                                    >
                                        {t('contact_support', 'Contact Support')}
                                    </GradiantButton>
                                ) : (
                                    <button
                                        onClick={() => setActiveTab('contact')}
                                        className="flex-1 py-4 text-sm font-medium rounded-md transition-all text-gray-500 hover:bg-gray-50"
                                    >
                                        {t('contact_support', 'Contact Support')}
                                    </button>
                                )}

                                {activeTab === 'faq' ? (
                                    <GradiantButton
                                        onClick={() => setActiveTab('faq')}
                                        className="flex-1 py-4 text-sm font-medium rounded-md shadow-sm"
                                    >
                                        {t('helps_faq', 'Helps & FAQ')}
                                    </GradiantButton>
                                ) : (
                                    <button
                                        onClick={() => setActiveTab('faq')}
                                        className="flex-1 py-4 text-sm font-medium rounded-md transition-all text-gray-500 hover:bg-gray-50"
                                    >
                                        {t('helps_faq', 'Helps & FAQ')}
                                    </button>
                                )}
                            </div>

                            {/* Content Section */}
                            {activeTab === 'contact' && (
                                <div className="animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">support@email.com</h3>

                                    <div className="bg-white rounded-[16px] border border-[#EAEDF2] p-8 shadow-sm">
                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-[1.8] pt-2 pb-2">{t('contact_support', 'Contact Support')}</h3>
                                            <p className="text-gray-500 text-sm leading-[1.8]">{t('contact_support_desc', 'Fill out the form below to get in touch with our support team.')}</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">{t('name', 'Name')}</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                    placeholder={t('your_name', 'Your name')}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">{t('email', 'Email')}</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    placeholder={t('your_email_address', 'Your email address')}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                                />
                                            </div>

                                            {/* Complaint Category Checkboxes */}
                                            {/* <div className="space-y-4 pt-2">
                                                <p className="text-sm font-semibold text-gray-700 mb-3">Is your complaint related to:</p>
                                                
                                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="relative flex items-center justify-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={complaintType.course}
                                                                onChange={() => handleCheckboxChange('course')}
                                                                className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer"
                                                            />
                                                            <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Any Course?</span>
                                                    </label>

                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="relative flex items-center justify-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={complaintType.lecture}
                                                                onChange={() => handleCheckboxChange('lecture')}
                                                                className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer"
                                                            />
                                                            <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Any Lecture?</span>
                                                    </label>
                                                </div>
                                            </div> */}

                                            {/* Dynamic Dropdowns */}
                                            {/* {(complaintType.course || complaintType.lecture) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="space-y-1.5 relative">
                                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Select Course <span className="text-purple-500">*</span></label>
                                                        <div 
                                                            className={`relative h-10 w-full px-3 bg-gray-50/50 border rounded-xl flex items-center justify-between cursor-pointer transition-all hover:border-purple-300 ${isCourseDropdownOpen ? 'border-purple-500 ring-2 ring-purple-500/10 bg-white' : 'border-gray-200'}`}
                                                            onClick={() => {
                                                                setIsCourseDropdownOpen(!isCourseDropdownOpen);
                                                                setIsLectureDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span className={`text-[13px] truncate ${!selectedCourse ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                                                                {getSelectedCourseName()}
                                                            </span>
                                                            <div className="text-gray-400 group-hover:text-purple-500 transition-colors">
                                                                {loadingCourses ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown size={14} className={`transition-transform duration-200 ${isCourseDropdownOpen ? 'rotate-180' : ''}`} />}
                                                            </div>

                                                            {isCourseDropdownOpen && (
                                                                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-[100] max-h-[220px] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                                                    {courses.length > 0 ? courses.map((course) => (
                                                                        <div
                                                                            key={course._id || course.id}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedCourse(course._id || course.id);
                                                                                setIsCourseDropdownOpen(false);
                                                                            }}
                                                                            className={`px-4 py-2 text-[13px] transition-colors cursor-pointer ${selectedCourse === (course._id || course.id) ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'}`}
                                                                        >
                                                                            {course.title || course.courseId?.title}
                                                                        </div>
                                                                    )) : (
                                                                        <div className="px-4 py-2 text-[13px] text-gray-400 italic text-center">No courses found</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {complaintType.lecture && (
                                                        <div className="space-y-1.5 relative">
                                                            <label className={`text-[11px] font-bold uppercase tracking-wider ${!selectedCourse ? 'text-gray-300' : 'text-gray-500'}`}>
                                                                Select Lecture <span className="text-purple-500">*</span>
                                                            </label>
                                                            <div 
                                                                className={`relative h-10 w-full px-3 border rounded-xl flex items-center justify-between transition-all ${!selectedCourse ? 'bg-gray-50 border-gray-100 cursor-not-allowed' : 'bg-gray-50/50 hover:border-purple-300 cursor-pointer'} ${isLectureDropdownOpen ? 'border-purple-500 ring-2 ring-purple-500/10 bg-white' : 'border-gray-200'}`}
                                                                onClick={() => {
                                                                    if (!selectedCourse) return;
                                                                    setIsLectureDropdownOpen(!isLectureDropdownOpen);
                                                                    setIsCourseDropdownOpen(false);
                                                                }}
                                                            >
                                                                <span className={`text-[13px] truncate ${!selectedLecture ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                                                                    {getSelectedLectureName()}
                                                                </span>
                                                                <div className="text-gray-400 group-hover:text-purple-500 transition-colors">
                                                                    {loadingLectures ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown size={14} className={`transition-transform duration-200 ${isLectureDropdownOpen ? 'rotate-180' : ''}`} />}
                                                                </div>

                                                                {isLectureDropdownOpen && (
                                                                    <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-[100] max-h-[220px] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                                                        {lectures.length > 0 ? lectures.map((lecture) => (
                                                                            <div
                                                                                key={lecture._id || lecture.id}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedLecture(lecture._id || lecture.id);
                                                                                    setIsLectureDropdownOpen(false);
                                                                                }}
                                                                                className={`px-4 py-2 text-[13px] transition-colors cursor-pointer ${selectedLecture === (lecture._id || lecture.id) ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'}`}
                                                                            >
                                                                                Lec {lecture.lectureNo}: {lecture.title}
                                                                            </div>
                                                                        )) : (
                                                                            <div className="px-4 py-2 text-[13px] text-gray-400 italic text-center">
                                                                                {!selectedCourse ? 'Select a course first' : 'No lectures found'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )} */}

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">{t('issue_question', 'Issue / Question')}</label>
                                                <textarea
                                                    required
                                                    value={issue}
                                                    onChange={(e) => setIssue(e.target.value)}
                                                    placeholder={t('discuss_issue_placeholder', 'Discuss your issue or question here...')}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 min-h-[160px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                                />
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <GradiantButton 
                                                    type="submit" 
                                                    disabled={submitting}
                                                    className="px-10 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-purple-500/20 flex items-center gap-2"
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            {t('submitting', 'Submitting...')}
                                                        </>
                                                    ) : (
                                                        t('submit', 'Submit')
                                                    )}
                                                </GradiantButton>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'faq' && (
                                <div className="animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 leading-[1.8] pt-2 pb-2">{t('helps_faq', 'Helps & FAQs')}</h3>

                                    <div className="bg-white rounded-[16px] border border-[#EAEDF2] p-8 shadow-sm">
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-[1.8] pt-2 pb-2">{t('helps_faq', 'Helps & FAQs')}</h3>
                                            <p className="text-gray-500 text-sm leading-[1.8]">{t('helps_faq_desc', 'Find answers to common questions and helpful tips to get started quickly.')}</p>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {faqs.map((faq, index) => (
                                                <div
                                                    key={index}
                                                    className={`rounded-lg transition-all duration-200 ${openFaqIndex === index ? 'bg-gray-50 p-4' : 'bg-transparent py-3 border-b border-gray-50 last:border-0'
                                                        }`}
                                                >
                                                    <button
                                                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                                                        className="w-full flex items-center justify-between gap-4 text-left"
                                                    >
                                                        <span className={`font-medium text-sm ${openFaqIndex === index ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {faq.question}
                                                        </span>
                                                        <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-colors ${openFaqIndex === index ? 'text-[#00C896] bg-[#E6F9F4]' : 'text-gray-400 bg-gray-100'
                                                            }`}>
                                                            {openFaqIndex === index ? <Plus className="h-4 w-4 rotate-45 transition-transform" /> : <Minus className="h-4 w-4" />}
                                                        </span>
                                                    </button>

                                                    {openFaqIndex === index && (
                                                        <div className="mt-3 text-sm text-gray-500 leading-relaxed pr-8 animate-in slide-in-from-top-1 duration-200">
                                                            {faq.answer}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />
            </div>
        </div>
    );
};

export default HelpCenter;
