import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Lock } from 'lucide-react';
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
                pixelRatio: 2,
                cacheBust: true,
                style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });

            if (!blob) throw new Error("Failed to generate image blob");

            try {
                const { uploadImage, saveCertificate } = await import('@/api/course');
                const uploaded = await uploadImage(new File([blob], 'certificate.png', { type: 'image/png' }));
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
                console.error('Upload side failed:', e);
                alert("Failed to save certificate. Please try again.");
            } finally {
                setGeneratingId(null);
                setCertData(null);
            }

        } catch (e) {
            console.error('Generation failed:', e);
            alert("Failed to generate certificate.");
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
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1, backgroundColor: 'transparent', color: 'initial' }}>
                    {/* We need to import CertificateCard or render it. We'll require importing it at the top */}
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

                                    {currentData.length === 0 ? (
                                        <div className="text-center py-16 text-gray-400">
                                            <div className="text-5xl mb-4">🎓</div>
                                            <p className="font-medium text-gray-600">No certificates yet</p>
                                            <p className="text-sm mt-1">Complete a course to earn your first certificate!</p>
                                            <button onClick={() => navigate('/courses')} className="mt-4 px-6 py-2 bg-[#3758EE] text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                                Browse Courses
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <div className="min-w-[900px]">

                                                {/* Table Header — same 6 columns as original */}
                                                <div className="grid grid-cols-12 gap-4 border-b border-gray-100 pb-4 mb-4 text-sm font-semibold text-gray-900 text-center">
                                                    <div className="col-span-3 text-left pl-4">Courses</div>
                                                    <div className="col-span-2">Title</div>
                                                    <div className="col-span-2">Start &amp; End Date</div>
                                                    <div className="col-span-2">Progress</div>
                                                    <div className="col-span-2">Status</div>
                                                    <div className="col-span-1">Action</div>
                                                </div>

                                                {/* Table Rows */}
                                                <div className="flex flex-col gap-2">
                                                    {currentData.map((item) => (
                                                        <div key={item.enrollmentId} className="grid grid-cols-12 gap-4 items-center py-4 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">

                                                            {/* Courses */}
                                                            <div className="col-span-3 text-left pl-4 font-medium text-gray-800 flex items-center gap-2">
                                                                {item.thumbnail ? (
                                                                    <img src={item.thumbnail} alt={item.course} className="w-8 h-8 rounded object-cover shrink-0" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#A892FF] to-[#3758EE] shrink-0" />
                                                                )}
                                                                <span className="truncate">{item.course}</span>
                                                            </div>

                                                            {/* Title */}
                                                            <div className="col-span-2 text-center text-gray-600">{item.title}</div>

                                                            {/* Start & End Date */}
                                                            <div className="col-span-2 text-center flex flex-col text-xs text-gray-500">
                                                                <span>{item.startDate}</span>
                                                                <span>{item.endDate}</span>
                                                            </div>

                                                            {/* Progress */}
                                                            <div className="col-span-2 text-center font-medium">
                                                                <div className="flex items-center gap-2 justify-center">
                                                                    <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.progress}%` }} />
                                                                    </div>
                                                                    <span>{item.progress}%</span>
                                                                </div>
                                                            </div>

                                                            {/* Status */}
                                                            <div className="col-span-2 text-center">
                                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.status === 'Completed'
                                                                    ? 'text-blue-600 bg-blue-50'
                                                                    : item.status === 'Active'
                                                                        ? 'text-green-600 bg-green-50'
                                                                        : 'text-gray-500 bg-gray-100'
                                                                    }`}>
                                                                    {item.status}
                                                                </span>
                                                            </div>

                                                            {/* Action — Download only for completed courses */}
                                                            <div className="col-span-1 flex justify-center">
                                                                {item.status === 'Completed' ? (
                                                                    item.certificateUrl ? (
                                                                        <a
                                                                            href={item.certificateUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            download
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#A892FF] to-[#3758EE] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                                                                        >
                                                                            <Download className="w-3 h-3" />
                                                                            Download
                                                                        </a>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleGenerateCertificate(item)}
                                                                            disabled={generatingId === item.enrollmentId}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 border border-blue-200 text-xs font-medium rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                                                                        >
                                                                            {generatingId === item.enrollmentId ? (
                                                                                <>
                                                                                    <Loader className="w-3 h-3 animate-spin text-blue-500" />
                                                                                    Generating
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Lock className="w-3 h-3" />
                                                                                    Generate Now
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    )
                                                                ) : (
                                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 text-xs rounded-lg cursor-not-allowed select-none whitespace-nowrap">
                                                                        <Lock className="w-3 h-3" />
                                                                        Pending
                                                                    </span>
                                                                )}
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