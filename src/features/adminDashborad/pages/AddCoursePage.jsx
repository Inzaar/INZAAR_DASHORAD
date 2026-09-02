import React, { useState, useRef } from 'react';
import { Upload, ChevronDown, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Trash2, Pencil, FileText, HelpCircle, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { createCourseWithLectures, createCourse, uploadImage, uploadAudio, uploadVideo, uploadPdf, getAdminCourseById, updateCourse } from '@/api/course';
import { useAuth } from '@/context/AuthContext';
import ThumbnailCropper from '../components/ThumbnailCropper';
import SelectContentTypeModal from '../components/SelectContentTypeModal';
import CreateQuiz from '../components/CreateQuiz';
import CreateAssignment from '../components/CreateAssignment';

/* ─────────────────────────────────────── helpers ── */
const DURATIONS = ['8 Weeks', '12 Weeks', '24 Weeks', '52 Weeks'];
const UNLOCK_PCT = ['20', '40', '50', '60', '70', '80', '90', '100'];

/* ─────────────────────────────────────── LectureCard ── */
const LectureCard = ({ item, courseThumbnail, onEdit, onDelete, onDeleteResource, onViewAll }) => {
    if (item.type === 'Assignment') {
        return (
            <div className="w-full h-full bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden font-sans flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-lg">
                <div>
                    <div className="relative aspect-[16/10] bg-[#fff7ed] flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center">
                            <FileText className="text-orange-500" size={24} />
                        </div>
                    </div>
                    <div className="p-5 space-y-2">
                        <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                            ASSIGNMENT - {String(item.lectureNo || item.number || 1).padStart(2, '0')}
                        </div>
                        <h4 className="text-[16px] font-bold text-[#0f172a] leading-tight truncate">{item.title || 'Untitled Assignment'}</h4>
                        <p className="text-[12px] text-gray-400 font-medium leading-snug">
                            {item.acceptedTypes ? item.acceptedTypes.join(', ') : 'PDF, DOC / DOCX, Image (JPG/PNG)'} · {item.setDueDate ? (item.maxDays || '1-Day') : 'No due date'}
                        </p>
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
    }

    if (item.type === 'Quiz') {
        return (
            <div className="w-full h-full bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden font-sans flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-lg">
                <div>
                    <div className="relative aspect-[16/10] bg-[#ecfdf5] flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center">
                            <HelpCircle className="text-emerald-500" size={24} />
                        </div>
                    </div>
                    <div className="p-5 space-y-2">
                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                            QUIZ - {String(item.lectureNo || item.number || 1).padStart(2, '0')}
                        </div>
                        <h4 className="text-[16px] font-bold text-[#0f172a] leading-tight truncate">{item.title || 'Untitled Quiz'}</h4>
                        <p className="text-[12px] text-gray-400 font-medium leading-snug">
                            {item.questions?.length || 3} questions · {item.timeLimitInMinutes || 15} min
                        </p>
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
    }
    const audios = Array.isArray(item.audioUrl) ? item.audioUrl : (item.audioUrl ? [item.audioUrl] : []);
    const pdfs = Array.isArray(item.pdfUrl) ? item.pdfUrl : (item.pdfUrl ? [item.pdfUrl] : []);
    const totalResources = audios.length + pdfs.length;
    const showResourcesViewAll = totalResources > 2;

    const quizzes = item.quizzes || [];
    const assignments = item.assignments || [];
    const totalActivities = quizzes.length + assignments.length;
    const showActivitiesViewAll = totalActivities > 2;

    // Grab first 2 resources total
    const displayResources = [];
    let count = 0;
    const extractName = (urlStr, fallback) => {
        try {
            let u = urlStr;
            if (u.includes('?')) u = u.split('?')[0];
            if (u.endsWith('/')) u = u.slice(0, -1);
            const parts = u.split('/');
            let lastPart = parts[parts.length - 1];
            if (lastPart === 'view' && parts.length > 2) {
                lastPart = parts[parts.length - 2]; // Google drive links
            }
            if (lastPart && lastPart.length > 0) return decodeURIComponent(lastPart);
        } catch (e) { }
        return fallback;
    };
    for (let i = 0; i < audios.length && count < 2; i++) {
        const a = audios[i];
        const isObj = typeof a === 'object' && a !== null;
        let title = isObj ? a.title : `Audio ${i + 1}`;
        let url = isObj ? a.url : a;
        if (!isObj || title.startsWith('Audio ')) title = extractName(url, title);
        displayResources.push({ type: 'audio', title, url, idx: i });
        count++;
    }
    for (let i = 0; i < pdfs.length && count < 2; i++) {
        const p = pdfs[i];
        const isObj = typeof p === 'object' && p !== null;
        let title = isObj ? p.title : `PDF ${i + 1}`;
        let url = isObj ? p.url : p;
        if (!isObj || title.startsWith('PDF ')) title = extractName(url, title);
        displayResources.push({ type: 'pdf', title, url, idx: i });
        count++;
    }

    // Grab first 2 activities total
    const displayActivities = [];
    let actCount = 0;
    for (let i = 0; i < quizzes.length && actCount < 2; i++) {
        displayActivities.push({ type: 'quiz', data: quizzes[i], idx: i });
        actCount++;
    }
    for (let i = 0; i < assignments.length && actCount < 2; i++) {
        displayActivities.push({ type: 'assignment', data: assignments[i], idx: i });
        actCount++;
    }

    return (
        <div className="w-full h-full bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden font-sans flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div>
                <div className="relative aspect-[16/10] bg-gray-100 group overflow-hidden">
                    <img
                        src={courseThumbnail || item.thumbnail || "https://images.unsplash.com/photo-1585829365234-781f353c3dce?auto=format&fit=crop&q=80&w=400"}
                        alt="Course Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/40">
                            <img src="https://ui-avatars.com/api/?name=Abu+Yahya&background=random" alt="User" />
                        </div>
                        <span className="text-white text-[12px] font-bold shadow-sm">Instructor</span>
                    </div>
                    <div className="absolute bottom-3 left-3 text-white text-[12px] font-bold">
                        {item.type || 'Lecture'}-{String(item.lectureNo || item.number || 1).padStart(2, '0')}
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
                            <div className="flex items-center gap-2 bg-[#f8fafc] rounded-[10px] px-3 py-2 group/item">
                                <span className="text-[10px] text-[#0f172a] font-medium truncate flex-1">{item.videoUrl}</span>
                            </div>
                        </div>
                    )}

                    {displayResources.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-[#64748b] font-bold uppercase tracking-wider">Resources</span>
                            </div>
                            {displayResources.map((res, i) => (
                                <div key={i} className="flex flex-col gap-0.5 bg-[#f8fafc] rounded-[10px] px-3 py-2 group/item relative pr-10">
                                    <span className="text-[11px] font-bold text-gray-700 truncate pr-4">{res.title}</span>
                                    <span className="text-[10px] text-[#0f172a] font-medium truncate flex-1 opacity-70">
                                        {res.url}
                                    </span>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity flex gap-1">
                                        <button type="button" onClick={() => onDeleteResource && onDeleteResource(item.id || item._id, res.type, res.idx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Activities moved to LectureActivitiesCard */}

            {(onEdit || onDelete || showResourcesViewAll) && (
                <div className="px-4 pb-4 pt-3 border-t border-gray-50 flex gap-2 justify-end bg-white items-center">
                    {showResourcesViewAll && (
                        <button
                            type="button"
                            onClick={() => onViewAll && onViewAll(item, 'resources')}
                            className="text-[11px] font-bold text-[#4f46e5] hover:underline px-2"
                        >
                            + View All {totalResources} Resources
                        </button>
                    )}
                    {onEdit && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="px-3 py-1.5 bg-blue-50 text-[#3b82f6] hover:bg-blue-100 transition-colors text-xs font-bold rounded-lg flex items-center gap-1"
                        >
                            <Pencil size={12} />
                            Edit Lecture
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
};

/* ─────────────────────────────────────── LectureActivitiesCard ── */
const LectureActivitiesCard = ({ item, onEditQuiz, onDeleteQuiz, onEditAssignment, onDeleteAssignment, onViewAll }) => {
    const quizzes = item.quizzes || [];
    const assignments = item.assignments || [];
    const totalActivities = quizzes.length + assignments.length;

    // Grab exactly 2 activities total (1 of each if both exist, otherwise 2 of same)
    const displayActivities = [];
    if (quizzes.length > 0 && assignments.length > 0) {
        displayActivities.push({ type: 'quiz', data: quizzes[0], idx: 0 });
        displayActivities.push({ type: 'assignment', data: assignments[0], idx: 0 });
    } else if (quizzes.length > 0) {
        for (let i = 0; i < Math.min(2, quizzes.length); i++) {
            displayActivities.push({ type: 'quiz', data: quizzes[i], idx: i });
        }
    } else if (assignments.length > 0) {
        for (let i = 0; i < Math.min(2, assignments.length); i++) {
            displayActivities.push({ type: 'assignment', data: assignments[i], idx: i });
        }
    }

    const showActivitiesViewAll = totalActivities > displayActivities.length; // Show more if not all fit

    if (displayActivities.length === 0) return null;

    return (
        <div className="w-full h-full bg-[#f8fafc] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-indigo-50 overflow-hidden font-sans flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="px-5 py-4 border-b border-indigo-100 flex items-center gap-3 bg-white">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                    <HelpCircle size={20} />
                </div>
                <div>
                    <h4 className="text-[15px] font-bold text-[#0f172a] leading-tight">Activities</h4>
                    <p className="text-[11px] text-[#64748b] font-medium">For: {item.title || 'Lecture'}</p>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-3">
                {displayActivities.map((act, i) => {
                    if (act.type === 'quiz') {
                        const quiz = act.data;
                        return (
                            <div key={`q-${quiz._id || act.idx}`} className={`bg-white border border-purple-100 text-purple-700 p-3 rounded-xl shadow-sm flex flex-col gap-2 group/item ${displayActivities.length === 1 ? 'h-[50%]' : 'flex-1'}`}>
                                <div className="flex items-center gap-2">
                                    <HelpCircle size={16} className="flex-shrink-0" />
                                    <span className="text-[13px] font-bold">Quiz {(item.startingQuizNo || 1) + act.idx}</span>
                                </div>
                                <span className="text-[12px] font-medium text-[#475569] line-clamp-3 break-words">{quiz.title}</span>
                                <div className="mt-1 flex gap-2 justify-end opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => onEditQuiz && onEditQuiz(item.id || item._id, quiz)} className="px-2 py-1 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-[11px] font-bold rounded-md flex items-center gap-1">
                                        <Pencil size={12} /> Edit
                                    </button>
                                    <button type="button" onClick={() => onDeleteQuiz && onDeleteQuiz(item.id || item._id, quiz._id)} className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-[11px] font-bold rounded-md flex items-center gap-1">
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    } else {
                        const assignment = act.data;
                        return (
                            <div key={`a-${assignment.id || act.idx}`} className={`bg-white border border-orange-100 text-orange-700 p-3 rounded-xl shadow-sm flex flex-col gap-2 group/item ${displayActivities.length === 1 ? 'h-[50%]' : 'flex-1'}`}>
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="flex-shrink-0" />
                                    <span className="text-[13px] font-bold">Assignment {(item.startingAssignmentNo || 1) + act.idx}</span>
                                </div>
                                <span className="text-[12px] font-medium text-[#475569] line-clamp-3 break-words">{assignment.title}</span>
                                <div className="mt-1 flex gap-2 justify-end opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => onEditAssignment && onEditAssignment(item.id || item._id, assignment)} className="px-2 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors text-[11px] font-bold rounded-md flex items-center gap-1">
                                        <Pencil size={12} /> Edit
                                    </button>
                                    <button type="button" onClick={() => onDeleteAssignment && onDeleteAssignment(item.id || item._id, assignment.id || assignment._id)} className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-[11px] font-bold rounded-md flex items-center gap-1">
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>

            {showActivitiesViewAll && (
                <div className="p-4 pt-0 border-t border-transparent">
                    <button type="button" onClick={() => onViewAll && onViewAll(item, 'activities')} className="w-full py-2 bg-indigo-50 text-indigo-600 text-[12px] font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                        View All {totalActivities} Activities
                    </button>
                </div>
            )}
        </div>
    );
};

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
    const [viewAllModal, setViewAllModal] = useState({ isOpen: false, type: '', item: null });
    const [editingQuizData, setEditingQuizData] = useState(null);
    const [editingAssignmentData, setEditingAssignmentData] = useState(null);
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

    const [sectionInputValue, setSectionInputValue] = useState('');

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
        hasSections: false,
        sections: [],
    });

    const handleAddSection = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = sectionInputValue.trim();
            if (val && !courseForm.sections.includes(val)) {
                setCourseForm(prev => ({ ...prev, sections: [...prev.sections, val] }));
                setSectionInputValue('');
            }
        }
    };

    const handleRemoveSection = (sectionToRemove) => {
        setCourseForm(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s !== sectionToRemove)
        }));
    };

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
                        hasSections: data.hasSections || false,
                        sections: data.sections || [],
                    });

                    if (data.thumbnail) setThumbnailPreview(data.thumbnail);
                    if (data.certificateFile) setCertificatePreview(data.certificateFile);

                    // Map lectures to courseItems
                    if (data.lecturePlaylist || data.lectures) {
                        const lecs = data.lecturePlaylist || data.lectures;
                        const mappedItems = lecs.map(l => ({
                            id: l._id || l.id || Date.now() + Math.random(),
                            title: l.title,
                            type: l.type || 'Lecture',
                            lectureNo: l.lectureNo,
                            videoUrl: l.videoUrl || '',
                            audioUrl: Array.isArray(l.audioUrl) ? l.audioUrl : (l.audioUrl ? [l.audioUrl] : []),
                            pdfUrl: Array.isArray(l.pdfUrl) ? l.pdfUrl : (l.pdfUrl ? [l.pdfUrl] : []),
                            quizzes: l.quizzes || [],
                            assignments: l.assignments || [],
                            section: l.section || '',
                        }));
                        setCourseItems(mappedItems);

                        // Parse openQuizId and openAssignmentId
                        const openQuizId = queryParams.get('openQuizId');
                        const openAssignmentId = queryParams.get('openAssignmentId');
                        const lectureId = queryParams.get('lectureId');

                        if (openQuizId && lectureId) {
                            const targetLecture = mappedItems.find(l => String(l.id) === String(lectureId));
                            if (targetLecture) {
                                const targetQuiz = targetLecture.quizzes?.find(q => String(q._id) === String(openQuizId) || String(q.id) === String(openQuizId));
                                if (targetQuiz) {
                                    setEditingQuizData({ ...targetQuiz, selectedLecture: targetLecture.id });
                                    setShowQuizFlow(true);
                                    setCurrentStep(2);
                                }
                            }
                        } else if (openAssignmentId && lectureId) {
                            const targetLecture = mappedItems.find(l => String(l.id) === String(lectureId));
                            if (targetLecture) {
                                const targetAssignment = targetLecture.assignments?.find(a => String(a._id) === String(openAssignmentId) || String(a.id) === String(openAssignmentId));
                                if (targetAssignment) {
                                    setEditingAssignmentData({ ...targetAssignment, selectedLecture: targetLecture.id });
                                    setShowAssignmentFlow(true);
                                    setCurrentStep(2);
                                }
                            }
                        }
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
        section: '',
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
                if (prev.audioUrl?.some(a => (typeof a === 'string' ? a : a.url) === url)) return prev;
                return { ...prev, audioUrl: [...(prev.audioUrl || []), { title: file.name || `Audio ${(prev.audioUrl?.length || 0) + 1}`, url }] };
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
                if (prev.pdfUrl?.some(p => (typeof p === 'string' ? p : p.url) === url)) return prev;
                return { ...prev, pdfUrl: [...(prev.pdfUrl || []), { title: file.name || `PDF ${(prev.pdfUrl?.length || 0) + 1}`, url }] };
            });
        } catch (err) {
            console.error('PDF upload failed:', err);
            setSubmitError('PDF upload failed. Please try again.');
        } finally {
            setIsPdfUploading(false);
        }
    };


    const handleSaveItem = () => {
        if (!newItem.title.trim()) {
            setValidationModal({
                isOpen: true,
                message: newItem.type === 'Assignment' ? 'Assignment Name is required.' : 'Lecture Name is required.'
            });
            return;
        }

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

        setNewItem({ type: 'Lecture', title: '', videoUrl: '', audioUrl: [], pdfUrl: [], section: '' });
        setIsAudioUploading(false);
        setIsPdfUploading(false);
        setIsModalOpen(false);
    };

    const handleCloseModal = () => {
        setNewItem({ type: 'Lecture', title: '', videoUrl: '', audioUrl: [], pdfUrl: [], section: '' });
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
            section: item.section || '',
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
        const hasLectures = courseItems.some(item => !item.type || item.type === 'Lecture');
        if ((type === 'Quiz' || type === 'Assignment') && !hasLectures) {
            return;
        }
        if (type === 'Quiz') {
            setIsModalOpen(false);
            setShowQuizFlow(true);
        } else if (type === 'Assignment') {
            setIsModalOpen(false);
            setShowAssignmentFlow(true);
        } else {
            // Lecture opens the video/document form flow
            setNewItem({ type, title: '', videoUrl: '', audioUrl: [], pdfUrl: [], section: '' });
            setModalStep('item-form');
        }
    };

    const handleQuizComplete = ({ _id, title, selectedLecture }) => {
        setCourseItems(prev => {
            // Remove from all lectures first (in case it was moved)
            let updated = prev.map(l => ({ ...l, quizzes: (l.quizzes || []).filter(q => String(q._id) !== String(_id) && String(q.id) !== String(_id)) }));
            // Add to selected lecture
            return updated.map(lecture => {
                if (String(lecture.id) === String(selectedLecture) || String(lecture._id) === String(selectedLecture)) {
                    return {
                        ...lecture,
                        quizzes: [...(lecture.quizzes || []), { _id, title, type: 'Quiz' }]
                    };
                }
                return lecture;
            });
        });
        setShowQuizFlow(false);
        setEditingQuizData(null);
        if (queryParams.get('openQuizId') || queryParams.get('openAssignmentId')) {
            const returnTo = queryParams.get('returnTo');
            if (returnTo) {
                navigate(decodeURIComponent(returnTo));
            } else {
                navigate(`/admin-course-view/${courseId || editId}`);
            }
        }
    };

    const handleAssignmentComplete = (assignmentItem) => {
        const assignmentId = assignmentItem.id || assignmentItem._id || Date.now();
        setCourseItems(prev => {
            // Remove from all lectures first
            let updated = prev.map(l => ({ ...l, assignments: (l.assignments || []).filter(a => String(a.id) !== String(assignmentId) && String(a._id) !== String(assignmentId)) }));
            // Add to selected lecture
            return updated.map(lecture => {
                if (String(lecture.id) === String(assignmentItem.selectedLecture) || String(lecture._id) === String(assignmentItem.selectedLecture)) {
                    return {
                        ...lecture,
                        assignments: [...(lecture.assignments || []), { ...assignmentItem, id: assignmentId }]
                    };
                }
                return lecture;
            });
        });
        setShowAssignmentFlow(false);
        setEditingAssignmentData(null);
        if (queryParams.get('openQuizId') || queryParams.get('openAssignmentId')) {
            const returnTo = queryParams.get('returnTo');
            if (returnTo) {
                navigate(decodeURIComponent(returnTo));
            } else {
                navigate(`/admin-course-view/${courseId || editId}`);
            }
        }
    };

    const handleDeleteQuiz = (lectureId, quizId) => {
        setCourseItems(prev => prev.map(lecture => {
            if (String(lecture.id) === String(lectureId) || String(lecture._id) === String(lectureId)) {
                return {
                    ...lecture,
                    quizzes: (lecture.quizzes || []).filter(q => String(q._id) !== String(quizId))
                };
            }
            return lecture;
        }));
    };

    const handleDeleteAssignment = (lectureId, assignmentId) => {
        setCourseItems(prev => prev.map(lecture => {
            if (String(lecture.id) === String(lectureId) || String(lecture._id) === String(lectureId)) {
                return {
                    ...lecture,
                    assignments: (lecture.assignments || []).filter(a => String(a.id) !== String(assignmentId) && String(a._id) !== String(assignmentId))
                };
            }
            return lecture;
        }));
    };

    const handleDeleteResource = (lectureId, resourceType, idx) => {
        setCourseItems(prev => prev.map(lecture => {
            if (String(lecture.id) === String(lectureId) || String(lecture._id) === String(lectureId)) {
                const updated = { ...lecture };
                if (resourceType === 'audio' && updated.audioUrl) {
                    updated.audioUrl = updated.audioUrl.filter((_, i) => i !== idx);
                } else if (resourceType === 'pdf' && updated.pdfUrl) {
                    updated.pdfUrl = updated.pdfUrl.filter((_, i) => i !== idx);
                }
                return updated;
            }
            return lecture;
        }));
    };

    const handleEditQuiz = (lectureId, quiz) => {
        setEditingQuizData({ ...quiz, selectedLecture: lectureId });
        setShowQuizFlow(true);
    };

    const handleEditAssignment = (lectureId, assignment) => {
        setEditingAssignmentData({ ...assignment, selectedLecture: lectureId });
        setShowAssignmentFlow(true);
    };

    const handleViewAll = (lecture, type) => {
        setViewAllModal({ isOpen: true, type, item: lecture });
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
                certificateCriteria: courseForm.certificateCriteria !== '' ? Number(courseForm.certificateCriteria) : 90,
                unlockCriteria: courseForm.unlockCriteria !== '' ? Number(courseForm.unlockCriteria) : 90,
                duration: courseForm.duration || '',
                releaseDate: courseForm.releaseDate || new Date().toISOString(),
                thumbnail: courseForm.thumbnail || '',
                certificateFile: courseForm.certificateFile || '',
                hasSections: courseForm.hasSections || false,
                sections: courseForm.sections || [],
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
                certificateCriteria: courseForm.certificateCriteria !== '' ? Number(courseForm.certificateCriteria) : 90,
                unlockCriteria: courseForm.unlockCriteria !== '' ? Number(courseForm.unlockCriteria) : 90,
                duration: courseForm.duration || '',
                releaseDate: courseForm.releaseDate || new Date().toISOString(),
                thumbnail: courseForm.thumbnail || '',
                certificateFile: courseForm.certificateFile || '',
                hasSections: courseForm.hasSections || false,
                sections: courseForm.sections || [],
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
                certificateCriteria: courseForm.certificateCriteria !== '' ? Number(courseForm.certificateCriteria) : 90,
                unlockCriteria: courseForm.unlockCriteria !== '' ? Number(courseForm.unlockCriteria) : 90,
                duration: courseForm.duration,
                releaseDate: courseForm.releaseDate || new Date().toISOString(),
                thumbnail: courseForm.thumbnail || '',
                certificateFile: courseForm.certificateFile || '',
                status,
                hasSections: courseForm.hasSections || false,
                sections: courseForm.sections || [],
                lectures: courseItems.map((item, idx) => ({
                    title: item.title,
                    type: item.type || 'Lecture',
                    lectureNo: idx + 1,
                    videoUrl: item.videoUrl || '',
                    audioUrl: item.audioUrl || [],
                    pdfUrl: item.pdfUrl || [],
                    quizzes: (item.quizzes || []).map(q => q._id || q.quizId),
                    assignments: item.assignments || [],
                    section: item.section || '',
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
    if (isEditMode && isSubmitting && courseItems.length === 0) {
        return (
            <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center font-sans overflow-hidden">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3758EE]"></div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4 font-['Public_Sans']">
                <Navbar onMenuClick={toggleSidebar} hideMenu={true} />

                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>
                    <div className="flex-1 flex flex-col overflow-hidden relative bg-transparent">
                        <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-0 relative">
                            <div className="py-4 flex-1 flex flex-col min-h-full">
                                {showAssignmentFlow ? (
                                    <CreateAssignment
                                        courseId={courseId}
                                        nextAssignmentNumber={courseItems.length + 1}
                                        initialData={editingAssignmentData}
                                        lectures={courseItems.filter(item => !item.type || item.type === 'Lecture')}
                                        onBackToSelection={() => {
                                            setShowAssignmentFlow(false);
                                            const wasEditing = !!editingAssignmentData;
                                            setEditingAssignmentData(null);
                                            if (queryParams.get('openQuizId') || queryParams.get('openAssignmentId')) {
                                                const returnTo = queryParams.get('returnTo');
                                                if (returnTo) {
                                                    navigate(decodeURIComponent(returnTo));
                                                } else {
                                                    navigate(`/admin-course-view/${courseId || editId}`);
                                                }
                                                return;
                                            }
                                            if (!wasEditing) {
                                                setModalStep('select-type');
                                                setIsModalOpen(true);
                                            }
                                        }}
                                        onComplete={handleAssignmentComplete}
                                    />
                                ) : showQuizFlow ? (
                                    <CreateQuiz
                                        courseId={courseId}
                                        quizId={editingQuizData?._id}
                                        initialData={editingQuizData}
                                        lectures={courseItems.filter(item => !item.type || item.type === 'Lecture')}
                                        onBackToSelection={() => {
                                            setShowQuizFlow(false);
                                            const wasEditing = !!editingQuizData;
                                            setEditingQuizData(null);
                                            if (queryParams.get('openQuizId') || queryParams.get('openAssignmentId')) {
                                                const returnTo = queryParams.get('returnTo');
                                                if (returnTo) {
                                                    navigate(decodeURIComponent(returnTo));
                                                } else {
                                                    navigate(`/admin-course-view/${courseId || editId}`);
                                                }
                                                return;
                                            }
                                            if (!wasEditing) {
                                                setModalStep('select-type');
                                                setIsModalOpen(true);
                                            }
                                        }}
                                        onComplete={handleQuizComplete}
                                    />
                                ) : (
                                    <div className="flex-1 flex flex-col min-h-full bg-white shadow-sm border border-gray-100/80">
                                        {/* Header Row */}
                                        <div className="px-4 sm:px-8 py-5 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 gap-4 bg-white">
                                            <div className="flex items-center gap-3.5 w-full md:w-auto">
                                                <div className="w-10 h-10 bg-[#EEF2FF] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
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
                                            <div className="flex items-center w-full md:w-auto max-w-[850px] gap-4 sm:gap-6 md:ml-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                                                {steps.map((step) => {
                                                    const isActive = currentStep === step.id;
                                                    const isCompleted = currentStep > step.id;
                                                    return (
                                                        <div key={step.id} className="flex-1 min-w-[130px] sm:min-w-[180px] md:min-w-[240px] flex flex-col">
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
                                            <div className="px-4 sm:px-6 md:px-8 py-6 md:py-10 pb-6 flex-1 flex flex-col min-h-full text-left bg-white">
                                                <div className="w-full">
                                                    <div className="mb-6 md:mb-10">
                                                        <h3 className="text-[18px] sm:text-[20px] font-bold text-gray-800 mb-1">Course Setup</h3>
                                                        <p className="text-gray-400 font-medium text-[12px] sm:text-[13px]">Add basic course details including title, release month, duration, batch size, and certificate rules.</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
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
                                                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Batch Strength</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    placeholder="Enter students per batch (e.g. 10)"
                                                                    value={courseForm.batchStrength}
                                                                    onChange={e => handleCourseFormChange('batchStrength', e.target.value)}
                                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                                                />
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
                                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">Example 12 Weeks / 24 Weeks / 52 Weeks</p>
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
                                                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-600 bg-white shadow-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::after]:content-none [&::after]:hidden"
                                                                    />
                                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
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
                                                                    className="w-full flex items-center px-2 py-1.5 border border-gray-200 rounded-lg bg-white transition-all shadow-sm cursor-pointer min-h-[44px]"
                                                                >
                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                        <span className="px-3.5 py-1.5 bg-[#f4f4f5] text-[#52525b] text-[13px] font-bold rounded-md flex-shrink-0">
                                                                            Browse file
                                                                        </span>
                                                                        {(certificateUploading || courseForm.certificateFile) && (
                                                                            <span className="text-[13px] text-gray-600 font-medium truncate">
                                                                                {certificateUploading ? "Uploading..." : (courseForm.certificateFile.split('/').pop() || "certificate.png")}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Unlock Next Lecture (%)</label>
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

                                                    {/* Sections Setup */}
                                                    <div className="mt-8">
                                                        <label className="flex items-center gap-2 cursor-pointer mb-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={courseForm.hasSections}
                                                                onChange={e => handleCourseFormChange('hasSections', e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="text-[13px] font-bold text-gray-700">This course has multiple sections</span>
                                                        </label>

                                                        {courseForm.hasSections && (
                                                            <div className="mb-6">
                                                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Sections</label>
                                                                <div className="flex flex-wrap gap-2 mb-3">
                                                                    {courseForm.sections.map((sec, idx) => (
                                                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-[13px] font-bold rounded-lg border border-blue-100">
                                                                            {sec}
                                                                            <button type="button" onClick={() => handleRemoveSection(sec)} className="text-blue-400 hover:text-blue-600 transition-colors">
                                                                                <X size={14} />
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Type a section name and press Enter..."
                                                                    value={sectionInputValue}
                                                                    onChange={e => setSectionInputValue(e.target.value)}
                                                                    onKeyDown={handleAddSection}
                                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                                                />
                                                                <p className="mt-2 text-[11px] text-gray-400 font-medium">Press Enter to add a section.</p>
                                                            </div>
                                                        )}
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
                                                                    <span className="text-[11px] text-gray-400 font-medium">JPG / PNG / WEBP</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── STEP 2: Add Course Content ── */}
                                        {currentStep === 2 && (
                                            <div className="px-4 sm:px-6 md:px-8 py-6 md:py-10 pb-6 flex-1 flex flex-col min-h-full bg-white">
                                                <div className="w-full">
                                                    <div className="mb-6 md:mb-10 text-left">
                                                        <h3 className="text-[18px] sm:text-[22px] font-bold text-[#0f172a] mb-2">Add Course Content</h3>
                                                        <p className="text-[#64748b] font-medium text-[13px] sm:text-[15px]">Upload lectures, quizzes, and assignments. Each item will auto-generate numbering and structure.</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mt-4">
                                                        {courseItems.map((item, idx) => {
                                                            let globalQuizNo = 0;
                                                            let globalAssignmentNo = 0;
                                                            for (let i = 0; i < idx; i++) {
                                                                globalQuizNo += courseItems[i].quizzes?.length || 0;
                                                                globalAssignmentNo += courseItems[i].assignments?.length || 0;
                                                            }
                                                            return (
                                                                <React.Fragment key={item.id || idx}>
                                                                    <LectureCard
                                                                        courseThumbnail={courseForm.thumbnail}
                                                                        item={{ ...item, startingQuizNo: globalQuizNo + 1, startingAssignmentNo: globalAssignmentNo + 1 }}
                                                                        onEdit={() => handleEditItemClick(idx)}
                                                                        onDelete={() => handleDeleteItemClick(idx)}
                                                                        onDeleteResource={handleDeleteResource}
                                                                        onViewAll={handleViewAll}
                                                                    />
                                                                    <LectureActivitiesCard
                                                                        item={{ ...item, startingQuizNo: globalQuizNo + 1, startingAssignmentNo: globalAssignmentNo + 1 }}
                                                                        onEditQuiz={handleEditQuiz}
                                                                        onDeleteQuiz={handleDeleteQuiz}
                                                                        onEditAssignment={handleEditAssignment}
                                                                        onDeleteAssignment={handleDeleteAssignment}
                                                                        onViewAll={handleViewAll}
                                                                    />
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                        <div
                                                            onClick={handleAddLecturesClick}
                                                            className="w-full h-full min-h-[250px] sm:min-h-[300px] bg-[#F7F4FF] rounded-[24px] flex flex-col items-center justify-center p-6 sm:p-8 cursor-pointer group hover:shadow-xl hover:shadow-[#4f46e5]/10 border border-transparent hover:border-[#4f46e5]/20 transition-all duration-300"
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
                                            <div className="px-4 sm:px-6 md:px-8 py-6 md:py-10 pb-6 flex-1 flex flex-col min-h-full space-y-8 md:space-y-12 bg-white">
                                                <div className="w-full text-left">

                                                    {/* Success / Error Alerts */}
                                                    {submitSuccess && (
                                                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 mb-6">
                                                            <CheckCircle size={20} className="flex-shrink-0" />
                                                            <span className="font-bold text-[13px] sm:text-[14px]">{isEditMode ? 'Course updated successfully!' : 'Course created successfully!'} Redirecting…</span>
                                                        </div>
                                                    )}
                                                    {submitError && (
                                                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 mb-6">
                                                            <AlertCircle size={20} className="flex-shrink-0" />
                                                            <span className="font-bold text-[13px] sm:text-[14px]">{submitError}</span>
                                                        </div>
                                                    )}

                                                    {/* Course Setup Review */}
                                                    <div className="bg-white rounded-[16px] sm:rounded-[24px] p-5 sm:p-10 border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                                                            <h3 className="text-[18px] sm:text-[22px] font-bold text-[#0f172a]">Course Setup</h3>
                                                            <button onClick={() => setCurrentStep(1)} className="text-[#3b82f6] font-bold text-[14px] sm:text-[16px] hover:underline">Edit</button>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-10 gap-x-10 sm:gap-x-20">
                                                            {[
                                                                { label: 'Course Title', value: courseForm.title || '—' },
                                                                { label: 'Release Date', value: courseForm.releaseDate || '—' },
                                                                { label: 'Instructor', value: courseForm.instructor || '—' },
                                                                { label: 'Add by (read-only)', value: user?.name || user?.firstname || 'Admin' },
                                                                { label: 'Batch Strength', value: courseForm.batchStrength ? `${courseForm.batchStrength} students per batch` : '—' },
                                                                { label: 'Total Lectures', value: courseForm.totalLectures || courseItems.length || '—' },
                                                                { label: 'Course Duration', value: courseForm.duration || '—' },
                                                                { label: 'Unlock Next Lecture (%)', value: courseForm.unlockCriteria !== '' ? `${courseForm.unlockCriteria}%` : '90% (Default)' },
                                                                { label: 'Certificate Eligibility (%)', value: courseForm.certificateCriteria !== '' ? `${courseForm.certificateCriteria}%` : '90% (Default)' },
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
                                                    <div className="mt-8 sm:mt-10 bg-white rounded-[16px] sm:rounded-[24px] p-5 sm:p-10 border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                                                            <h3 className="text-[18px] sm:text-[22px] font-bold text-[#0f172a] flex flex-col sm:flex-row sm:items-center">
                                                                Lectures Content <span className="text-[14px] sm:text-[16px] text-[#64748b] font-medium sm:ml-2 mt-1 sm:mt-0">({courseItems.length} lectures)</span>
                                                            </h3>
                                                            <button onClick={() => setCurrentStep(2)} className="text-[#3b82f6] font-bold text-[16px] hover:underline">Edit</button>
                                                        </div>
                                                        {courseItems.length === 0 ? (
                                                            <p className="text-[#64748b] text-[14px] font-medium">No lectures added yet. Go to Step 2 to add lectures.</p>
                                                        ) : (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                                                                {courseItems.map((item, idx) => {
                                                                    let globalQuizNo = 0;
                                                                    let globalAssignmentNo = 0;
                                                                    for (let i = 0; i < idx; i++) {
                                                                        globalQuizNo += courseItems[i].quizzes?.length || 0;
                                                                        globalAssignmentNo += courseItems[i].assignments?.length || 0;
                                                                    }
                                                                    return (
                                                                        <React.Fragment key={item.id || idx}>
                                                                            <LectureCard
                                                                                courseThumbnail={courseForm.thumbnail}
                                                                                item={{ ...item, startingQuizNo: globalQuizNo + 1, startingAssignmentNo: globalAssignmentNo + 1 }}
                                                                                onDeleteResource={handleDeleteResource}
                                                                                onViewAll={handleViewAll}
                                                                            />
                                                                            <LectureActivitiesCard
                                                                                item={{ ...item, startingQuizNo: globalQuizNo + 1, startingAssignmentNo: globalAssignmentNo + 1 }}
                                                                                onEditQuiz={handleEditQuiz}
                                                                                onDeleteQuiz={handleDeleteQuiz}
                                                                                onEditAssignment={handleEditAssignment}
                                                                                onDeleteAssignment={handleDeleteAssignment}
                                                                                onViewAll={handleViewAll}
                                                                            />
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        </main>

                        {/* Footer Actions */}
                        {!showQuizFlow && !showAssignmentFlow && (
                            <div className="w-full flex-shrink-0 mt-auto bg-white border-t border-gray-150 py-4 px-4 sm:px-6 md:px-10 flex justify-between items-center z-40">
                                <button
                                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/admin-dashboard')}
                                    className="w-auto px-4 sm:px-6 md:px-12 py-2.5 sm:py-3 bg-[#F3F4F6] text-gray-500 font-bold rounded hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-95 shadow-sm text-[13px] sm:text-[14px]"
                                >
                                    {currentStep === 1 ? 'Cancel' : 'Back'}
                                </button>
                                <div className="flex gap-2 sm:gap-3 md:gap-4">
                                    {!isEditMode && (
                                        <button
                                            onClick={handleSaveDraftClick}
                                            disabled={isSubmitting}
                                            className="w-auto px-3 sm:px-6 md:px-12 py-2.5 sm:py-3 bg-[#F3F4F6] text-[#64748b] font-bold rounded hover:bg-gray-200 hover:text-[#0f172a] transition-all active:scale-95 shadow-sm disabled:opacity-50 text-[12px] sm:text-[14px] whitespace-nowrap"
                                        >
                                            <span className="sm:hidden">Draft</span>
                                            <span className="hidden sm:inline">Save as draft</span>
                                        </button>
                                    )}
                                    <GradiantButton
                                        onClick={() => {
                                            if (currentStep === 1) handleAdvanceToStep2();
                                            else if (currentStep === 2) setCurrentStep(3);
                                            else handleSubmit('published');
                                        }}
                                        disabled={isSubmitting}
                                        className="w-auto px-6 sm:px-6 md:px-12 py-2.5 sm:py-3 font-bold rounded transition-all active:scale-95 shadow-sm disabled:opacity-70 text-[13px] sm:text-[14px]"
                                    >
                                        {isSubmitting
                                            ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> <span className="hidden sm:inline">Saving…</span></span>
                                            : currentStep === 3 ? (isEditMode ? 'Update' : 'Publish') : 'Next'
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
                    hasLectures={courseItems.some(item => !item.type || item.type === 'Lecture')}
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
                                            {editingIndex !== null ? 'Edit' : 'Add New'} {newItem.type === 'Assignment' ? 'Assignment' : 'Course Item'}
                                        </h2>
                                        <p className="text-gray-400 text-[13px] font-medium leading-relaxed">
                                            Select the type of content you want to add and upload the required files.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8 max-h-[75vh] overflow-y-auto no-scrollbar">
                                <div className="space-y-6">
                                    {/* Section Dropdown */}
                                    {courseForm.hasSections && courseForm.sections.length > 0 && (
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Select Section</label>
                                            <div className="relative group">
                                                <select
                                                    value={newItem.section || ''}
                                                    onChange={e => setNewItem({ ...newItem, section: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] text-gray-600 appearance-none bg-white shadow-sm cursor-pointer"
                                                >
                                                    <option value="">-- Select a Section --</option>
                                                    {courseForm.sections.map((section, idx) => (
                                                        <option key={idx} value={section}>{section}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Row 1: Lecture name and Lecture Number */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 mb-2">{newItem.type === 'Assignment' ? 'Assignment Name' : 'Lecture name'}</label>
                                            <input
                                                type="text"
                                                placeholder="Enter title"
                                                value={newItem.title}
                                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-[14px] placeholder:text-gray-300 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 mb-2">{newItem.type === 'Assignment' ? 'Assignment Number' : 'Lecture Number'}<span className="text-gray-400 font-normal text-[11px]">(Auto-Generated)</span></label>
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
                                        <label className="block text-[13px] font-bold text-gray-700 mb-3">{newItem.type === 'Assignment' ? 'Upload Assignment Instructions (Video)' : 'Upload Video Lecture'}</label>
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
                                            <label className="block text-[13px] font-bold text-gray-700 mb-3">{newItem.type === 'Assignment' ? 'Optional Assignment Audio Instructions' : 'Optional Audio Upload'}</label>
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
                                                <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
                                                    {newItem.audioUrl.map((item, idx) => {
                                                        const isObj = typeof item === 'object' && item !== null;
                                                        const title = isObj ? item.title : `Audio ${idx + 1}`;
                                                        const url = isObj ? item.url : item;
                                                        return (
                                                            <div key={idx} className="flex flex-col gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
                                                                <div className="flex items-center justify-between">
                                                                    <input
                                                                        type="text"
                                                                        value={title}
                                                                        onChange={(e) => {
                                                                            const newAudio = [...newItem.audioUrl];
                                                                            newAudio[idx] = { title: e.target.value, url };
                                                                            setNewItem({ ...newItem, audioUrl: newAudio });
                                                                        }}
                                                                        className="text-[12px] font-bold text-gray-700 outline-none border-b border-dashed border-gray-300 focus:border-blue-500 bg-transparent flex-1 mr-3 pb-0.5"
                                                                        placeholder="Audio Title..."
                                                                    />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setNewItem({ ...newItem, audioUrl: newItem.audioUrl.filter((_, i) => i !== idx) });
                                                                        }}
                                                                        className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 truncate">{url}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Add Audio via URL</label>
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        id="manualAudioTitle"
                                                        type="text"
                                                        placeholder="Audio Title (e.g. Background Track)"
                                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-md outline-none focus:border-blue-500 text-[12px] shadow-sm bg-white"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            id="manualAudioUrl"
                                                            type="text"
                                                            placeholder="https://example.com/audio.mp3"
                                                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md outline-none focus:border-blue-500 text-[12px] shadow-sm bg-white"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    document.getElementById('addAudioBtn').click();
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            id="addAudioBtn"
                                                            type="button"
                                                            onClick={() => {
                                                                const titleInput = document.getElementById('manualAudioTitle');
                                                                const urlInput = document.getElementById('manualAudioUrl');
                                                                const val = urlInput.value.trim();
                                                                if (val) {
                                                                    let fallbackTitle = val.split('/').pop();
                                                                    if (fallbackTitle === 'view' || !fallbackTitle) fallbackTitle = val;
                                                                    setNewItem(prev => ({
                                                                        ...prev,
                                                                        audioUrl: [...(prev.audioUrl || []), { title: titleInput.value.trim() || fallbackTitle || `Audio ${(prev.audioUrl?.length || 0) + 1}`, url: val }]
                                                                    }));
                                                                    titleInput.value = '';
                                                                    urlInput.value = '';
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-blue-500 text-white text-[12px] font-bold rounded-md hover:bg-blue-600 transition-colors shadow-sm"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Optional PDF/Resource Upload */}
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 mb-3">{newItem.type === 'Assignment' ? 'Optional Assignment PDF Instructions' : 'Optional PDF Upload'}</label>
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
                                                <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
                                                    {newItem.pdfUrl.map((item, idx) => {
                                                        const isObj = typeof item === 'object' && item !== null;
                                                        const title = isObj ? item.title : `PDF ${idx + 1}`;
                                                        const url = isObj ? item.url : item;
                                                        return (
                                                            <div key={idx} className="flex flex-col gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
                                                                <div className="flex items-center justify-between">
                                                                    <input
                                                                        type="text"
                                                                        value={title}
                                                                        onChange={(e) => {
                                                                            const newPdf = [...newItem.pdfUrl];
                                                                            newPdf[idx] = { title: e.target.value, url };
                                                                            setNewItem({ ...newItem, pdfUrl: newPdf });
                                                                        }}
                                                                        className="text-[12px] font-bold text-gray-700 outline-none border-b border-dashed border-gray-300 focus:border-blue-500 bg-transparent flex-1 mr-3 pb-0.5"
                                                                        placeholder="PDF Title..."
                                                                    />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setNewItem({ ...newItem, pdfUrl: newItem.pdfUrl.filter((_, i) => i !== idx) });
                                                                        }}
                                                                        className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 truncate">{url}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Add PDF via URL</label>
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        id="manualPdfTitle"
                                                        type="text"
                                                        placeholder="PDF Title (e.g. Chapter 1 Notes)"
                                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-md outline-none focus:border-blue-500 text-[12px] shadow-sm bg-white"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            id="manualPdfUrl"
                                                            type="text"
                                                            placeholder="https://example.com/document.pdf"
                                                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md outline-none focus:border-blue-500 text-[12px] shadow-sm bg-white"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    document.getElementById('addPdfBtn').click();
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            id="addPdfBtn"
                                                            type="button"
                                                            onClick={() => {
                                                                const titleInput = document.getElementById('manualPdfTitle');
                                                                const urlInput = document.getElementById('manualPdfUrl');
                                                                const val = urlInput.value.trim();
                                                                if (val) {
                                                                    let fallbackTitle = val.split('/').pop();
                                                                    if (fallbackTitle === 'view' || !fallbackTitle) fallbackTitle = val;
                                                                    setNewItem(prev => ({
                                                                        ...prev,
                                                                        pdfUrl: [...(prev.pdfUrl || []), { title: titleInput.value.trim() || fallbackTitle || `PDF ${(prev.pdfUrl?.length || 0) + 1}`, url: val }]
                                                                    }));
                                                                    titleInput.value = '';
                                                                    urlInput.value = '';
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-blue-500 text-white text-[12px] font-bold rounded-md hover:bg-blue-600 transition-colors shadow-sm"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
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

                {/* View All Modal */}
                {viewAllModal.isOpen && viewAllModal.item && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-[600px] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-[20px] font-bold text-[#0f172a]">
                                    All {viewAllModal.type === 'resources' ? 'Resources' : 'Activities'} - {viewAllModal.item.title || 'Lecture'}
                                </h3>
                                <button onClick={() => setViewAllModal({ isOpen: false, type: '', item: null })} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-3">
                                {viewAllModal.type === 'resources' && (
                                    <>
                                        {viewAllModal.item.audioUrl && Array.isArray(viewAllModal.item.audioUrl) && viewAllModal.item.audioUrl.map((item, idx) => {
                                            const isObj = typeof item === 'object' && item !== null;
                                            let title = isObj ? item.title : `Audio ${idx + 1}`;
                                            let url = isObj ? item.url : item;
                                            if (!isObj || title.startsWith('Audio ')) {
                                                try {
                                                    let u = url;
                                                    if (u.includes('?')) u = u.split('?')[0];
                                                    if (u.endsWith('/')) u = u.slice(0, -1);
                                                    const parts = u.split('/');
                                                    let lastPart = parts[parts.length - 1];
                                                    if (lastPart === 'view' && parts.length > 2) lastPart = parts[parts.length - 2];
                                                    if (lastPart && lastPart.length > 0) title = decodeURIComponent(lastPart);
                                                } catch (e) { }
                                            }
                                            return (
                                                <div key={`audio-${idx}`} className="flex items-center gap-3 bg-[#f8fafc] rounded-xl px-4 py-3 group/item">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-500 font-bold text-xs">A</div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-[13px] text-[#0f172a] font-bold truncate pr-4">{title}</span>
                                                        <span className="text-[11px] text-[#64748b] font-medium truncate">{url}</span>
                                                    </div>
                                                    <button onClick={() => {
                                                        handleDeleteResource(viewAllModal.item.id || viewAllModal.item._id, 'audio', idx);
                                                        setViewAllModal(prev => ({ ...prev, item: { ...prev.item, audioUrl: prev.item.audioUrl.filter((_, i) => i !== idx) } }));
                                                    }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg flex-shrink-0">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {viewAllModal.item.pdfUrl && Array.isArray(viewAllModal.item.pdfUrl) && viewAllModal.item.pdfUrl.map((item, idx) => {
                                            const isObj = typeof item === 'object' && item !== null;
                                            let title = isObj ? item.title : `PDF ${idx + 1}`;
                                            let url = isObj ? item.url : item;
                                            if (!isObj || title.startsWith('PDF ')) {
                                                try {
                                                    let u = url;
                                                    if (u.includes('?')) u = u.split('?')[0];
                                                    if (u.endsWith('/')) u = u.slice(0, -1);
                                                    const parts = u.split('/');
                                                    let lastPart = parts[parts.length - 1];
                                                    if (lastPart === 'view' && parts.length > 2) lastPart = parts[parts.length - 2];
                                                    if (lastPart && lastPart.length > 0) title = decodeURIComponent(lastPart);
                                                } catch (e) { }
                                            }
                                            return (
                                                <div key={`pdf-${idx}`} className="flex items-center gap-3 bg-[#f8fafc] rounded-xl px-4 py-3 group/item">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-500 font-bold text-xs">P</div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-[13px] text-[#0f172a] font-bold truncate pr-4">{title}</span>
                                                        <span className="text-[11px] text-[#64748b] font-medium truncate">{url}</span>
                                                    </div>
                                                    <button onClick={() => {
                                                        handleDeleteResource(viewAllModal.item.id || viewAllModal.item._id, 'pdf', idx);
                                                        setViewAllModal(prev => ({ ...prev, item: { ...prev.item, pdfUrl: prev.item.pdfUrl.filter((_, i) => i !== idx) } }));
                                                    }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg flex-shrink-0">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                                {viewAllModal.type === 'activities' && (
                                    <>
                                        {viewAllModal.item.quizzes?.map((quiz, qIdx) => (
                                            <div key={`quiz-${quiz._id || qIdx}`} className="bg-purple-50 border border-purple-100 text-purple-700 px-4 py-3 rounded-xl flex items-center gap-3">
                                                <HelpCircle size={18} className="flex-shrink-0" />
                                                <span className="text-[13px] font-bold">Quiz {(viewAllModal.item.startingQuizNo || 1) + qIdx}</span>
                                                <span className="text-[12px] font-medium ml-2 truncate flex-1 opacity-80">{quiz.title}</span>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => { setViewAllModal({ isOpen: false, type: '', item: null }); handleEditQuiz(viewAllModal.item.id || viewAllModal.item._id, quiz); }} className="p-1.5 text-purple-600 hover:bg-purple-200 rounded-lg">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button onClick={() => {
                                                        handleDeleteQuiz(viewAllModal.item.id || viewAllModal.item._id, quiz._id);
                                                        setViewAllModal(prev => ({ ...prev, item: { ...prev.item, quizzes: prev.item.quizzes.filter(q => q._id !== quiz._id) } }));
                                                    }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {viewAllModal.item.assignments?.map((assignment, aIdx) => (
                                            <div key={`assignment-${assignment.id || aIdx}`} className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-3 rounded-xl flex items-center gap-3">
                                                <FileText size={18} className="flex-shrink-0" />
                                                <span className="text-[13px] font-bold">Assignment {(viewAllModal.item.startingAssignmentNo || 1) + aIdx}</span>
                                                <span className="text-[12px] font-medium ml-2 truncate flex-1 opacity-80">{assignment.title}</span>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => { setViewAllModal({ isOpen: false, type: '', item: null }); handleEditAssignment(viewAllModal.item.id || viewAllModal.item._id, assignment); }} className="p-1.5 text-orange-600 hover:bg-orange-200 rounded-lg">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button onClick={() => {
                                                        handleDeleteAssignment(viewAllModal.item.id || viewAllModal.item._id, assignment.id || assignment._id);
                                                        setViewAllModal(prev => ({ ...prev, item: { ...prev.item, assignments: prev.item.assignments.filter(a => a.id !== assignment.id && a._id !== assignment._id) } }));
                                                    }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
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
