import { CustomPagination } from '@/components/ui/Pagination';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Lock, Eye, FileText, Star, X, CheckCircle, Calendar } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import axiosInstance from '@/api/axiosInstance';
import { Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CertificateCard from '@/features/courses/components/CertificateCard';
import { useTranslation } from 'react-i18next';

const CertificateCardsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0"></div>
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded-full w-16 shrink-0"></div>
                    </div>

                    <div className="flex flex-col gap-2.5 bg-gray-50/80 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                            <div className="h-3 bg-gray-200 rounded w-14"></div>
                            <div className="h-3 bg-gray-200 rounded w-28"></div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                                <div className="h-3 bg-gray-200 rounded w-8"></div>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                        <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
                        <div className="w-16 h-9 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const CertificateTableRowsSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 md:gap-2 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div
                    key={i}
                    className="bg-white md:bg-transparent border md:border-0 md:border-b border-gray-100 rounded-xl md:rounded-none p-4 md:p-0 md:py-4"
                >
                    <div className="grid grid-cols-12 gap-3 xl:gap-4 items-center">
                        {/* Course Info */}
                        <div className="col-span-4 xl:col-span-3 flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0"></div>
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="hidden xl:flex xl:col-span-2 justify-center">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>

                        {/* Start & End Date */}
                        <div className="col-span-2 xl:col-span-2 flex flex-col items-center gap-1">
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                            <div className="h-2.5 bg-gray-200 rounded w-14"></div>
                        </div>

                        {/* Progress */}
                        <div className="col-span-2 xl:col-span-1">
                            <div className="flex items-center gap-2 justify-center w-full">
                                <div className="w-10 xl:w-10 h-1.5 bg-gray-200 rounded-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-6"></div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-2 xl:col-span-2 flex justify-center items-center">
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        </div>

                        {/* Action */}
                        <div className="col-span-2 xl:col-span-2 flex justify-center items-center">
                            <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const Certificates = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [generatingId, setGeneratingId] = useState(null);
    const certCardRef = React.useRef(null);
    const [certData, setCertData] = useState(null);

    const [metrics, setMetrics] = useState({
        totalCoursesCompleted: { count: 0 },
        certificatesAvailable: { count: 0 },
        coursesInProgress: { count: 0 },
        lockedCertificates: { count: 0 },
    });
    const [allCertificates, setAllCertificates] = useState([]);

    // Review System States
    const [reviewModalItem, setReviewModalItem] = useState(null);
    const [viewReviewModalItem, setViewReviewModalItem] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const openSubmitReview = (item) => {
        setReviewModalItem(item);
        setReviewRating(5);
        setHoverRating(0);
        setReviewComment('');
        setReviewError('');
    };

    const openViewReview = (item) => {
        setViewReviewModalItem(item);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewModalItem) return;
        setReviewError('');
        setSubmittingReview(true);

        try {
            const payload = {
                enrollmentId: reviewModalItem.enrollmentId,
                rating: reviewRating,
                comment: reviewComment.trim()
            };

            const res = await axiosInstance.post('/reviews', payload, { withCredentials: true });
            const savedReview = res.data?.data;

            // Update local allCertificates state immediately
            setAllCertificates(prev => prev.map(item => {
                if (item.enrollmentId === reviewModalItem.enrollmentId) {
                    return {
                        ...item,
                        hasReviewed: true,
                        review: savedReview
                    };
                }
                return item;
            }));

            setReviewModalItem(null);
        } catch (err) {
            console.error("Failed to submit review:", err);
            setReviewError(err.response?.data?.message || "Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const itemsPerPage = 10;
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        const fetchCertificates = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get('/enrollments/my-certificates', { withCredentials: true });
                const data = res.data.data;
                setMetrics({
                    totalCoursesCompleted: data.totalCoursesCompleted,
                    certificatesAvailable: data.certificatesAvailable,
                    coursesInProgress: data.coursesInProgress,
                    lockedCertificates: data.lockedCertificates,
                });
                setAllCertificates(data.certificatesList || []);
            } catch (err) {
                console.error('Failed to fetch certificates', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    const downloadAsPDF = async (imgUrl, courseName, item = null) => {
        try {
            let blob;
            try {
                const res = await fetch(imgUrl);
                if (res.ok) {
                    blob = await res.blob();
                }
            } catch (fetchErr) {
                console.warn('Direct fetch failed, falling back to direct load:', fetchErr);
            }

            const targetSrc = blob ? URL.createObjectURL(blob) : imgUrl;
            const { jsPDF } = await import('jspdf');
            const img = new Image();
            if (!blob) {
                img.crossOrigin = "Anonymous";
            }
            img.onload = () => {
                try {
                    const doc = new jsPDF({
                        orientation: 'landscape',
                        unit: 'px',
                        format: [1122, 794]
                    });
                    doc.addImage(img, 'PNG', 0, 0, 1122, 794);
                    doc.save(`Certificate_${(courseName || 'Course').replace(/\s+/g, '_')}.pdf`);
                    if (blob) URL.revokeObjectURL(targetSrc);
                } catch {
                    const link = document.createElement('a');
                    link.href = targetSrc;
                    link.download = `Certificate_${(courseName || 'Course').replace(/\s+/g, '_')}.png`;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };
            img.onerror = async () => {
                if (blob) {
                    const link = document.createElement('a');
                    link.href = targetSrc;
                    link.download = `Certificate_${(courseName || 'Course').replace(/\s+/g, '_')}.png`;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else if (item) {
                    await handleGenerateCertificate(item);
                } else {
                    const link = document.createElement('a');
                    link.href = imgUrl;
                    link.download = `Certificate_${(courseName || 'Course').replace(/\s+/g, '_')}.png`;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };
            img.src = targetSrc;
        } catch (e) {
            console.error('PDF Download failed:', e);
            const link = document.createElement('a');
            link.href = imgUrl;
            link.download = `Certificate_${(courseName || 'Course').replace(/\s+/g, '_')}.png`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const openAsPDF = async (imgUrl) => {
        try {
            const { jsPDF } = await import('jspdf');
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [1122, 794]
                });
                doc.addImage(img, 'PNG', 0, 0, 1122, 794);
                const pdfBlob = doc.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                window.open(url, '_blank');
            };
            img.onerror = () => {
                alert("Failed to open PDF because the certificate image could not be loaded.");
            };
            img.src = imgUrl;
        } catch (e) {
            console.error('PDF Open failed:', e);
            alert("Failed to open PDF.");
        }
    };

    const handleGenerateCertificate = async (enrollment) => {
        if (generatingId) return;
        setGeneratingId(enrollment.enrollmentId);

        try {
            const studentName = (user?.firstname && user?.lastname)
                ? `${user.firstname} ${user.lastname}`.trim()
                : (user?.name?.trim() || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Student');

            const template = enrollment.certificateTemplate;
            if (template) {
                await new Promise((resolve) => {
                    const tImg = new Image();
                    tImg.crossOrigin = "Anonymous";
                    tImg.onload = resolve;
                    tImg.onerror = resolve;
                    tImg.src = template;
                });
            }

            setCertData({
                studentName,
                courseName: enrollment.course,
                completedAt: enrollment.endDate !== 'N/A' && enrollment.endDate !== 'In Progress'
                    ? new Date(enrollment.endDate).toISOString()
                    : new Date().toISOString(),
                templateUrl: template,
                studentId: user?.studentId || 'N/A',
                batchId: enrollment.batchIdString || 'N/A',
                fromDate: enrollment.batchStartDate || 'N/A',
                toDate: enrollment.batchEndDate || 'N/A'
            });

            // wait for the hidden card to render
            await new Promise(r => setTimeout(r, 400));

            const { toBlob } = await import('html-to-image');
            const blob = await toBlob(certCardRef.current, {
                pixelRatio: 1, // Standard resolution to ensure small file size and prevent Network Errors
                cacheBust: true,
                style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });

            if (!blob) throw new Error("Failed to generate image blob");

            // 1. Immediately trigger PDF download for the user from the generated blob
            const { jsPDF } = await import('jspdf');
            const blobUrl = URL.createObjectURL(blob);
            await new Promise((resolve) => {
                const pdfImg = new Image();
                pdfImg.onload = () => {
                    const doc = new jsPDF({
                        orientation: 'landscape',
                        unit: 'px',
                        format: [1122, 794]
                    });
                    doc.addImage(pdfImg, 'PNG', 0, 0, 1122, 794);
                    doc.save(`Certificate_${enrollment.course.replace(/\s+/g, '_')}.pdf`);
                    URL.revokeObjectURL(blobUrl);
                    resolve();
                };
                pdfImg.onerror = () => {
                    URL.revokeObjectURL(blobUrl);
                    resolve();
                };
                pdfImg.src = blobUrl;
            });

            // 2. Upload and save the certificate image to backend
            try {
                const { uploadImage, saveCertificate } = await import('@/api/course');
                const uploaded = await uploadImage(new File([blob], 'certificate.png', { type: 'image/png' }));

                await saveCertificate(enrollment.courseId, uploaded.url, enrollment.enrollmentId);

                // Update UI
                setAllCertificates(prev => prev.map(c =>
                    c.enrollmentId === enrollment.enrollmentId
                        ? { ...c, certificateUrl: uploaded.url }
                        : c
                ));

                // Update metrics if it wasn't already available
                setMetrics(prev => ({
                    ...prev,
                    certificatesAvailable: { count: prev.certificatesAvailable.count + (enrollment.certificateUrl ? 0 : 1) },
                    lockedCertificates: { count: Math.max(0, prev.lockedCertificates.count - (enrollment.certificateUrl ? 0 : 1)) }
                }));

            } catch (e) {
                console.error('Upload/Save side failed:', e);
            } finally {
                setGeneratingId(null);
                setCertData(null);
            }

        } catch (e) {
            console.error('Generation failed:', e);
            alert(`Failed to generate certificate: ${e.message}`);
            setGeneratingId(null);
            setCertData(null);
        }
    };

    const filtered = [...allCertificates]
        .sort((a, b) => {
            // Completed first, then Active, then Not Started
            const order = { Completed: 0, Active: 1, 'Not Started': 2 };
            return (order[a.status] ?? 3) - (order[b.status] ?? 3);
        })
        .filter(c =>
            c.course?.toLowerCase().includes(search.toLowerCase())
        );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        const blockSize = 4;
        const currentBlock = Math.ceil(currentPage / blockSize);
        const start = (currentBlock - 1) * blockSize + 1;
        const end = Math.min(start + blockSize - 1, totalPages);

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('ellipsis-start');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('ellipsis-end');
            pages.push(totalPages);
        }

        return [...new Set(pages)];
    };

    const metricCards = [
        { label: t('total_courses_completed', 'Total Courses Completed'), value: metrics.totalCoursesCompleted.count, sub: t('courses', 'Courses'), change: '+12%', desc: t('all_courses_completed_desc', 'All courses you have successfully finished.') },
        { label: t('certificates_available', 'Certificates Available'), value: metrics.certificatesAvailable.count, sub: t('certificates', 'Certificates'), change: '+2%', desc: t('certificates_available_desc', 'Certificates ready for you to download and share.') },
        { label: t('courses_in_progress_title', 'Courses In Progress'), value: metrics.coursesInProgress.count, sub: t('courses_in_progress', 'Courses In Progress'), change: '+10%', desc: t('courses_in_progress_desc', 'Courses you are currently enrolled in but not yet completed.') },
        { label: t('locked_certificates_title', 'Locked Certificates'), value: metrics.lockedCertificates.count, sub: t('locked_certificates', 'Locked Certificates'), change: '', desc: t('locked_certificates_desc', 'Certificates that will unlock upon 100% completion of their course.') },
    ];

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            {/* Hidden Certificate Generator Card */}
            {certData && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1, width: '1122px', height: '794px', overflow: 'hidden' }}>
                    <CertificateCard
                        ref={certCardRef}
                        studentName={certData.studentName}
                        courseName={certData.courseName}
                        completedAt={certData.completedAt}
                        templateUrl={certData.templateUrl}
                        studentId={certData.studentId}
                        batchId={certData.batchId}
                        fromDate={certData.fromDate}
                        toDate={certData.toDate}
                    />
                </div>
            )}

            <div className="relative w-full max-w-[1920px] max-h-[1680px] flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>

                    {isSidebarOpen && (
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
                    )}

                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 lg:static lg:block fixed left-0 top-0 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    />

                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                        <div className="py-4 pr-2 flex flex-col gap-6">

                            {/* ── Metric Cards ── */}
                            <div className="flex xl:grid xl:grid-cols-4 gap-3.5 xl:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth custom-scrollbar-thin xl:overflow-visible">
                                {metricCards.map((metric, index) => (
                                    <div key={index} className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between h-full min-w-[250px] sm:min-w-[280px] lg:min-w-0 flex-shrink-0 lg:flex-shrink">
                                        <div>
                                            <h3 className="text-gray-900 font-semibold mb-1.5 xl:mb-2 text-xs sm:text-sm truncate" title={metric.label}>{metric.label}</h3>
                                            <div className="flex items-baseline gap-1.5 xl:gap-2 mb-2 flex-wrap">
                                                {loading ? (
                                                    <>
                                                        <div className="h-8 bg-gray-200 rounded w-10 animate-pulse"></div>
                                                        <span className="text-xs font-medium text-gray-500">{metric.sub}</span>
                                                        {metric.change && (
                                                            <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-2xl xl:text-3xl font-bold text-gray-900">{metric.value}</span>
                                                        <span className="text-xs font-medium text-gray-500">{metric.sub}</span>
                                                        {metric.change && (
                                                            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded">{metric.change}</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-[11px] leading-tight line-clamp-2">{metric.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── Certificates Table ── */}
                            <div className="bg-white rounded-[16px] border border-[#EAEDF2] p-4 shadow-sm">
                                <div className="flex flex-col justify-between mb-6 gap-4">
                                    <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 leading-[1.8] pt-2 pb-2">{t('certificates_list', 'Certificates List')}</h2>
                                            <p className="text-gray-500 text-sm leading-[1.8]">{t('manage_certificates', 'Manage your Certificates')}</p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            <div className="relative w-full md:w-[300px]">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <input
                                                    type="text"
                                                    value={search}
                                                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                                    placeholder={t('search_by_course', 'Search certificate by Course name')}
                                                    className="w-full pl-9 pr-4 h-[40px] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <GradiantButton className={"h-[40px] px-3 md:px-4 rounded-lg"}>
                                                <Search className="h-4 w-4" />
                                                <span className="hidden md:inline">{t('search', 'Search')}</span>
                                            </GradiantButton>
                                        </div>
                                    </div>
                                </div>

                                {loading ? (
                                    <>
                                        <div className="lg:hidden">
                                            <CertificateCardsSkeleton />
                                        </div>
                                        <div className="hidden lg:block w-full overflow-x-auto pb-2 scrollbar-thin">
                                            <div className="w-full min-w-[720px] xl:min-w-0">
                                                <div className="grid grid-cols-12 gap-3 xl:gap-4 border-b border-gray-100 pb-4 mb-4 text-sm font-semibold text-gray-900 text-center leading-[1.8]">
                                                    <div className="col-span-4 xl:col-span-3 text-left pl-4">{t('courses', 'Courses')}</div>
                                                    <div className="hidden xl:block xl:col-span-2">{t('title', 'Title')}</div>
                                                    <div className="col-span-2 xl:col-span-2 whitespace-nowrap">{t('start_end_date', 'Start & End Date')}</div>
                                                    <div className="col-span-2 xl:col-span-1">{t('progress', 'Progress')}</div>
                                                    <div className="col-span-2 xl:col-span-2">{t('status', 'Status')}</div>
                                                    <div className="col-span-2 xl:col-span-2">{t('action', 'Action')}</div>
                                                </div>
                                                <CertificateTableRowsSkeleton />
                                            </div>
                                        </div>
                                    </>
                                ) : filtered.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <div className="text-5xl mb-4">🎓</div>
                                        <p className="font-medium text-gray-600">{t('no_certificates', 'No certificates yet')}</p>
                                        <p className="text-sm mt-1">{t('complete_course_earn_cert', 'Complete a course to earn your first certificate!')}</p>
                                        <button onClick={() => navigate('/courses')} className="mt-4 px-6 py-2 bg-[#3758EE] text-white rounded-lg text-sm hover:bg-blue-700 transition-colors cursor-pointer">
                                            {t('browse_courses', 'Browse Courses')}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Small Screens: Cards View (< lg) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                                            {currentData.map((item) => (
                                                <div
                                                    key={item.enrollmentId}
                                                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md hover:border-blue-100 transition-all duration-200 group"
                                                >
                                                    {/* Header: Thumbnail + Course name + Status */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <div className="shrink-0 relative">
                                                                {item.thumbnail ? (
                                                                    <img
                                                                        src={item.thumbnail}
                                                                        alt={item.course}
                                                                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-2xs"
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A892FF] to-[#3758EE] flex items-center justify-center text-white font-bold text-base shadow-2xs">
                                                                        {item.course?.charAt(0) || 'C'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#3758EE] transition-colors" title={item.course}>
                                                                    {t(item.course?.trim(), item.course)}
                                                                </h4>
                                                                {item.title && (
                                                                    <p className="text-gray-400 text-xs truncate mt-0.5" title={item.title}>
                                                                        {t(item.title?.trim(), item.title)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap ${item.status === 'Completed' || item.isCompleted
                                                            ? 'text-blue-600 bg-blue-50 border border-blue-100'
                                                            : (item.status === 'Course Incomplete' || item.isCourseDeleted)
                                                                ? 'text-red-600 bg-red-50 border border-red-200'
                                                                : item.status === 'Active'
                                                                    ? 'text-green-600 bg-green-50 border border-green-100'
                                                                    : 'text-gray-500 bg-gray-100 border border-gray-200'
                                                            }`}>
                                                            {(item.isCourseDeleted || item.status === 'Course Incomplete') && !item.isCompleted
                                                                ? t('course_incomplete', 'Course Incomplete')
                                                                : t(item.status.toLowerCase(), item.status)}
                                                        </span>
                                                    </div>

                                                    {/* Details: Duration & Progress */}
                                                    <div className="bg-gray-50/80 rounded-xl p-3 flex flex-col gap-2.5 border border-gray-100/60">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                                {t('duration', 'Duration')}
                                                            </span>
                                                            <span className="text-gray-700 font-medium">
                                                                {item.startDate} &minus; {item.endDate}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-400 font-medium">{t('progress', 'Progress')}</span>
                                                                <span className="font-bold text-gray-800">{item.progress}%</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-gray-200/80 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
                                                                    style={{ width: `${item.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                                                        {item.isCertEligible ? (
                                                            <>
                                                                {item.certificateUrl ? (
                                                                    <button
                                                                        onClick={() => downloadAsPDF(item.certificateUrl, item.course, item)}
                                                                        disabled={generatingId === item.enrollmentId}
                                                                        className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-[#A892FF] to-[#3758EE] text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all active:scale-95 whitespace-nowrap shadow-sm shadow-purple-200 cursor-pointer disabled:opacity-50"
                                                                    >
                                                                        {generatingId === item.enrollmentId ? (
                                                                            <>
                                                                                <Loader className="w-3.5 h-3.5 animate-spin text-white" />
                                                                                <span>{t('generating', 'Generating...')}</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Download className="w-3.5 h-3.5" />
                                                                                <span>{t('download', 'Download')}</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleGenerateCertificate(item)}
                                                                        disabled={generatingId === item.enrollmentId}
                                                                        className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white text-blue-600 border border-blue-200 text-xs font-bold rounded-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer shadow-2xs"
                                                                    >
                                                                        {generatingId === item.enrollmentId ? (
                                                                            <>
                                                                                <Loader className="w-3.5 h-3.5 animate-spin text-blue-500" />
                                                                                <span>{t('generating', 'Generating...')}</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Lock className="w-3.5 h-3.5" />
                                                                                <span>{t('generate_certificate', 'Generate')}</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}

                                                                {item.hasReviewed ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openViewReview(item)}
                                                                        className="shrink-0 flex items-center justify-center gap-1 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                                                                        title="View Your Submitted Review"
                                                                    >
                                                                        <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-600" />
                                                                        <span>{item.review?.rating || 5}★</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openSubmitReview(item)}
                                                                        className="shrink-0 flex items-center justify-center gap-1 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-2xs"
                                                                        title="Leave a Review"
                                                                    >
                                                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                                                        <span>{t('review', 'Review')}</span>
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : (item.isCourseDeleted || item.status === 'Course Incomplete') ? (
                                                            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl cursor-not-allowed select-none border border-red-200">
                                                                <Lock className="w-3.5 h-3.5 text-red-500" />
                                                                <span>{t('course_incomplete', 'Course Incomplete')}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed select-none border border-gray-100">
                                                                <Lock className="w-3.5 h-3.5" />
                                                                <span>{t('progress_pending', 'Progress Pending')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop / Laptop Table View (lg+) */}
                                        <div className="hidden lg:block w-full overflow-x-auto pb-2 scrollbar-thin">
                                            <div className="w-full min-w-[720px] xl:min-w-0">
                                                {/* Table Header */}
                                                <div className="grid grid-cols-12 gap-3 xl:gap-4 border-b border-gray-100 pb-4 mb-4 text-sm font-semibold text-gray-900 text-center leading-[1.8]">
                                                    <div className="col-span-4 xl:col-span-3 text-left pl-4">{t('courses', 'Courses')}</div>
                                                    <div className="hidden xl:block xl:col-span-2">{t('title', 'Title')}</div>
                                                    <div className="col-span-2 xl:col-span-2 whitespace-nowrap">{t('start_end_date', 'Start & End Date')}</div>
                                                    <div className="col-span-2 xl:col-span-1">{t('progress', 'Progress')}</div>
                                                    <div className="col-span-2 xl:col-span-2">{t('status', 'Status')}</div>
                                                    <div className="col-span-2 xl:col-span-2">{t('action', 'Action')}</div>
                                                </div>

                                                {/* Table Rows */}
                                                <div className="flex flex-col gap-2">
                                                    {currentData.map((item) => (
                                                        <div key={item.enrollmentId} className="border-b border-gray-100 py-4 transition-colors hover:bg-gray-50/50">
                                                            <div className="grid grid-cols-12 gap-3 xl:gap-4 items-center">

                                                                {/* Course Info */}
                                                                <div className="col-span-4 xl:col-span-3 flex items-center gap-3 min-w-0">
                                                                    <div className="shrink-0">
                                                                        {item.thumbnail ? (
                                                                            <img src={item.thumbnail} alt={item.course} className="w-10 h-10 rounded-lg object-cover" />
                                                                        ) : (
                                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A892FF] to-[#3758EE] flex items-center justify-center text-white font-bold text-xs">
                                                                                {item.course?.charAt(0) || 'C'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <span className="block font-medium text-gray-800 truncate text-xs lg:text-sm" title={item.course}>
                                                                            {t(item.course?.trim(), item.course)}
                                                                        </span>
                                                                        {item.title && item.title !== item.course && (
                                                                            <span className="block xl:hidden text-[11px] text-gray-400 truncate mt-0.5" title={item.title}>
                                                                                {t(item.title?.trim(), item.title)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Title (visible on xl screens >= 1280px) */}
                                                                <div className="hidden xl:block xl:col-span-2 text-center min-w-0">
                                                                    <span className="text-gray-600 text-xs lg:text-sm truncate block" title={item.title}>{t(item.title?.trim(), item.title)}</span>
                                                                </div>

                                                                {/* Start & End Date */}
                                                                <div className="col-span-2 xl:col-span-2 text-center text-xs text-gray-500">
                                                                    <span className="block whitespace-nowrap">{item.startDate}</span>
                                                                    <span className="block text-[11px] text-gray-400 whitespace-nowrap mt-0.5">{item.endDate}</span>
                                                                </div>

                                                                {/* Progress */}
                                                                <div className="col-span-2 xl:col-span-1">
                                                                    <div className="flex items-center gap-1.5 xl:gap-2 justify-center w-full">
                                                                        <div className="w-10 lg:w-12 xl:w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.progress}%` }} />
                                                                        </div>
                                                                        <span className="text-xs font-bold text-gray-700 min-w-[28px]">{item.progress}%</span>
                                                                    </div>
                                                                </div>

                                                                {/* Status */}
                                                                <div className="col-span-2 xl:col-span-2 flex justify-center items-center">
                                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${item.status === 'Completed' || item.isCompleted
                                                                        ? 'text-blue-600 bg-blue-50'
                                                                        : (item.status === 'Course Incomplete' || item.isCourseDeleted)
                                                                            ? 'text-red-600 bg-red-50 border border-red-200'
                                                                            : item.status === 'Active'
                                                                                ? 'text-green-600 bg-green-50'
                                                                                : 'text-gray-500 bg-gray-100'
                                                                        }`}>
                                                                        {(item.isCourseDeleted || item.status === 'Course Incomplete') && !item.isCompleted
                                                                            ? t('course_incomplete', 'Course Incomplete')
                                                                            : t(item.status.toLowerCase(), item.status)}
                                                                    </span>
                                                                </div>

                                                                {/* Action */}
                                                                <div className="col-span-2 flex items-center justify-center gap-1.5 flex-wrap">
                                                                    {item.isCertEligible ? (
                                                                        <>
                                                                            {item.certificateUrl ? (
                                                                                <button
                                                                                    onClick={() => downloadAsPDF(item.certificateUrl, item.course, item)}
                                                                                    disabled={generatingId === item.enrollmentId}
                                                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#A892FF] to-[#3758EE] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-50"
                                                                                >
                                                                                    {generatingId === item.enrollmentId ? (
                                                                                        <>
                                                                                            <Loader className="w-3.5 h-3.5 animate-spin text-white" />
                                                                                            {t('generating', 'Generating...')}
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Download className="w-3.5 h-3.5" />
                                                                                            {t('download', 'Download')}
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => handleGenerateCertificate(item)}
                                                                                    disabled={generatingId === item.enrollmentId}
                                                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 border border-blue-200 text-xs font-bold rounded-lg hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                                                                                >
                                                                                    {generatingId === item.enrollmentId ? (
                                                                                        <>
                                                                                            <Loader className="w-3.5 h-3.5 animate-spin text-blue-500" />
                                                                                            {t('generating', 'Generating...')}
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Lock className="w-3.5 h-3.5" />
                                                                                            {t('generate_certificate', 'Generate')}
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            )}

                                                                            {item.hasReviewed ? (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openViewReview(item)}
                                                                                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                                                                                    title="View Your Submitted Review"
                                                                                >
                                                                                    <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-600" />
                                                                                    <span>{item.review?.rating || 5}★ {t('reviewed', 'Reviewed')}</span>
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openSubmitReview(item)}
                                                                                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
                                                                                    title="Leave a Review for this Course Batch"
                                                                                >
                                                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                                                                    <span>{t('review', 'Review')}</span>
                                                                                </button>
                                                                            )}
                                                                        </>
                                                                    ) : (item.isCourseDeleted || item.status === 'Course Incomplete') ? (
                                                                        <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-lg cursor-not-allowed select-none border border-red-200">
                                                                            <Lock className="w-3 h-3 text-red-500" />
                                                                            <span>{t('course_incomplete', 'Course Incomplete')}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed select-none border border-gray-100">
                                                                            <Lock className="w-3 h-3" />
                                                                            <span>{t('progress_pending', 'Progress Pending')}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Pagination */}
                                {!loading && totalPages > 1 && (
                                    <div className="flex justify-end items-center mt-6 w-full">
                                        <CustomPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />
            </div>

            {/* Submit Review Modal */}
            {reviewModalItem && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
                        <button
                            type="button"
                            onClick={() => setReviewModalItem(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                                <Star className="w-5 h-5 fill-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">Review Course</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {reviewModalItem.course} {reviewModalItem.batchName ? `• ${reviewModalItem.batchName}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 mb-4 text-xs text-purple-900 flex items-start gap-2">
                            <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                            <span>
                                Once submitted, your review for this batch completion is permanent and cannot be modified.
                            </span>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            {reviewError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                                    {reviewError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                    Rating (1 to 5 Stars) *
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setReviewRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-7 h-7 ${star <= (hoverRating || reviewRating)
                                                    ? 'fill-amber-400 text-amber-500'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-gray-600 ml-2">
                                        {reviewRating} of 5 Stars
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                    Your Feedback / Comments *
                                </label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={5}
                                    placeholder="Share your detailed thoughts on the course structure, instructor, lectures, and what you learned..."
                                    maxLength={1500}
                                    required
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                                ></textarea>
                                <div className="text-right text-[11px] text-gray-400 mt-1">
                                    {reviewComment.length} / 1500
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReviewModalItem(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="px-5 py-2 bg-gradient-to-r from-[#A892FF] to-[#3758EE] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {submittingReview ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin text-white" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Review'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Review Modal (Read-Only) */}
            {viewReviewModalItem && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
                        <button
                            type="button"
                            onClick={() => setViewReviewModalItem(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">Your Submitted Review</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {viewReviewModalItem.course} {viewReviewModalItem.batchName ? `• ${viewReviewModalItem.batchName}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${star <= (viewReviewModalItem.review?.rating || 5)
                                                ? 'fill-amber-400 text-amber-500'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-semibold text-gray-400">
                                    {viewReviewModalItem.review?.createdAt ? new Date(viewReviewModalItem.review.createdAt).toLocaleDateString() : ''}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {viewReviewModalItem.review?.comment || ''}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5" /> Permanent verified review (Cannot be edited)
                            </span>
                            <button
                                type="button"
                                onClick={() => setViewReviewModalItem(null)}
                                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificates;