import { CustomPagination } from '@/components/ui/Pagination';
import React, { useEffect, useState } from 'react';
import { Search, Download, Lock, Loader } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import axiosInstance from '@/api/axiosInstance';
import CertificateCard from '@/features/courses/components/CertificateCard';
import { useTranslation } from 'react-i18next';

const StudentCertificates = ({ profileData }) => {
    const { t } = useTranslation();
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

    const itemsPerPage = 5;
    useEffect(() => {
        const fetchCertificates = async () => {
            if (!profileData?.user?._id) return;
            setLoading(true);
            try {
                const res = await axiosInstance.get('/enrollments/my-certificates', { 
                    params: { userId: profileData.user._id },
                    withCredentials: true 
                });
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
    }, [profileData]);

    const downloadAsPDF = async (imgUrl, courseName) => {
        try {
            const { jsPDF } = await import('jspdf');
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imgUrl;
            img.onload = () => {
                const doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [1122, 794]
                });
                doc.addImage(img, 'PNG', 0, 0, 1122, 794);
                doc.save(`Certificate_${courseName.replace(/\s+/g, '_')}.pdf`);
            };
        } catch (e) {
            console.error('PDF Download failed:', e);
            alert("PDF generation failed. Please try again.");
        }
    };



    const handleGenerateCertificate = async (enrollment) => {
        if (generatingId) return;
        setGeneratingId(enrollment.enrollmentId);

        try {
            const studentName = `${profileData?.user?.firstname || ''} ${profileData?.user?.lastname || ''}`.trim() || 'Student';

            setCertData({
                studentName,
                courseName: enrollment.course,
                completedAt: enrollment.endDate !== 'N/A' && enrollment.endDate !== 'In Progress'
                    ? new Date(enrollment.endDate).toISOString()
                    : new Date().toISOString(),
                templateUrl: enrollment.certificateTemplate
            });

            // wait for the hidden card to render
            await new Promise(r => setTimeout(r, 100));

            const { toBlob } = await import('html-to-image');
            const blob = await toBlob(certCardRef.current, {
                pixelRatio: 1, // Standard resolution to ensure small file size and prevent Network Errors
                cacheBust: true,
                style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });

            if (!blob) throw new Error("Failed to generate image blob");

            try {
                console.log('Generating certificate for enrollment:', enrollment);
                const { uploadImage, saveCertificate } = await import('@/api/course');
                const uploaded = await uploadImage(new File([blob], 'certificate.png', { type: 'image/png' }));
                console.log('Uploaded certificate image:', uploaded.url);

                await saveCertificate(enrollment.courseId, uploaded.url);

                // Update UI
                setAllCertificates(prev => prev.map(c =>
                    c.enrollmentId === enrollment.enrollmentId
                        ? { ...c, certificateUrl: uploaded.url }
                        : c
                ));

                // Update metrics
                setMetrics(prev => ({
                    ...prev,
                    certificatesAvailable: { count: prev.certificatesAvailable.count + 1 },
                    lockedCertificates: { count: Math.max(0, prev.lockedCertificates.count - 1) }
                }));

            } catch (e) {
                console.error('Upload/Save side failed:', e);
                alert(`Failed to save certificate: ${e.response?.data?.message || e.message}`);
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
        <div className="w-full font-sans text-slate-800">
            {/* Hidden Certificate Generator Card */}
            {certData && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1, width: '1122px', height: '794px', overflow: 'hidden' }}>
                    <CertificateCard
                        ref={certCardRef}
                        studentName={certData.studentName}
                        courseName={certData.courseName}
                        completedAt={certData.completedAt}
                        templateUrl={certData.templateUrl}
                    />
                </div>
            )}

            <div className="w-full">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader className="w-8 h-8 text-[#3758EE] animate-spin" />
                            </div>
                        ) : (
                            <div className="py-4 pr-2 flex flex-col gap-6">

                                {/* ── Metric Cards ── */}
                                <div className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto pb-2 scrollbar-thin lg:overflow-visible">
                                    {metricCards.map((metric, index) => (
                                        <div key={index} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between h-full min-w-[250px] sm:min-w-[280px] lg:min-w-0 flex-shrink-0 lg:flex-shrink">
                                            <div>
                                                <h3 className="text-gray-900 font-semibold mb-2">{metric.label}</h3>
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                                                    <span className="text-xs font-medium text-gray-500">{metric.sub}</span>
                                                    {metric.change && (
                                                        <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded">{metric.change}</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-400 text-[11px] leading-tight">{metric.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Certificates Table ── */}
                                <div className="bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm">
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
                                                <GradiantButton className={"h-[40px] px-3 md:px-4 rounded"}>
                                                    <Search className="h-4 w-4" />
                                                    <span className="hidden md:inline">{t('search', 'Search')}</span>
                                                </GradiantButton>
                                            </div>
                                        </div>
                                    </div>

                                    {filtered.length === 0 ? (
                                        <div className="text-center py-16 text-gray-400">
                                            <div className="text-5xl mb-4">🎓</div>
                                            <p className="font-medium text-gray-600">{t('no_certificates', 'No certificates yet')}</p>
                                            <p className="text-sm mt-1">{t('complete_course_earn_cert', 'Complete a course to earn your first certificate!')}</p>
                                            <div className="text-sm mt-1">{t('complete_course_earn_cert', 'Complete a course to earn your first certificate!')}</div>
                                        </div>
                                    ) : (
                                        <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                                            <div className="w-full min-w-[960px]">
                                                {/* Table Header - Desktop Only */}
                                                <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-100 pb-4 mb-4 text-sm font-semibold text-gray-900 text-center leading-[1.8]">
                                                    <div className="col-span-3 text-left pl-4">{t('courses', 'Courses')}</div>
                                                    <div className="col-span-2">{t('title', 'Title')}</div>
                                                    <div className="col-span-2">{t('start_end_date', 'Start & End Date')}</div>
                                                    <div className="col-span-1">{t('progress', 'Progress')}</div>
                                                    <div className="col-span-2">{t('status', 'Status')}</div>
                                                    <div className="col-span-2">{t('action', 'Action')}</div>
                                                </div>

                                                {/* Table Rows / Mobile Cards */}
                                                <div className="flex flex-col gap-4 md:gap-2">
                                                    {currentData.map((item) => (
                                                        <div key={item.enrollmentId} className="bg-white md:bg-transparent border md:border-0 md:border-b border-gray-100 rounded-xl md:rounded-none p-4 md:p-0 md:py-4 transition-colors hover:bg-gray-50/50">
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                                                                {/* Course Info */}
                                                                <div className="md:col-span-3 flex items-center gap-3 min-w-0">
                                                                    <div className="shrink-0">
                                                                        {item.thumbnail ? (
                                                                            <img src={item.thumbnail} alt={item.course} className="w-10 h-10 md:w-8 md:h-8 rounded-lg object-cover" />
                                                                        ) : (
                                                                            <div className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-[#A892FF] to-[#3758EE]" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="block font-bold md:font-medium text-gray-900 md:text-gray-800 truncate text-sm md:text-xs lg:text-sm">
                                                                            {t(item.course?.trim(), item.course)}
                                                                        </span>
                                                                        <span className="md:hidden text-xs text-gray-500">{t('course', 'Course')}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Title - Desktop only or as secondary info on mobile */}
                                                                <div className="md:col-span-2 text-left md:text-center">
                                                                    <span className="md:hidden text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-0.5">{t('title', 'Title')}</span>
                                                                    <span className="text-gray-600 text-sm md:text-xs lg:text-sm truncate block">{t(item.title?.trim(), item.title)}</span>
                                                                </div>

                                                                {/* Start & End Date */}
                                                                <div className="md:col-span-2 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-center gap-2">
                                                                    <div className="md:hidden">
                                                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">{t('duration', 'Duration')}</span>
                                                                    </div>
                                                                    <div className="text-right md:text-center text-[11px] md:text-[10px] lg:text-xs text-gray-500">
                                                                        <span className="md:block">{item.startDate}</span>
                                                                        <span className="hidden md:block"> - </span>
                                                                        <span className="md:block">{item.endDate}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Progress */}
                                                                <div className="md:col-span-1">
                                                                    <div className="flex flex-row md:flex-col items-center md:justify-center gap-3 md:gap-1">
                                                                        <div className="md:hidden shrink-0">
                                                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{t('progress', 'Progress')}</span>
                                                                        </div>
                                                                        <div className="flex-1 md:flex-initial flex items-center gap-2 justify-end md:justify-center w-full">
                                                                            <div className="w-full md:w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.progress}%` }} />
                                                                            </div>
                                                                            <span className="text-xs font-bold text-gray-700 min-w-[32px]">{item.progress}%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Status */}
                                                                <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                                                                    <span className="md:hidden text-[10px] uppercase tracking-wider text-gray-400 font-bold">{t('status', 'Status')}</span>
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
                                                                <div className="md:col-span-2 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-gray-50 flex justify-center">
                                                                    {item.status === 'Completed' || item.isCompleted ? (
                                                                        item.certificateUrl ? (
                                                                            <button
                                                                                onClick={() => downloadAsPDF(item.certificateUrl, item.course)}
                                                                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-3 py-2.5 md:py-1.5 bg-gradient-to-r from-[#A892FF] to-[#3758EE] text-white text-xs font-bold rounded-xl md:rounded-lg hover:opacity-90 transition-all active:scale-95 whitespace-nowrap shadow-md md:shadow-none shadow-purple-200 cursor-pointer"
                                                                            >
                                                                                <Download className="w-4 h-4 md:w-3 md:h-3" />
                                                                                {t('download', 'Download')}
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleGenerateCertificate(item)}
                                                                                disabled={generatingId === item.enrollmentId}
                                                                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-4 py-2.5 md:py-1.5 bg-white text-blue-600 border border-blue-200 text-xs font-bold rounded-xl md:rounded-lg hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                                                                            >
                                                                                {generatingId === item.enrollmentId ? (
                                                                                    <>
                                                                                        <Loader className="w-4 h-4 animate-spin text-blue-500" />
                                                                                        {t('generating', 'Generating...')}
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Lock className="w-4 h-4" />
                                                                                        {t('generate_certificate', 'Generate Certificate')}
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                        )
                                                                    ) : (item.isCourseDeleted || item.status === 'Course Incomplete') ? (
                                                                        <div className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-3 py-2.5 md:py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl md:rounded-lg cursor-not-allowed select-none border border-red-200">
                                                                            <Lock className="w-4 h-4 md:w-3 md:h-3 text-red-500" />
                                                                            {t('course_incomplete', 'Course Incomplete')}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-3 py-2.5 md:py-1.5 bg-gray-50 text-gray-400 text-xs font-bold rounded-xl md:rounded-lg cursor-not-allowed select-none border border-gray-100">
                                                                            <Lock className="w-4 h-4 md:w-3 md:h-3" />
                                                                            {t('progress_pending', 'Progress Pending')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="w-full h-10 mt-auto pt-6 pb-2 flex items-center justify-end">
                                            <CustomPagination 
                                                currentPage={currentPage} 
                                                totalPages={totalPages} 
                                                onPageChange={handlePageChange} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
            </div>
        </div>
    );
};

export default StudentCertificates;