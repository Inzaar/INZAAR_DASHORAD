import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Lock, Eye, FileText } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import axiosInstance from '@/api/axiosInstance';
import { Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CertificateCard from '@/features/courses/components/CertificateCard';

const Certificates = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
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

    const openAsPDF = async (imgUrl) => {
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
                const pdfBlob = doc.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                window.open(url, '_blank');
            };
        } catch (e) {
            console.error('PDF Open failed:', e);
            alert("Failed to open PDF.");
        }
    };

    const handleGenerateCertificate = async (enrollment) => {
        if (generatingId) return;
        setGeneratingId(enrollment.enrollmentId);

        try {
            const studentName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Student';

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
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1, 2, 3, '...', totalPages);
        }
        return pages;
    };

    const metricCards = [
        { label: 'Total Courses Completed', value: metrics.totalCoursesCompleted.count, sub: 'Courses', change: '', desc: 'All courses you have successfully finished.' },
        { label: 'Certificates Available', value: metrics.certificatesAvailable.count, sub: 'Certificates', change: '', desc: 'Certificates ready for you to download and share.' },
        { label: 'Courses In Progress', value: metrics.coursesInProgress.count, sub: 'Courses In Progress', change: '', desc: 'Courses you are currently enrolled in but not yet completed.' },
        { label: 'Locked Certificates', value: metrics.lockedCertificates.count, sub: 'Locked Certificates', change: '', desc: 'Certificates that will unlock upon 100% completion of their course.' },
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
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader className="w-8 h-8 text-[#3758EE] animate-spin" />
                            </div>
                        ) : (
                            <div className="py-4 pr-2 flex flex-col gap-6">

                                {/* ── Metric Cards ── */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {metricCards.map((metric, index) => (
                                        <div key={index} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between h-full">
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
                                                <h2 className="text-xl font-bold text-gray-900">Certificates List</h2>
                                                <p className="text-gray-500 text-sm">Manage your Certificates</p>
                                            </div>
                                            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                                <div className="relative w-full md:w-[300px]">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                    <input
                                                        type="text"
                                                        value={search}
                                                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                                        placeholder="Search certificate by Course name"
                                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                                <GradiantButton className={"py-2 px-4 rounded"}>
                                                    <Search className="h-4 w-4" />
                                                    Search
                                                </GradiantButton>
                                            </div>
                                        </div>
                                    </div>

                                    {filtered.length === 0 ? (
                                        <div className="text-center py-16 text-gray-400">
                                            <div className="text-5xl mb-4">🎓</div>
                                            <p className="font-medium text-gray-600">No certificates yet</p>
                                            <p className="text-sm mt-1">Complete a course to earn your first certificate!</p>
                                            <button onClick={() => navigate('/courses')} className="mt-4 px-6 py-2 bg-[#3758EE] text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                                Browse Courses
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full overflow-hidden">
                                            <div className="w-full">
                                                {/* Table Header - Desktop Only */}
                                                <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-100 pb-4 mb-4 text-sm font-semibold text-gray-900 text-center">
                                                    <div className="col-span-3 text-left pl-4">Courses</div>
                                                    <div className="col-span-2">Title</div>
                                                    <div className="col-span-2">Start & End Date</div>
                                                    <div className="col-span-2">Progress</div>
                                                    <div className="col-span-1">Status</div>
                                                    <div className="col-span-2">Action</div>
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
                                                                            {item.course}
                                                                        </span>
                                                                        <span className="md:hidden text-xs text-gray-500">Course</span>
                                                                    </div>
                                                                </div>

                                                                {/* Title - Desktop only or as secondary info on mobile */}
                                                                <div className="md:col-span-2 text-left md:text-center">
                                                                    <span className="md:hidden text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-0.5">Title</span>
                                                                    <span className="text-gray-600 text-sm md:text-xs lg:text-sm truncate block">{item.title}</span>
                                                                </div>

                                                                {/* Start & End Date */}
                                                                <div className="md:col-span-2 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-center gap-2">
                                                                    <div className="md:hidden">
                                                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Duration</span>
                                                                    </div>
                                                                    <div className="text-right md:text-center text-[11px] md:text-[10px] lg:text-xs text-gray-500">
                                                                        <span className="md:block">{item.startDate}</span>
                                                                        <span className="hidden md:block"> - </span>
                                                                        <span className="md:block">{item.endDate}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Progress */}
                                                                <div className="md:col-span-2">
                                                                    <div className="flex flex-row md:flex-col items-center md:justify-center gap-3 md:gap-1">
                                                                        <div className="md:hidden shrink-0">
                                                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Progress</span>
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
                                                                <div className="md:col-span-1 flex justify-between md:justify-center items-center">
                                                                    <span className="md:hidden text-[10px] uppercase tracking-wider text-gray-400 font-bold">Status</span>
                                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.status === 'Completed'
                                                                        ? 'text-blue-600 bg-blue-50'
                                                                        : item.status === 'Active'
                                                                            ? 'text-green-600 bg-green-50'
                                                                            : 'text-gray-500 bg-gray-100'
                                                                        }`}>
                                                                        {item.status}
                                                                    </span>
                                                                </div>

                                                                {/* Action */}
                                                                <div className="md:col-span-2 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-gray-50 flex justify-center">
                                                                    {item.status === 'Completed' ? (
                                                                        item.certificateUrl ? (
                                                                            <button
                                                                                onClick={() => downloadAsPDF(item.certificateUrl, item.course)}
                                                                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-3 py-2.5 md:py-1.5 bg-gradient-to-r from-[#A892FF] to-[#3758EE] text-white text-xs font-bold rounded-xl md:rounded-lg hover:opacity-90 transition-all active:scale-95 whitespace-nowrap shadow-md md:shadow-none shadow-purple-200"
                                                                            >
                                                                                <Download className="w-4 h-4 md:w-3 md:h-3" />
                                                                                Download
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleGenerateCertificate(item)}
                                                                                disabled={generatingId === item.enrollmentId}
                                                                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-4 py-2.5 md:py-1.5 bg-white text-blue-600 border border-blue-200 text-xs font-bold rounded-xl md:rounded-lg hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                                                                            >
                                                                                {generatingId === item.enrollmentId ? (
                                                                                    <>
                                                                                        <Loader className="w-4 h-4 animate-spin text-blue-500" />
                                                                                        Generating...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Lock className="w-4 h-4" />
                                                                                        Generate Certificate
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                        )
                                                                    ) : (
                                                                        <div className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-3 py-2.5 md:py-1.5 bg-gray-50 text-gray-400 text-xs font-bold rounded-xl md:rounded-lg cursor-not-allowed select-none border border-gray-100">
                                                                            <Lock className="w-4 h-4 md:w-3 md:h-3" />
                                                                            Progress Pending
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
                                        <PaginationContent className="w-full h-10 mt-6 flex items-center justify-end">
                                            <PaginationItem>
                                                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={`cursor-pointer ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`} />
                                            </PaginationItem>
                                            {getPageNumbers().map((page, index) => (
                                                <PaginationItem key={index}>
                                                    {page === '...' ? (
                                                        <PaginationEllipsis />
                                                    ) : (
                                                        <PaginationLink
                                                            onClick={() => handlePageChange(page)}
                                                            isActive={page === currentPage}
                                                            className={`cursor-pointer ${page === currentPage ? "bg-linear-to-r from-[#A892FF] to-[#6C5DDC] text-white hover:bg-[#6C5DDC] hover:text-white" : ""}`}
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    )}
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={`cursor-pointer ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`} />
                                            </PaginationItem>
                                        </PaginationContent>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />
            </div>
        </div>
    );
};

export default Certificates;