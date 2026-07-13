import React, { useState, useRef } from 'react';
import { Upload, ChevronDown, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Trash2, Pencil } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { createCourseWithLectures, createCourse, uploadImage, uploadAudio, uploadPdf, getAdminCourseById, updateCourse } from '@/api/course';
import { useAuth } from '@/context/AuthContext';
import ThumbnailCropper from '../components/ThumbnailCropper';
import SelectContentTypeModal from '../components/SelectContentTypeModal';
import CreateQuiz from '../components/CreateQuiz';
import CreateAssignment from '../components/CreateAssignment';

/* ─────────────────────────────────────── helpers ── */
const DURATIONS = ['3 Months', '12 Weeks', '60 Days', '6 Months', '1 Year'];
const UNLOCK_PCT = ['20', '40', '50', '60', '70', '80', '90', '100'];

/* ─────────────────────────────────────── LectureCard ── */
const LectureCard = ({ item, onEdit, onDelete }) => (
    <div className="w-full max-w-[320px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden font-sans flex flex-col justify-between">
        <div>
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
                {item.audioUrl && Array.isArray(item.audioUrl) && item.audioUrl.map((url, idx) => (
                    <div key={idx} className="space-y-1">
                        <span className="text-[11px] text-[#64748b] font-bold">Audio {idx + 1}</span>
                        <div className="flex items-center gap-2 bg-[#f8fafc] rounded-[10px] px-3 py-2">
                            <span className="text-[10px] text-[#0f172a] font-medium truncate">{url}</span>
                        </div>
                    </div>
                ))}
                {item.pdfUrl && Array.isArray(item.pdfUrl) && item.pdfUrl.map((url, idx) => (
                    <div key={idx} className="space-y-1">
                        <span className="text-[11px] text-[#64748b] font-bold">PDF Resource {idx + 1}</span>
                        <div className="flex items-center gap-2 bg-[#f8fafc] rounded-[10px] px-3 py-2">
                            <span className="text-[10px] text-[#0f172a] font-medium truncate">{url}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        {(onEdit || onDelete) && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex gap-2 justify-end">
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="px-3 py-1.5 bg-blue-50 text-[#3b82f6] hover:bg-blue-100 transition-colors text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                        <Pencil size={12} />
                        Edit
                    </button>
                )}
                {onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                        <Trash2 size={12} />
                        Delete
                    </button>
                )}
            </div>
        )}
    </div>
);

