import React, { useState, useRef } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Download, Lock, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import CertificateCard from '@/features/courses/components/CertificateCard';
import { toBlob } from 'html-to-image';
import { uploadImage } from '@/api/course';
import axiosInstance from '@/api/axiosInstance';
import toast from 'react-hot-toast';

const CertificateStatsCard = ({ title, value, trend, description, trendColor = "text-[#00C896]", trendBg = "bg-[#E6F9F4]" }) => {
    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between w-full h-[140px] overflow-hidden font-sans">
            <h3 className="text-gray-900 text-sm font-bold line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 leading-none">{value}</span>
                {trend && (
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold flex items-center", trendBg, trendColor)}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-[11px] text-gray-400 font-medium leading-tight line-clamp-2">
                {description}
            </p>
        </div>
    );
};

const StudentCertificates = ({ profileData }) => {
    const enrolledCourses = profileData?.enrolledCourses || [];
    const [generatingId, setGeneratingId] = useState(null);
    const certCardRef = useRef(null);
    const [certDraft, setCertDraft] = useState(null);
    
    // Calculate dynamic stats
    const totalCompleted = enrolledCourses.filter(c => c.isCompleted).length;
    const certsAvailable = enrolledCourses.filter(c => c.certificateUrl).length;
    const inProgress = enrolledCourses.filter(c => !c.isCompleted).length;
    const lockedCerts = enrolledCourses.filter(c => c.isCompleted && !c.certificateUrl).length;

    const fmtDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

    const handleGenerate = async (course) => {
        if (generatingId) return;
        setGeneratingId(course.id);
        const toastId = toast.loading(`Generating certificate for ${course.title}...`);

        try {
            const studentName = `${profileData?.user?.firstname || ''} ${profileData?.user?.lastname || ''}`.trim() || 'Student';
            
            setCertDraft({
                studentName,
                courseName: course.title,
                completedAt: course.completedAt || new Date(),
                templateUrl: course.certificateTemplate
            });

            await new Promise(r => setTimeout(r, 150));

            const blob = await toBlob(certCardRef.current, {
                pixelRatio: 2,
                cacheBust: true,
                style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });

            if (!blob) throw new Error("Capture failed");

            const uploaded = await uploadImage(new File([blob], 'certificate.png', { type: 'image/png' }));
            await axiosInstance.patch(`/enrollments/${course.id}`, { certificateUrl: uploaded.url });

            toast.success("Certificate generated and saved!", { id: toastId });
            course.certificateUrl = uploaded.url;
            
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate certificate", { id: toastId });
        } finally {
            setGeneratingId(null);
            setCertDraft(null);
        }
    };

    const stats = [
        {
            title: "Total Courses Completed",
            value: `${totalCompleted} Courses`,
            trend: "+12%",
            description: "All courses successfully finished by the student."
        },
        {
            title: "Certificates Available",
            value: `${certsAvailable} Certificates`,
            trend: "+2%",
            description: "Certificates generated and ready for retrieval.",
            trendColor: "text-emerald-500",
            trendBg: "bg-emerald-50"
        },
        {
            title: "Courses In Progress",
            value: `${inProgress} Courses`,
            trend: "+10%",
            description: "Courses currently active but not yet finalized.",
            trendColor: "text-emerald-500",
            trendBg: "bg-emerald-50"
        },
        {
            title: "Locked Certificates",
            value: `${lockedCerts} Locked`,
            trend: null,
            description: "Completed courses awaiting certificate generation."
        }
    ];

    return (
        <div className="flex flex-col gap-8 font-sans py-2 relative">
            {/* Hidden Generator */}
            {certDraft && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
                    <CertificateCard
                        ref={certCardRef}
                        studentName={certDraft.studentName}
                        courseName={certDraft.courseName}
                        completedAt={certDraft.completedAt}
                        templateUrl={certDraft.templateUrl}
                    />
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-4">
                {stats.map((stat, i) => (
                    <CertificateStatsCard key={i} {...stat} />
                ))}
            </div>

            {/* Main Content Area: Certificates List Table */}
            <div className="bg-white border border-gray-100 rounded-[16px] shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">Certificates List</h3>
                            <p className="text-xs text-gray-400 mt-1">Manage student credentials</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-grow sm:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search certificate by Course name"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-300"
                                />
                            </div>
                            <button className="bg-[#6366F1] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Search size={16} />
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto pr-1 scrollbar-thin custom-scrollbar-thin">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#F9FAFB] backdrop-blur-sm sticky top-0 z-10">
                                <tr className="text-sm text-gray-900 font-bold border-b border-gray-100">
                                    <th className="py-4 px-6">Courses</th>
                                    <th className="py-4 px-4 text-center">Title</th>
                                    <th className="py-4 px-4 text-center">Start & End Date</th>
                                    <th className="py-4 px-4 text-center">Progress</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-6 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {enrolledCourses.length > 0 ? enrolledCourses.map((cert, i) => (
                                    <tr key={i} className="hover:bg-gray-50/30 transition-colors text-sm text-gray-600">
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                    <img src={cert.thumbnail || "/placeholder.jpg"} className="w-full h-full object-cover" alt="course" />
                                                </div>
                                                <div className="font-bold text-gray-900">{cert.title}</div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-center text-gray-500 font-medium whitespace-nowrap">
                                            {cert.title}
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[12px] font-medium text-gray-400">{fmtDate(cert.createdAt || new Date())}</span>
                                                <span className="text-[12px] font-medium text-gray-400">
                                                    {cert.isCompleted ? fmtDate(cert.completedAt || new Date()) : "In Progress"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex items-center gap-3 justify-center">
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#00C896] rounded-full transition-all duration-500" 
                                                        style={{ width: `${cert.progress}%` }} 
                                                    />
                                                </div>
                                                <span className="font-bold text-gray-900 text-xs">{cert.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <span className={cn(
                                                "text-[12px] font-bold px-4 py-1 rounded-full",
                                                cert.isCompleted ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 bg-gray-50'
                                            )}>
                                                {cert.isCompleted ? 'Completed' : 'Not Started'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            {cert.certificateUrl ? (
                                                <a 
                                                    href={cert.certificateUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center gap-2 bg-[#818CF8] hover:bg-[#6366F1] text-white font-bold py-2 px-6 rounded-lg text-xs transition-all shadow-md active:scale-95"
                                                >
                                                    <Download size={14} />
                                                    Download
                                                </a>
                                            ) : cert.isCompleted ? (
                                                <button 
                                                    onClick={() => handleGenerate(cert)}
                                                    disabled={generatingId === cert.id}
                                                    className="inline-flex items-center gap-2 bg-[#818CF8] hover:bg-[#6366F1] text-white font-bold py-2 px-4 rounded-lg text-xs transition-all disabled:opacity-50"
                                                >
                                                    {generatingId === cert.id ? (
                                                        <Loader className="animate-spin" size={14} />
                                                    ) : (
                                                        <Download size={14} />
                                                    )}
                                                    Generate now
                                                </button>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 bg-gray-100/50 text-gray-300 font-bold py-2 px-6 rounded-lg text-xs cursor-not-allowed">
                                                    <Lock size={14} />
                                                    Pending
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-gray-400 italic font-medium">No course certificates found for this student.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-thin::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}} />
        </div>
    );
};

export default StudentCertificates;
