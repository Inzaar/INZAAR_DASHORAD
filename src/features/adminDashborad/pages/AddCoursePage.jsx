import React, { useState, useRef } from 'react';
import { Upload, ChevronDown, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Trash2, Pencil } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { createCourseWithLectures, createCourse, uploadImage, uploadAudio, uploadVideo, uploadPdf, getAdminCourseById, updateCourse } from '@/api/course';
import { useAuth } from '@/context/AuthContext';
import ThumbnailCropper from '../components/ThumbnailCropper';
import SelectContentTypeModal from '../components/SelectContentTypeModal';
import CreateQuiz from '../components/CreateQuiz';

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
    const [isVideoUploading, setIsVideoUploading] = useState(false);
    const [isModalVideoHovered, setIsModalVideoHovered] = useState(false);
    const [isModalAudioHovered, setIsModalAudioHovered] = useState(false);
    const [isModalPdfHovered, setIsModalPdfHovered] = useState(false);
    const videoInputRef = useRef(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isEditMode = queryParams.get('edit') === 'true';
    const editId = queryParams.get('id');

    const thumbnailInputRef = useRef(null);
    const [isThumbnailHovered, setIsThumbnailHovered] = useState(false);

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
    
    // Video File Upload
    const handleVideoFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        setIsVideoUploading(true);
        setSubmitError('');

        try {
            const { url } = await uploadVideo(file);
            setNewItem(prev => ({ ...prev, videoUrl: url }));
        } catch (err) {
            console.error('Video upload failed:', err);
            setSubmitError('Video upload failed. Please try again.');
        } finally {
            setIsVideoUploading(false);
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
        // QA and Lecture both open the video-form flow
        setNewItem(prev => ({ ...prev, type }));
        setModalStep('item-form');
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
        } catch (err) {
            console.error('Save course step 1 error:', err);
            setSubmitError(err?.response?.data?.message || 'Failed to save course details. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraftClick = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const payload = {
                title: courseForm.title || 'Untitled Draft',
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
                status: 'draft',
            };

            if (courseId) {
                await updateCourse(courseId, payload);
            } else {
                const res = await createCourse(payload);
                const savedId = res?.data?._id || res?._id;
                if (savedId) setCourseId(savedId);
            }
            setSubmitSuccess(true);
            setTimeout(() => navigate('/admin-courses'), 1000);
        } catch (err) {
            console.error('Draft save failed:', err);
            setSubmitError(err?.response?.data?.message || 'Failed to save draft.');
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
        <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center font-sans overflow-hidden font-['Public_Sans']">
            <div className="w-full max-w-[1920px] min-h-screen max-h-[1680px] flex flex-col gap-4">
                <Navbar onMenuClick={toggleSidebar} hideMenu={true} />

                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>
                    <div className="flex-1 flex flex-col overflow-hidden relative bg-transparent">
                        <main className="flex-1 overflow-y-auto no-scrollbar pb-0 relative">
                            <div className="py-4">
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
                        ) : (
                            <>
                                {/* Header Row */}
                                <div className="px-8 py-5 flex flex-col md:flex-row items-center justify-between border-b border-gray-100 gap-4 bg-white">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 bg-[#EEF2FF] rounded-xl flex items-center justify-center shadow-sm">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                <line x1="12" y1="22.08" x2="12" y2="12" />
                                            </svg>
                                        </div>
                                        <h2 className="text-[18px] font-bold text-gray-800 tracking-tight">
                                            {isEditMode ? 'Edit Course' : 'Add New Course'}
                                        </h2>
                                    </div>

                                    {/* Stepper */}
                                    <div className="flex items-center w-full md:w-auto max-w-[850px] gap-6 md:ml-auto">
                                        {steps.map((step) => {
                                            const isActive = currentStep === step.id;
                                            const isCompleted = currentStep > step.id;
                                            return (
                                                <div key={step.id} className="flex-1 min-w-[200px] md:min-w-[240px] flex flex-col">
                                                    {/* Top Bar Indicator */}
                                                    <div className={`h-[3px] w-full transition-all duration-300 ${isActive || isCompleted ? 'bg-[#3758EE]' : 'bg-gray-200'}`} />
                                                    
                                                    {/* Circle + Label */}
                                                    <div className="mt-3 flex items-center justify-center gap-2">
                                                        <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive || isCompleted ? 'border-[#3758EE]' : 'border-gray-300'}`}>
                                                            {(isActive || isCompleted) && <div className="w-2 h-2 bg-[#3758EE] rounded-full" />}
                                                        </div>
                                                        <span className={`text-[12px] font-bold tracking-wide whitespace-nowrap transition-all duration-300 ${isActive || isCompleted ? 'text-[#3758EE]' : 'text-gray-400'}`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ── STEP 1: Course Setup ── */}
                                {currentStep === 1 && (
                                    <div className="px-8 md:px-12 py-10 pb-32 flex-1 text-left bg-white">
                                        <div className="max-w-[1300px] mx-auto">
                                            <div className="mb-10">
                                                <h3 className="text-[20px] font-bold text-gray-800 mb-1">Course Setup</h3>
                                                <p className="text-gray-400 font-medium text-[13px]">Add basic course details including title, release month, duration, batch size, and certificate rules.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                                                {/* Left Column */}
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Course Title</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter title"
                                                            value={courseForm.title}
                                                            onChange={e => handleCourseFormChange('title', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Instructor</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter name"
                                                            value={courseForm.instructor}
                                                            onChange={e => handleCourseFormChange('instructor', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Block Strength</label>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value="10 students per block"
                                                            className="w-full px-4 py-2.5 border border-gray-150 rounded-lg outline-none text-[14px] text-gray-400 bg-gray-50/50 shadow-sm cursor-not-allowed"
                                                        />
                                                        <p className="mt-2 text-[11px] text-gray-400 font-medium">If 100 students enroll &rarr; system auto-creates 10 block.</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Certificate Eligibility (%)</label>
                                                        <input
                                                            type="number"
                                                            placeholder="Enter"
                                                            value={courseForm.certificateCriteria}
                                                            onChange={e => handleCourseFormChange('certificateCriteria', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] shadow-sm placeholder:text-gray-300"
                                                        />
                                                        <p className="mt-2 text-[11px] text-gray-400 font-medium leading-tight">How much course progress is required to unlock certificate</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Course Duration</label>
                                                        <div className="relative group">
                                                            <select
                                                                value={courseForm.duration}
                                                                onChange={e => handleCourseFormChange('duration', e.target.value)}
                                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-600 appearance-none bg-white shadow-sm cursor-pointer"
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
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Release Date</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="date"
                                                                value={courseForm.releaseDate}
                                                                onChange={e => handleCourseFormChange('releaseDate', e.target.value)}
                                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-600 bg-white shadow-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">
                                                            Add by <span className="text-gray-400 font-normal text-[11px]">(read-only)</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            placeholder="Select"
                                                            value={user?.name || user?.firstname || 'Select'}
                                                            className="w-full px-4 py-2.5 border border-gray-150 rounded-lg outline-none text-[14px] text-gray-400 bg-gray-50/50 shadow-sm cursor-not-allowed"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Total Lectures</label>
                                                        <input
                                                            type="number"
                                                            placeholder="Enter total lectures"
                                                            value={courseForm.totalLectures}
                                                            onChange={e => handleCourseFormChange('totalLectures', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                                        />
                                                        <p className="mt-2 text-[11px] text-gray-400 font-medium">Example 25 Lectures</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Upload Certificate</label>
                                                        <input
                                                            ref={certificateInputRef}
                                                            type="file"
                                                            accept="image/jpg,image/jpeg,image/png,image/webp"
                                                            className="hidden"
                                                            onChange={handleCertificateFileChange}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => !certificateUploading && certificateInputRef.current?.click()}
                                                            className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                                                        >
                                                            <span className="text-[14px] text-gray-400 font-medium truncate max-w-[85%]">
                                                                {certificateUploading ? "Uploading..." : (courseForm.certificateFile ? (courseForm.certificateFile.split('/').pop() || "certificate.png") : "Browse file")}
                                                            </span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                                                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Unlock Next Course (%)</label>
                                                        <div className="relative group">
                                                            <select
                                                                value={courseForm.unlockCriteria}
                                                                onChange={e => handleCourseFormChange('unlockCriteria', e.target.value)}
                                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-600 appearance-none bg-white shadow-sm cursor-pointer"
                                                            >
                                                                <option value="">Enter</option>
                                                                {UNLOCK_PCT.map(p => <option key={p} value={p}>{p}%</option>)}
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                        </div>
                                                        <p className="mt-2 text-[11px] text-gray-400 font-medium">60% of this course must be viewed.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Thumbnail Upload */}
                                            <div className="mt-10">
                                                <label className="block text-[13px] font-bold text-gray-700 mb-3">Upload Course Thumbnail</label>
                                                <input
                                                    ref={thumbnailInputRef}
                                                    type="file"
                                                    accept="image/jpg,image/jpeg,image/png,image/webp"
                                                    className="hidden"
                                                    onChange={handleThumbnailFileChange}
                                                />
                                                <div
                                                    onClick={() => !thumbnailUploading && thumbnailInputRef.current?.click()}
                                                    onMouseEnter={() => setIsThumbnailHovered(true)}
                                                    onMouseLeave={() => setIsThumbnailHovered(false)}
                                                    className={`w-full transition-all duration-200 flex flex-col items-center justify-center py-10 cursor-pointer group bg-white
                                                    ${thumbnailUploading ? 'cursor-wait bg-indigo-50/20' : 'hover:bg-gray-50/30'}`}
                                                    style={{
                                                        backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='${isThumbnailHovered ? '%23111827' : '%239CA3AF'}' stroke-width='2' stroke-dasharray='10%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                                                        borderRadius: '12px'
                                                    }}
                                                >
                                                    {thumbnailPreview && !thumbnailUploading ? (
                                                        <div className="w-full flex flex-col items-center gap-3">
                                                            <img src={thumbnailPreview} alt="Thumbnail preview" className="max-h-52 max-w-[80%] rounded-xl object-cover shadow-md border border-white" />
                                                            {courseForm.thumbnail && (
                                                                <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                                                                    <CheckCircle size={12} /> Uploaded Successfully
                                                                </span>
                                                            )}
                                                            <span className="text-[12px] text-indigo-600 font-bold hover:underline">Click to change image</span>
                                                        </div>
                                                    ) : thumbnailUploading ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Loader2 size={24} className="animate-spin text-indigo-600" />
                                                            <span className="text-[12px] text-gray-500 font-bold">Uploading thumbnail...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black mb-4 transition-transform group-hover:scale-105 duration-300">
                                                                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                                                <path d="M12 12v9" />
                                                                <path d="m16 16-4-4-4 4" />
                                                            </svg>
                                                            <button
                                                                type="button"
                                                                className="px-6 py-2 bg-gray-100 text-black text-[13px] font-normal rounded-lg mb-2 hover:bg-gray-200 transition-colors shadow-sm"
                                                            >
                                                                Browse file
                                                            </button>
                                                            <span className="text-[11px] text-gray-400 font-medium">MP4 / MOV</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 2: Add Course Content ── */}
                                {currentStep === 2 && (
                                    <div className="px-4 md:px-10 py-10 pb-32 flex-1">
                                        <div className="max-w-[1400px] w-full mx-auto">
                                            <div className="mb-10">
                                                <h3 className="text-[22px] font-bold text-[#0f172a] mb-2">Add Course Content</h3>
                                                <p className="text-[#64748b] font-medium text-[15px]">Upload lectures, quizzes, and assignments. Each item will auto-generate numbering and structure.</p>
                                            </div>

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
                                    <div className="px-4 md:px-10 py-10 pb-32 flex-1 space-y-12">
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
                                                        <span className="text-[12px] text-[#64748b] font-medium block mb-4">Upload Course Thumbnail</span>
                                                        <div
                                                            className="w-full py-10 flex items-center justify-center bg-white"
                                                            style={{
                                                                backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='20' ry='20' stroke='%239CA3AF' stroke-width='2.5' stroke-dasharray='10%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                                                                borderRadius: '20px'
                                                            }}
                                                        >
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

                            </>
                        )}
                        </div>
                    </main>

                    {/* Footer Actions */}
                    {!showQuizFlow && (
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 py-5 px-6 md:px-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 z-40 shadow-[0_-6px_20px_rgba(0,0,0,0.04)]">
                            <button
                                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/admin-dashboard')}
                                className="w-full sm:w-auto px-6 md:px-12 py-3 bg-[#F3F4F6] text-gray-500 font-bold rounded hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-95 shadow-sm text-[14px]"
                            >
                                {currentStep === 1 ? 'Cancel' : 'Back'}
                            </button>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                {!isEditMode && (
                                    <button
                                        onClick={handleSaveDraftClick}
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto px-6 md:px-12 py-3 bg-[#F3F4F6] text-[#64748b] font-bold rounded hover:bg-gray-200 hover:text-[#0f172a] transition-all active:scale-95 shadow-sm disabled:opacity-50 text-[14px]"
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
                                    className="w-full sm:w-auto px-6 md:px-12 py-3 font-bold rounded transition-all active:scale-95 shadow-sm disabled:opacity-70 text-[14px]"
                                >
                                    {isSubmitting
                                        ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving…</span>
                                        : currentStep === 3 ? (isEditMode ? 'Edit Course' : 'Save & Publish') : 'Next'
                                    }
                                </GradiantButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>

                {/* ── Add Lecture Flow ── */}
                <SelectContentTypeModal
                    isOpen={isModalOpen && modalStep === 'select-type'}
                    onClose={() => setIsModalOpen(false)}
                    onContinue={handleContentTypeContinue}
                />

                {isModalOpen && modalStep === 'item-form' && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
                        <div className="bg-white w-full max-w-[850px] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
                            <div className="px-8 pt-8 pb-4 bg-white">
                                <div className="flex items-center gap-4 mb-1">
                                    <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                            <line x1="12" y1="22.08" x2="12" y2="12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-[20px] font-bold text-gray-800 tracking-tight">
                                            {editingIndex !== null ? 'Edit' : 'Add New'} Course Item
                                        </h2>
                                        <p className="text-gray-400 text-[13px] font-medium leading-relaxed">
                                            Select the type of content you want to add and upload the required files.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8 max-h-[75vh] overflow-y-auto no-scrollbar">
                                <div className="space-y-6">
                                    {/* Row 1: Lecture name and Lecture Number */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Lecture name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter title"
                                                value={newItem.title}
                                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Lecture Number<span className="text-gray-400 font-normal text-[11px]">(Auto-Generated)</span></label>
                                            <input
                                                type="text"
                                                readOnly
                                                value={newItem.lectureNo || (editingIndex !== null ? (editingIndex + 1) : (courseItems.length + 1))}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none text-[14px] text-gray-400 bg-gray-50/50 shadow-sm cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Upload Video Lecture Section */}
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-700 mb-3">Upload Video Lecture</label>
                                        <input
                                            ref={videoInputRef}
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={handleVideoFileChange}
                                        />
                                        <div
                                            onClick={() => !isVideoUploading && videoInputRef.current?.click()}
                                            onMouseEnter={() => setIsModalVideoHovered(true)}
                                            onMouseLeave={() => setIsModalVideoHovered(false)}
                                            className={`w-full transition-all duration-200 flex flex-col items-center justify-center py-8 cursor-pointer group bg-white
                                            ${isVideoUploading ? 'cursor-wait bg-indigo-50/20' : 'hover:bg-gray-50/30'}`}
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='${isModalVideoHovered ? '%23111827' : '%239CA3AF'}' stroke-width='2' stroke-dasharray='10%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                                                borderRadius: '12px'
                                            }}
                                        >
                                            {newItem.videoUrl && !isVideoUploading ? (
                                                <div className="w-full flex flex-col items-center gap-3 px-4">
                                                    <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                                                        <CheckCircle size={12} /> Video Attached Successfully
                                                    </span>
                                                    <span className="text-[12px] text-indigo-600 font-bold hover:underline truncate max-w-[80%]">{newItem.videoUrl.split('/').pop()}</span>
                                                    <span className="text-[11px] text-gray-400 font-medium">Click to change video</span>
                                                </div>
                                            ) : isVideoUploading ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 size={24} className="animate-spin text-indigo-600" />
                                                    <span className="text-[12px] text-gray-500 font-bold">Uploading video...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black mb-3 transition-transform group-hover:scale-105 duration-300">
                                                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                                        <path d="M12 12v9" />
                                                        <path d="m16 16-4-4-4 4" />
                                                    </svg>
                                                    <button
                                                        type="button"
                                                        className="px-6 py-2 bg-gray-100 text-black text-[13px] font-normal rounded-lg mb-2 hover:bg-gray-200 transition-colors shadow-sm"
                                                    >
                                                        Browse file
                                                    </button>
                                                    <span className="text-[11px] text-gray-400 font-medium">MP4 / MOV</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Or Upload URL */}
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Or Upload URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://youtube.com"
                                            value={newItem.videoUrl}
                                            onChange={e => setNewItem({ ...newItem, videoUrl: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>

                                    {/* Audio and PDF Optional Section */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Optional Audio Upload */}
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 mb-3">Optional Audio Upload</label>
                                            <input
                                                ref={audioInputRef}
                                                type="file"
                                                accept="audio/*"
                                                className="hidden"
                                                onChange={handleAudioFileChange}
                                            />
                                            <div
                                                onClick={() => !isAudioUploading && audioInputRef.current?.click()}
                                                onMouseEnter={() => setIsModalAudioHovered(true)}
                                                onMouseLeave={() => setIsModalAudioHovered(false)}
                                                className={`w-full transition-all duration-200 flex flex-col items-center justify-center py-6 cursor-pointer group bg-white
                                                ${isAudioUploading ? 'cursor-wait bg-indigo-50/20' : 'hover:bg-gray-50/30'}`}
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='${isModalAudioHovered ? '%23111827' : '%239CA3AF'}' stroke-width='2' stroke-dasharray='10%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                {isAudioUploading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 size={20} className="animate-spin text-indigo-600" />
                                                        <span className="text-[12px] text-gray-500 font-medium">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black mb-2 transition-transform group-hover:scale-105 duration-300">
                                                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                                            <path d="M12 12v9" />
                                                            <path d="m16 16-4-4-4 4" />
                                                        </svg>
                                                        <button
                                                            type="button"
                                                            className="px-4 py-1.5 bg-gray-100 text-black text-[12px] font-normal rounded-lg mb-1 hover:bg-gray-200 transition-colors shadow-sm"
                                                        >
                                                            Browse file
                                                        </button>
                                                        <span className="text-[10px] text-gray-400 font-medium">MP3 / WAV</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* List of Audios */}
                                            {newItem.audioUrl?.length > 0 && (
                                                <div className="mt-2 space-y-2 max-h-[100px] overflow-y-auto no-scrollbar">
                                                    {newItem.audioUrl.map((url, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-1.5 shadow-sm">
                                                            <span className="text-[11px] font-medium text-gray-600 truncate max-w-[80%]">Audio {idx + 1}</span>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setNewItem({...newItem, audioUrl: newItem.audioUrl.filter((_, i) => i !== idx)});
                                                                }}
                                                                className="text-red-400 hover:text-red-600 p-1"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-3">
                                                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Or Upload URL</label>
                                                <input
                                                    type="text"
                                                    placeholder="https://youtube.com"
                                                    value={newItem.audioUrl && newItem.audioUrl.length > 0 && !newItem.audioUrl[0].includes('cloudinary') ? newItem.audioUrl[0] : ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setNewItem(prev => ({
                                                            ...prev,
                                                            audioUrl: val ? [val] : []
                                                        }));
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[13px] placeholder:text-gray-300 shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Optional PDF/Resource Upload */}
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 mb-3">Optional PDF Upload</label>
                                            <input
                                                ref={pdfInputRef}
                                                type="file"
                                                accept=".pdf,application/pdf"
                                                className="hidden"
                                                onChange={handlePdfFileChange}
                                            />
                                            <div
                                                onClick={() => !isPdfUploading && pdfInputRef.current?.click()}
                                                onMouseEnter={() => setIsModalPdfHovered(true)}
                                                onMouseLeave={() => setIsModalPdfHovered(false)}
                                                className={`w-full transition-all duration-200 flex flex-col items-center justify-center py-6 cursor-pointer group bg-white
                                                ${isPdfUploading ? 'cursor-wait bg-indigo-50/20' : 'hover:bg-gray-50/30'}`}
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='${isModalPdfHovered ? '%23111827' : '%239CA3AF'}' stroke-width='2' stroke-dasharray='10%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                {isPdfUploading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 size={20} className="animate-spin text-indigo-600" />
                                                        <span className="text-[12px] text-gray-500 font-medium">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black mb-2 transition-transform group-hover:scale-105 duration-300">
                                                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                                            <path d="M12 12v9" />
                                                            <path d="m16 16-4-4-4 4" />
                                                        </svg>
                                                        <button
                                                            type="button"
                                                            className="px-4 py-1.5 bg-gray-100 text-black text-[12px] font-normal rounded-lg mb-1 hover:bg-gray-200 transition-colors shadow-sm"
                                                        >
                                                            Browse file
                                                        </button>
                                                        <span className="text-[10px] text-gray-400 font-medium">MP3 / WAV</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* List of PDFs */}
                                            {newItem.pdfUrl?.length > 0 && (
                                                <div className="mt-2 space-y-2 max-h-[100px] overflow-y-auto no-scrollbar">
                                                    {newItem.pdfUrl.map((url, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-1.5 shadow-sm">
                                                            <span className="text-[11px] font-medium text-gray-600 truncate max-w-[80%]">PDF {idx + 1}</span>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setNewItem({...newItem, pdfUrl: newItem.pdfUrl.filter((_, i) => i !== idx)});
                                                                }}
                                                                className="text-red-400 hover:text-red-600 p-1"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-3">
                                                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Or Upload URL</label>
                                                <input
                                                    type="text"
                                                    placeholder="https://youtube.com"
                                                    value={newItem.pdfUrl && newItem.pdfUrl.length > 0 && !newItem.pdfUrl[0].includes('cloudinary') ? newItem.pdfUrl[0] : ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setNewItem(prev => ({
                                                            ...prev,
                                                            pdfUrl: val ? [val] : []
                                                        }));
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[13px] placeholder:text-gray-300 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="mt-8 flex justify-between items-center bg-white gap-4">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-12 py-3 bg-[#f3f4f6] text-[#0f172a] font-normal rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-sm text-[14px]"
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