/* ─────────────────────────────────────── main page ── */
const AddCoursePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const [currentStep, setCurrentStep] = useState(1);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState('select-type'); // 'select-type' | 'item-form'
    const [showQuizFlow, setShowQuizFlow] = useState(false);
    const [showAssignmentFlow, setShowAssignmentFlow] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [courseId, setCourseId] = useState(null); // populated when draft auto-saved on Step 2
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [showCropper, setShowCropper] = useState(false);
    const [cropSrc, setCropSrc] = useState('');
    const [validationModal, setValidationModal] = useState({ isOpen: false, message: '' });
    const [isAudioUploading, setIsAudioUploading] = useState(false);
    const [isPdfUploading, setIsPdfUploading] = useState(false);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isEditMode = queryParams.get('edit') === 'true';
    const editId = queryParams.get('id');

    const thumbnailInputRef = useRef(null);

    const [certificateUploading, setCertificateUploading] = useState(false);
    const [certificatePreview, setCertificatePreview] = useState('');
    const certificateInputRef = useRef(null);
    const audioInputRef = useRef(null);
    const pdfInputRef = useRef(null);

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

    /* ── Fetch Data for Edit Mode ── */
    React.useEffect(() => {
        if (isEditMode && editId) {
            const fetchCourse = async () => {
                setIsSubmitting(true);
                try {
                    const res = await getAdminCourseById(editId);
                    const data = res.data.data;
                    setCourseForm({
                        title: data.title || '',
                        instructor: data.instructor || '',
                        batchStrength: String(data.batchStrength || ''),
                        totalLectures: String(data.totalLectures || ''),
                        certificateCriteria: String(data.certificateCriteria || ''),
                        unlockCriteria: String(data.unlockCriteria || ''),
                        duration: data.duration || '',
                        releaseDate: data.releaseDate ? data.releaseDate.split('T')[0] : '',
                        thumbnail: data.thumbnail || '',
                        certificateFile: data.certificateFile || '',
                    });

                    if (data.thumbnail) setThumbnailPreview(data.thumbnail);
                    if (data.certificateFile) setCertificatePreview(data.certificateFile);

                    // Map lectures to courseItems
                    if (data.lecturePlaylist || data.lectures) {
                        const lecs = data.lecturePlaylist || data.lectures;
                        setCourseItems(lecs.map(l => ({
                            id: l._id || l.id || Date.now() + Math.random(),
                            title: l.title,
                            type: l.type || (l.status === 'Quiz' ? 'Quiz' : 'Lecture'),
                            lectureNo: l.lectureNo,
                            videoUrl: l.videoUrl || '',
                            audioUrl: Array.isArray(l.audioUrl) ? l.audioUrl : (l.audioUrl ? [l.audioUrl] : []),
                            pdfUrl: Array.isArray(l.pdfUrl) ? l.pdfUrl : (l.pdfUrl ? [l.pdfUrl] : []),
                            quizId: l.quizId || null,
                        })));
                    }
                    setCourseId(editId);
                } catch (err) {
                    console.error('Failed to fetch course for edit:', err);
                    setSubmitError('Failed to fetch course data.');
                } finally {
                    setIsSubmitting(false);
                }
            };
            fetchCourse();
        }
    }, [isEditMode, editId]);

    /* ── Lectures State ── */
    const [courseItems, setCourseItems] = useState([]);

    /* ── Modal State ── */
    const [newItem, setNewItem] = useState({
        type: 'Lecture',
        title: '',
        videoUrl: '',
        audioUrl: [],
        pdfUrl: [],
    });

    const steps = [
        { id: 1, label: 'Course Setup' },
        { id: 2, label: 'Add Course Content' },
        { id: 3, label: 'Review & Publish' },
    ];

    const handleCourseFormChange = (field, value) => {
        setCourseForm(prev => ({ ...prev, [field]: value }));
    };

    // Step 1: file selected → open cropper
    const handleThumbnailFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset the input so the same file can be re-selected
        e.target.value = '';
        const localUrl = URL.createObjectURL(file);
        setCropSrc(localUrl);
        setShowCropper(true);
    };

    // Step 2: admin confirmed crop → upload blob to Cloudinary
    const handleCropApply = async (blob) => {
        setShowCropper(false);
        // Show local preview from the cropped blob
        const previewUrl = URL.createObjectURL(blob);
        setThumbnailPreview(previewUrl);
        setThumbnailUploading(true);
        setSubmitError('');
        try {
            const croppedFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
            const { url } = await uploadImage(croppedFile);
            handleCourseFormChange('thumbnail', url);
        } catch (err) {
            console.error('Thumbnail upload failed:', err);
            setSubmitError('Thumbnail upload failed. Please try again.');
            setThumbnailPreview('');
        } finally {
            setThumbnailUploading(false);
        }
    };

    // Step 2 (cancel): close cropper without changes
    const handleCropCancel = () => {
        setShowCropper(false);
        setCropSrc('');
    };

    // Certificate File Upload
    const handleCertificateFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        const previewUrl = URL.createObjectURL(file);
        setCertificatePreview(previewUrl);
        setCertificateUploading(true);
        setSubmitError('');

        try {
            const { url } = await uploadImage(file);
            handleCourseFormChange('certificateFile', url);
        } catch (err) {
            console.error('Certificate upload failed:', err);
            setSubmitError('Certificate upload failed. Please try again.');
            setCertificatePreview('');
        } finally {
            setCertificateUploading(false);
        }
    };

    // Audio File Upload
    const handleAudioFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        setIsAudioUploading(true);
        setSubmitError('');

        try {
            const { url } = await uploadAudio(file);
            setNewItem(prev => {
                if (prev.audioUrl?.includes(url)) return prev;
                return { ...prev, audioUrl: [...(prev.audioUrl || []), url] };
            });
        } catch (err) {
            console.error('Audio upload failed:', err);
            setSubmitError('Audio upload failed. Please try again.');
        } finally {
            setIsAudioUploading(false);
        }
    };

    // PDF File Upload
    const handlePdfFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        setIsPdfUploading(true);
        setSubmitError('');

        try {
            const { url } = await uploadPdf(file);
            setNewItem(prev => {
                if (prev.pdfUrl?.includes(url)) return prev;
                return { ...prev, pdfUrl: [...(prev.pdfUrl || []), url] };
            });
        } catch (err) {
            console.error('PDF upload failed:', err);
            setSubmitError('PDF upload failed. Please try again.');
        } finally {
            setIsPdfUploading(false);
        }
    };


    const handleSaveItem = () => {
        if (!newItem.title.trim()) return;

        if (editingIndex !== null) {
            setCourseItems(prev => prev.map((item, idx) =>
                idx === editingIndex
                    ? { ...item, ...newItem }
                    : item
            ));
            setEditingIndex(null);
        } else {
            setCourseItems(prev => [
                ...prev,
                {
                    ...newItem,
                    id: Date.now(),
                    lectureNo: prev.length + 1,
                },
            ]);
        }

        setNewItem({ type: 'Lecture', title: '', videoUrl: '', audioUrl: [], pdfUrl: [] });
        setIsAudioUploading(false);
        setIsPdfUploading(false);
        setIsModalOpen(false);
    };

    const handleCloseModal = () => {
        setNewItem({ type: 'Lecture', title: '', videoUrl: '', audioUrl: [], pdfUrl: [] });
        setEditingIndex(null);
        setIsAudioUploading(false);
        setIsPdfUploading(false);
        setIsModalOpen(false);
    };

    const handleEditItemClick = (index) => {
        const item = courseItems[index];
        setNewItem({
            type: item.type || 'Lecture',
            title: item.title || '',
            videoUrl: item.videoUrl || '',
            audioUrl: Array.isArray(item.audioUrl) ? item.audioUrl : (item.audioUrl ? [item.audioUrl] : []),
            pdfUrl: Array.isArray(item.pdfUrl) ? item.pdfUrl : (item.pdfUrl ? [item.pdfUrl] : []),
            quizId: item.quizId || null,
        });
        setEditingIndex(index);
        setModalStep('item-form');
        setIsModalOpen(true);
    };

    const handleDeleteItemClick = (index) => {
        setCourseItems(prev => {
            const updated = prev.filter((_, idx) => idx !== index);
            return updated.map((item, idx) => ({
                ...item,
                lectureNo: idx + 1
            }));
        });
    };

    const handleAddLecturesClick = () => {
        setModalStep('select-type');
        setIsModalOpen(true);
    };

    const handleContentTypeContinue = (type) => {
        if (type === 'Quiz') {
            setIsModalOpen(false);
            setShowQuizFlow(true);
        } else if (type === 'Assignment') {
            setIsModalOpen(false);
            setShowAssignmentFlow(true);
        } else {
            setNewItem(prev => ({ ...prev, type }));
            setModalStep('item-form');
        }
    };

    const handleQuizComplete = ({ _id, title }) => {
        setCourseItems(prev => [
            ...prev,
            {
                id: Date.now(),
                title,
                type: 'Quiz',
                lectureNo: prev.length + 1,
                quizId: _id,
            }
        ]);
        setShowQuizFlow(false);
    };

    const handleAssignmentComplete = (data) => {
        setCourseItems(prev => [
            ...prev,
            {
                id: Date.now(),
                title: data.title,
                type: 'Assignment',
                lectureNo: prev.length + 1,
            }
        ]);
        setShowAssignmentFlow(false);
    };

    // Auto-save course as draft to get a real courseId before quiz creation, or update existing course details
    const handleAdvanceToStep2 = async () => {
        // --- Validation ---
        if (!courseForm.title || courseForm.title.trim() === '') {
            setValidationModal({
                isOpen: true,
                message: 'Please fill in the course name.'
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        try {
            const payload = {
                title: courseForm.title,
                instructor: courseForm.instructor || '',
                addBy: user?.name || user?.firstname || 'Admin',
                batchStrength: Number(courseForm.batchStrength) || 0,
                totalLectures: Number(courseForm.totalLectures) || 0,
                certificateCriteria: Number(courseForm.certificateCriteria) || 0,
                unlockCriteria: Number(courseForm.unlockCriteria) || 0,
                duration: courseForm.duration || '',
                releaseDate: courseForm.releaseDate || new Date().toISOString(),
                thumbnail: courseForm.thumbnail || '',
                certificateFile: courseForm.certificateFile || '',
                ...(isEditMode ? {} : { status: 'draft' }),
            };

            if (courseId) {
                // If courseId is already set, update the existing course details on the backend
                await updateCourse(courseId, payload);
            } else {
                const res = await createCourse(payload);
                console.log('[AddCoursePage] DRAFT SAVE FULL RESPONSE:', res);
                const savedId = res?.data?._id || res?._id;
                console.log('[AddCoursePage] EXTRACTED courseId:', savedId);
                if (savedId) setCourseId(savedId);
            }
            setCurrentStep(2);
            // Scroll to top of the scrollable container when advancing
            document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Save course step 1 error:', err);
            setSubmitError(err?.response?.data?.message || 'Failed to save course details. Please try again.');
            // Scroll to top to show the error message
            document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── Submit to API ── */
    const handleSubmit = async (status = 'published') => {
        setIsSubmitting(true);
        setSubmitError('');
        console.log('[AddCoursePage] SUBMITTING with courseId:', courseId, 'status:', status);
        try {
            const payload = {
                id: courseId, // Ensure the draft ID is passed for upsert
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
                    audioUrl: item.audioUrl || [],
                    pdfUrl: item.pdfUrl || [],
                    ...(item.quizId && { quizId: item.quizId }),
                })),
            };

            // Always use createCourseWithLectures for both creation and updates 
            // to ensure lectures and their resources (PDF/Audio) are synced correctly.
            await createCourseWithLectures(payload);

            setSubmitSuccess(true);
            setTimeout(() => navigate('/admin-courses'), 1500);
        } catch (err) {
            console.error('Create course error:', err);
            setSubmitError(
                err?.response?.data?.message || (isEditMode ? 'Failed to update course.' : 'Failed to create course.')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ────────────────────────── render ── */
    return (
        <div className="h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center font-sans overflow-hidden font-['Public_Sans']">
            <div className={`w-full max-w-[1920px] h-full flex flex-col ${showQuizFlow || showAssignmentFlow ? '' : 'gap-4'}`}>
                <Navbar onMenuClick={toggleSidebar} hideMenu={true} />

                <div className={`flex flex-col lg:flex-row flex-1 overflow-hidden relative ${showQuizFlow || showAssignmentFlow ? '' : 'px-4 gap-4 pb-4'}`}>

                    <main className={`flex-1 ${showQuizFlow || showAssignmentFlow ? 'overflow-hidden flex flex-col' : 'overflow-y-auto no-scrollbar pb-10'}`}>
                        <div className={`flex flex-col ${showQuizFlow || showAssignmentFlow ? 'flex-1 min-h-0' : 'py-4 min-h-full'}`}>
                            {showQuizFlow ? (
                                <CreateQuiz
                                    courseId={courseId}
                                    onBackToSelection={() => {
                                        setShowQuizFlow(false);
                                        setModalStep('select-type');
                                        setIsModalOpen(true);
                                    }}
                                    onComplete={handleQuizComplete}
                                />
                            ) : showAssignmentFlow ? (
                                <CreateAssignment
                                    courseId={courseId}
                                    onBackToSelection={() => {
                                        setShowAssignmentFlow(false);
                                        setModalStep('select-type');
                                        setIsModalOpen(true);
                                    }}
                                    onComplete={handleAssignmentComplete}
                                />
                            ) : (
                                <>
                                    {/* Header Row */}
                                    <div className="px-4 py-6 md:px-10 md:py-10 flex items-center justify-between border-b border-gray-50 flex-wrap md:flex-nowrap gap-4">
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
                                            <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">{isEditMode ? 'Edit Course' : 'Add New Course'}</h2>
                                        </div>

                                        {/* Stepper */}
                                        <div className="flex items-center gap-6 w-full max-w-[900px] overflow-x-auto no-scrollbar pb-2 md:pb-0 md:ml-auto">
                                            {steps.map((step) => (
                                                <div key={step.id} className="flex-shrink-0 md:flex-1 min-w-[160px] md:min-w-0 group">
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
                                        <div className="px-4 md:px-10 py-10 flex-1 text-left">
                                            <div className="max-w-[1300px] mx-auto">
                                                <div className="mb-10">
                                                    <h3 className="text-[22px] font-bold text-[#0f172a] mb-2">Course Setup</h3>
                                                    <p className="text-[#64748b] font-medium text-[15px]">Add basic course details including title, release month, duration, batch size, and certificate rules.</p>
                                                </div>

                                                {submitError && (
                                                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 mb-6 max-w-[1300px]">
                                                        <AlertCircle size={20} />
                                                        <span className="font-bold text-[14px]">{submitError}</span>
                                                    </div>
                                                )}

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
                                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">
                                                                Certificate File URL
                                                                <span className="text-[10px] text-gray-400 font-normal ml-2">(Uploaded automatically)</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="https://example.com/certificate.png"
                                                                value={courseForm.certificateFile}
                                                                readOnly
                                                                className="w-full px-4 py-3 border border-gray-100 rounded-lg outline-none text-[14px] text-gray-500 bg-gray-50 shadow-sm cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2.5">Unlock Next Lecture (%)</label>
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
                                                            <p className="mt-2 text-[11px] text-gray-400 font-medium">% of lecture must be viewed to unlock next.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Thumbnail Upload */}
                                                <div className="mt-12">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                        {/* Course Thumbnail */}
                                                        <div>
                                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-4">Upload Course Thumbnail</label>
                                                            <input
                                                                ref={thumbnailInputRef}
                                                                type="file"
                                                                accept="image/jpg,image/jpeg,image/png,image/webp"
                                                                className="hidden"
                                                                onChange={handleThumbnailFileChange}
                                                            />
                                                            <div
                                                                onClick={() => !thumbnailUploading && thumbnailInputRef.current?.click()}
                                                                className={`w-full border-2 border-dashed rounded-[24px] transition-all duration-200 flex flex-col items-center justify-center py-10 cursor-pointer group
                                                        ${thumbnailUploading ? 'border-blue-300 bg-blue-50/30 cursor-wait' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/10'}`}
                                                            >
                                                                {thumbnailPreview && !thumbnailUploading && (
                                                                    <div className="w-full flex flex-col items-center gap-4">
                                                                        <img src={thumbnailPreview} alt="Thumbnail preview" className="max-h-52 max-w-[80%] rounded-2xl object-cover shadow-lg border border-white" />
                                                                        {courseForm.thumbnail && (
                                                                            <span className="text-[11px] text-green-600 font-bold flex items-center gap-1.5">
                                                                                <CheckCircle size={14} /> Selected
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[12px] text-[#3b82f6] font-medium">Click to change image</span>
                                                                    </div>
                                                                )}
                                                                {thumbnailUploading && (
                                                                    <div className="flex flex-col items-center gap-3">
                                                                        {thumbnailPreview && <img src={thumbnailPreview} alt="preview" className="max-h-32 rounded-xl opacity-50 object-cover" />}
                                                                        <Loader2 size={28} className="animate-spin text-[#3b82f6]" />
                                                                        <span className="text-[13px] text-[#64748b] font-medium">Uploading…</span>
                                                                    </div>
                                                                )}
                                                                {!thumbnailPreview && !thumbnailUploading && (
                                                                    <>
                                                                        <div className="w-16 h-16 bg-white rounded-[18px] shadow-lg border border-gray-50 flex items-center justify-center text-[#1e293b] mb-5 group-hover:scale-105 transition-transform duration-300">
                                                                            <ImageIcon size={30} strokeWidth={2} />
                                                                        </div>
                                                                        <button type="button" className="px-8 py-2.5 bg-[#f3f4f6] text-[#0f172a] text-[13px] font-bold rounded-xl mb-3 hover:bg-gray-200 transition-colors shadow-sm">Browse file</button>
                                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">JPG / PNG / WEBP</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Certificate Template */}
                                                        <div>
                                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-4">Upload Certificate Template <span className="text-gray-400 font-normal ml-2">(Optional)</span></label>
                                                            <input
                                                                ref={certificateInputRef}
                                                                type="file"
                                                                accept="image/jpg,image/jpeg,image/png,image/webp"
                                                                className="hidden"
                                                                onChange={handleCertificateFileChange}
                                                            />
                                                            <div
                                                                onClick={() => !certificateUploading && certificateInputRef.current?.click()}
                                                                className={`w-full border-2 border-dashed rounded-[24px] transition-all duration-200 flex flex-col items-center justify-center py-10 cursor-pointer group
                                                        ${certificateUploading ? 'border-blue-300 bg-blue-50/30 cursor-wait' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/10'}`}
                                                            >
                                                                {certificatePreview && !certificateUploading && (
                                                                    <div className="w-full flex flex-col items-center gap-4">
                                                                        <img src={certificatePreview} alt="Certificate preview" className="max-h-52 max-w-[80%] rounded-2xl object-cover shadow-lg border border-white" />
                                                                        {courseForm.certificateFile && (
                                                                            <span className="text-[11px] text-green-600 font-bold flex items-center gap-1.5">
                                                                                <CheckCircle size={14} /> Selected
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[12px] text-[#3b82f6] font-medium">Click to change template</span>
                                                                    </div>
                                                                )}
                                                                {certificateUploading && (
                                                                    <div className="flex flex-col items-center gap-3">
                                                                        {certificatePreview && <img src={certificatePreview} alt="preview" className="max-h-32 rounded-xl opacity-50 object-cover" />}
                                                                        <Loader2 size={28} className="animate-spin text-[#3b82f6]" />
                                                                        <span className="text-[13px] text-[#64748b] font-medium">Uploading…</span>
                                                                    </div>
                                                                )}
                                                                {!certificatePreview && !certificateUploading && (
                                                                    <>
                                                                        <div className="w-16 h-16 bg-white rounded-[18px] shadow-lg border border-gray-50 flex items-center justify-center text-[#1e293b] mb-5 group-hover:scale-105 transition-transform duration-300">
                                                                            <ImageIcon size={30} strokeWidth={2} />
                                                                        </div>
                                                                        <button type="button" className="px-8 py-2.5 bg-[#f3f4f6] text-[#0f172a] text-[13px] font-bold rounded-xl mb-3 hover:bg-gray-200 transition-colors shadow-sm">Browse template</button>
                                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">900x636 PNG Recommended</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STEP 2: Add Course Content ── */}
                                    {currentStep === 2 && (
                                        <div className="px-4 md:px-10 py-10 flex-1">
                                            <div className="max-w-[1400px] w-full mx-auto">
                                                <div className="mb-10">
                                                    <h3 className="text-[22px] font-bold text-[#0f172a] mb-2">Add Course Content</h3>
                                                    <p className="text-[#64748b] font-medium text-[15px]">Upload lectures, quizzes, and assignments. Each item will auto-generate numbering and structure.</p>
                                                </div>

                                                {submitError && (
                                                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 mb-6">
                                                        <AlertCircle size={20} />
                                                        <span className="font-bold text-[14px]">{submitError}</span>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-stretch justify-start gap-8 mt-4">
                                                    {courseItems.map((item, idx) => (
                                                        <LectureCard
                                                            key={item.id}
                                                            item={item}
                                                            onEdit={() => handleEditItemClick(idx)}
                                                            onDelete={() => handleDeleteItemClick(idx)}
                                                        />
                                                    ))}
                                                    <div
                                                        onClick={handleAddLecturesClick}
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
                                        <div className="px-4 md:px-10 py-10 flex-1 space-y-12">
                                            <div className="max-w-[1400px] mx-auto">

                                                {/* Success / Error Alerts */}
                                                {submitSuccess && (
                                                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 mb-6">
                                                        <CheckCircle size={20} />
                                                        <span className="font-bold text-[14px]">{isEditMode ? 'Course updated successfully!' : 'Course created successfully!'} Redirecting…</span>
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
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-10 gap-x-20">
                                                        {[
                                                            { label: 'Course Title', value: courseForm.title || '—' },
                                                            { label: 'Release Date', value: courseForm.releaseDate || '—' },
                                                            { label: 'Instructor', value: courseForm.instructor || '—' },
                                                            { label: 'Add by (read-only)', value: user?.name || user?.firstname || 'Admin' },
                                                            { label: 'Batch Strength', value: courseForm.batchStrength ? `${courseForm.batchStrength} students per batch` : '—' },
                                                            { label: 'Total Lectures', value: courseForm.totalLectures || courseItems.length || '—' },
                                                            { label: 'Course Duration', value: courseForm.duration || '—' },
                                                            { label: 'Unlock Next Lecture (%)', value: courseForm.unlockCriteria ? `${courseForm.unlockCriteria}%` : '—' },
                                                            { label: 'Certificate Eligibility (%)', value: courseForm.certificateCriteria ? `${courseForm.certificateCriteria}%` : '—' },
                                                            { label: 'Certificate File', value: courseForm.certificateFile || '—' },
                                                        ].map((field, idx) => (
                                                            <div key={idx} className="space-y-2 overflow-hidden">
                                                                <span className="text-[12px] text-[#64748b] font-medium block">{field.label}</span>
                                                                {field.label === 'Certificate File' && field.value !== '—' ? (
                                                                    <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-[15px] text-[#3b82f6] hover:underline font-bold block truncate" title={field.value}>
                                                                        {field.value}
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-[15px] text-[#0f172a] font-bold block">{field.value}</span>
                                                                )}
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
                                    <div className="px-4 md:px-10 py-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 z-20 mt-auto">
                                        <button
                                            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/admin-dashboard')}
                                            className="w-full sm:w-auto px-6 md:px-12 py-3.5 bg-[#f3f4f6] text-[#64748b] font-bold rounded hover:bg-gray-200 hover:text-[#0f172a] transition-all active:scale-95 shadow-sm"
                                        >
                                            {currentStep === 1 ? 'Cancel' : 'Back'}
                                        </button>
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            {!isEditMode && (
                                                <button
                                                    onClick={() => currentStep === 3 ? handleSubmit('draft') : null}
                                                    disabled={isSubmitting}
                                                    className="w-full sm:w-auto px-6 md:px-12 py-3.5 bg-[#f3f4f6] text-[#64748b] font-bold rounded hover:bg-gray-200 hover:text-[#0f172a] transition-all active:scale-95 shadow-sm disabled:opacity-50"
                                                >
                                                    Save as draft
                                                </button>
                                            )}
                                            <GradiantButton
                                                onClick={() => {
                                                    if (currentStep === 1) handleAdvanceToStep2();
                                                    else if (currentStep === 2) setCurrentStep(3);
                                                    else handleSubmit('published');
                                                }}
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto px-6 md:px-12 py-3.5 font-bold rounded transition-all active:scale-95 shadow-sm disabled:opacity-70"
                                            >
                                                {isSubmitting
                                                    ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving…</span>
                                                    : currentStep === 3 ? (isEditMode ? 'Edit Course' : 'Save & Publish') : 'Next'
                                                }
                                            </GradiantButton>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </main>
                </div>

                {/* ── Add Lecture Flow ── */}
                <SelectContentTypeModal
                    isOpen={isModalOpen && modalStep === 'select-type'}
                    onClose={() => setIsModalOpen(false)}
                    onContinue={handleContentTypeContinue}
                />

                {isModalOpen && modalStep === 'item-form' && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
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
                                        <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">{editingIndex !== null ? 'Edit' : 'Add New'} {newItem.type}</h2>
                                        <p className="text-[#64748b] text-[13px] font-medium leading-relaxed">Fill in the details for your {newItem.type.toLowerCase()}.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                                <div className="space-y-6">
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
                                        <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Video URL <span className="text-gray-400 font-normal text-[11px]">(YouTube)</span></label>
                                        <input
                                            type="text"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={newItem.videoUrl}
                                            onChange={e => setNewItem({ ...newItem, videoUrl: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>

                                    {/* Audio + PDF */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Audio Upload */}
                                        <div className="flex flex-col min-h-0">
                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Audio Files <span className="text-gray-400 font-normal text-[11px]">(Multiple)</span></label>
                                            <div
                                                onClick={() => audioInputRef.current?.click()}
                                                className={`relative w-full px-4 py-3 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${newItem.audioUrl?.length > 0 ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 hover:border-blue-400 bg-gray-50'}`}
                                            >
                                                {isAudioUploading ? (
                                                    <div className="flex flex-col items-center gap-2 py-1">
                                                        <Loader2 size={20} className="text-[#8B5CF6] animate-spin" />
                                                        <span className="text-[12px] font-medium text-[#8B5CF6]">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 py-1">
                                                        <Upload size={20} className="text-gray-400" />
                                                        <span className="text-[12px] font-medium text-gray-500">Add Audio File</span>
                                                    </div>
                                                )}
                                                <input
                                                    ref={audioInputRef}
                                                    type="file"
                                                    accept="audio/*"
                                                    onChange={handleAudioFileChange}
                                                    className="hidden"
                                                />
                                            </div>

                                            {/* List of Audios */}
                                            {newItem.audioUrl?.length > 0 && (
                                                <div className="mt-3 space-y-2 max-h-[130px] overflow-y-auto no-scrollbar pr-1 border border-transparent">
                                                    {newItem.audioUrl.map((url, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                                                <span className="text-[11px] font-medium text-gray-600 truncate">Audio {idx + 1}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setNewItem({ ...newItem, audioUrl: newItem.audioUrl.filter((_, i) => i !== idx) })}
                                                                className="text-red-400 hover:text-red-600 p-1"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* PDF Upload */}
                                        <div className="flex flex-col min-h-0">
                                            <label className="block text-[14px] font-bold text-[#0f172a] mb-2">Resource Files <span className="text-gray-400 font-normal text-[11px]">(Multiple PDFs)</span></label>
                                            <div
                                                onClick={() => pdfInputRef.current?.click()}
                                                className={`relative w-full px-4 py-3 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${newItem.pdfUrl?.length > 0 ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 hover:border-blue-400 bg-gray-50'}`}
                                            >
                                                {isPdfUploading ? (
                                                    <div className="flex flex-col items-center gap-2 py-1">
                                                        <Loader2 size={20} className="text-[#8B5CF6] animate-spin" />
                                                        <span className="text-[12px] font-medium text-[#8B5CF6]">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 py-1">
                                                        <Upload size={20} className="text-gray-400" />
                                                        <span className="text-[12px] font-medium text-gray-500">Add PDF File</span>
                                                    </div>
                                                )}
                                                <input
                                                    ref={pdfInputRef}
                                                    type="file"
                                                    accept=".pdf,application/pdf"
                                                    onChange={handlePdfFileChange}
                                                    className="hidden"
                                                />
                                            </div>

                                            {/* List of PDFs */}
                                            {newItem.pdfUrl?.length > 0 && (
                                                <div className="mt-3 space-y-2 max-h-[130px] overflow-y-auto no-scrollbar pr-1 border border-transparent">
                                                    {newItem.pdfUrl.map((url, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                                                <span className="text-[11px] font-medium text-gray-600 truncate">PDF {idx + 1}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setNewItem({ ...newItem, pdfUrl: newItem.pdfUrl.filter((_, i) => i !== idx) })}
                                                                className="text-red-400 hover:text-red-600 p-1"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="mt-8 flex justify-between items-center bg-white gap-4">
                                    <button
                                        onClick={handleCloseModal}
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

                {/* Thumbnail Crop Modal */}
                {showCropper && cropSrc && (
                    <ThumbnailCropper
                        imageSrc={cropSrc}
                        onApply={handleCropApply}
                        onCancel={handleCropCancel}
                    />
                )}

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
                                    className="mt-8 w-full py-3.5 bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-[0.98]"
                                >
                                    Got it, thanks!
                                </button>
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
