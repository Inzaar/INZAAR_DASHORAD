import React from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const CertificateStatsCard = ({ title, value, trend, description, trendColor = "text-[#00C896]", trendBg = "bg-[#E6F9F4]" }) => {
    return (
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col justify-between w-full h-[125px] overflow-hidden font-sans">
            <h3 className="text-gray-900 text-[12px] font-bold line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-gray-900 leading-none">{value}</span>
                {trend && (
                    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center", trendBg, trendColor)}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-[9px] text-gray-400 font-medium leading-tight line-clamp-2">
                {description}
            </p>
        </div>
    );
};

const StudentCertificates = ({ profileData }) => {
    const stats = [
        {
            title: "Total Courses Completed",
            value: "8 Courses",
            trend: "+12%",
            description: "All courses you have successfully finished."
        },
        {
            title: "Certificates Available",
            value: "5 Certificates",
            trend: "+2%",
            description: "Certificates ready for you to download and share.",
            trendColor: "text-emerald-500",
            trendBg: "bg-emerald-50"
        },
        {
            title: "Courses In Progress",
            value: "3 Courses In Progress",
            trend: "+10%",
            description: "Courses you are currently enrolled in but not yet completed.",
            trendColor: "text-emerald-500",
            trendBg: "bg-emerald-50"
        },
        {
            title: "Locked Certificates",
            value: "3 Locked Certificates",
            trend: null,
            description: "Certificates that will unlock upon 100% completion of their course."
        }
    ];

    const certificates = [
        {
            course: "Dora Quran Course (Only in Ramzan)",
            lectures: "13/10",
            startDate: "05-Feb-2025",
            endDate: "05-May-2025",
            progress: "88%",
            status: "Completed"
        },
        {
            course: "Stress Management Course",
            lectures: "13/10",
            startDate: "05-Feb-2025",
            endDate: "05-May-2025",
            progress: "90%",
            status: "Completed"
        },
        {
            course: "Akhrat kay Dalail aur Ahwal e Akhrat Course",
            lectures: "13/10",
            startDate: "05-Feb-2025",
            endDate: "05-May-2025",
            progress: "44%",
            status: "Active"
        },
        {
            course: "Stress Management Course",
            lectures: "13/10",
            startDate: "05-Feb-2025",
            endDate: "05-May-2025",
            progress: "65%",
            status: "Active"
        }
    ];

    return (
        <div className="flex flex-col gap-8 font-sans py-2">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 justify-items-center">
                {stats.map((stat, i) => (
                    <CertificateStatsCard key={i} {...stat} />
                ))}
            </div>

            {/* Main Content Area: Certificates List Table */}
            <div className="bg-white border border-gray-100 rounded-[16px] shadow-sm overflow-hidden">
                <div className="p-6">
                    {/* Header: Title and Search */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Certificates List</h3>
                            <p className="text-xs text-gray-400 mt-1">Manage your Certificates</p>
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
                            <button className="bg-[#6366F1] text-white px-4 sm:px-8 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 whitespace-nowrap">
                                <Search size={18} /> <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-gray-800 font-bold uppercase border-b border-gray-50/50">
                                    <th className="text-left py-4 px-6 font-bold w-[30%]">Courses</th>
                                    <th className="text-center py-4 px-4 font-bold">Lectures</th>
                                    <th className="text-center py-4 px-4 font-bold">Start & End Date</th>
                                    <th className="text-center py-4 px-4 font-bold">Progress</th>
                                    <th className="text-center py-4 px-4 font-bold">Status</th>
                                    <th className="text-right py-4 px-6 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/30">
                                {certificates.map((cert, i) => (
                                    <tr key={i} className="hover:bg-gray-50/30 transition-colors text-sm text-gray-600">
                                        <td className="py-6 px-6">
                                            <div className="font-medium text-gray-800 leading-tight">
                                                {cert.course}
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-center font-medium">{cert.lectures}</td>
                                        <td className="py-6 px-4 text-center">
                                            <div className="flex flex-col gap-0.5 whitespace-nowrap text-[12px]">
                                                <span className="text-gray-800 font-medium">{cert.startDate}</span>
                                                <span className="text-gray-400">{cert.endDate}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-center">
                                            <span className="font-medium text-gray-800">{cert.progress}</span>
                                        </td>
                                        <td className="py-6 px-4 text-center">
                                            <span className={cn(
                                                "text-[12px] font-medium transition-colors",
                                                cert.status === 'Completed' ? 'text-blue-500 font-bold' : 'text-emerald-400 font-bold'
                                            )}>
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td className="py-6 px-6 text-right">
                                            <button className="text-gray-900 font-bold hover:text-gray-600">
                                                <MoreHorizontal size={24} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-end items-center gap-2 mt-12 pb-4">
                        <button className="flex items-center gap-1 text-[13px] font-medium text-gray-400 hover:text-gray-800">
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium text-gray-400 hover:bg-gray-100">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold bg-[#6366F1] text-white shadow-lg shadow-blue-500/30">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium text-gray-400 hover:bg-gray-100">3</button>
                        <span className="text-gray-300 px-1">...</span>
                        <button className="flex items-center gap-1 text-[13px] font-medium text-gray-800 hover:text-gray-900">
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default StudentCertificates;
