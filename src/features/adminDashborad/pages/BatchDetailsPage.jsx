import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate, useParams } from 'react-router-dom';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import MetricCard from '@/components/shared/MetricCard';
import OverviewCard from '@/components/shared/OverviewCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import Loader from '@/components/ui/Loader';
import { getBatchById } from '@/api/batch';
import { CustomPagination } from '@/components/ui/Pagination';

const BatchDetailsPage = ({ isMyBatches = false }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const { id } = useParams();
    const [batchData, setBatchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [id]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const res = await getBatchById(id, isMyBatches);
                setBatchData(res);
            } catch (error) {
                console.error("Failed to fetch batch details", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id, isMyBatches]);

    const handleGroupClick = (group) => {
        navigate(isMyBatches ? `/my-batches/groups/${group._id}/students?name=${encodeURIComponent(group.name)}` : `/admin-batches/groups/${group._id}/students?name=${encodeURIComponent(group.name)}`);
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans bg-[#F8F9FA]">
            <div className="relative w-full max-w-[1920px] mx-auto flex flex-col h-screen overflow-hidden gap-2 sm:gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-2 sm:px-4 gap-3 sm:gap-4 flex-1 overflow-hidden relative min-h-0 pb-4'>
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 lg:static lg:block fixed left-0 top-0 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} 
                    />
                    
                    <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar pb-6 sm:pb-10 min-h-0">
                        <div className="py-2 sm:py-4 px-1 sm:px-2">
                            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 min-w-0">
                                <h2
                                    className="text-[16px] min-[380px]:text-[18px] sm:text-[22px] xl:text-[24px] font-bold text-gray-900 truncate min-w-0"
                                    title={batchData?.name || "Batch Details"}
                                >
                                    {batchData?.name || "Batch Details"}
                                </h2>
                                <GradiantButton
                                    onClick={() => navigate(-1)}
                                    className="bg-[#A892FF] hover:bg-[#937aff] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-[6px] text-xs sm:text-sm font-medium shadow-sm whitespace-nowrap shrink-0"
                                >
                                    Back to list
                                </GradiantButton>
                            </div>
                            
                            
                            {loading ? (
                                <div className="flex justify-center items-center py-20"><Loader /></div>
                            ) : batchData ? (
                                <div className="w-full font-sans bg-white mt-2 sm:mt-4 rounded-xl sm:rounded-2xl p-3 sm:p-5 xl:p-6 shadow-sm border border-gray-100/80">
                                    <h2 className="text-[15px] sm:text-[18px] xl:text-[20px] font-semibold text-gray-800 mb-4 sm:mb-6 break-words">
                                        {batchData.courseId?.title}
                                    </h2>

                                    {/* Stats Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-5 xl:gap-6 mb-6 sm:mb-8">
                                        <div className="lg:col-span-2 flex flex-col gap-3.5 sm:gap-5 xl:gap-6 min-w-0">
                                            <MetricCard 
                                                className="p-3 sm:p-4 gap-2 sm:gap-4"
                                                title="Total Enrolled Students"
                                                value={batchData.stats?.totalEnrolled || 0}
                                                trend={batchData.stats?.improvement || "0%"} 
                                            />
                                            <OverviewCard
                                                statsOverride={{
                                                    col1: { value: batchData.stats?.totalGroups || 0, label: "Total Groups", shortLabel: "Total", color: "#22C55E" },
                                                    col2: { value: batchData.stats?.assignedGroups || 0, label: "Assigned Groups", shortLabel: "Assigned", color: "#3758EE" },
                                                    col3: { value: batchData.stats?.unassignedGroups || 0, label: "Unassigned Groups", shortLabel: "Unassigned", color: "#B666E7" }
                                                }}
                                            />
                                        </div>
                                        <div className="lg:col-span-1 h-full min-w-0">
                                            <PerformanceCard 
                                                className="h-full justify-center p-4 sm:p-5 xl:p-6 gap-2 sm:gap-3"
                                                name="Course Completion Rate"
                                                percentageOverride={batchData.stats?.completionRate || 0}
                                                trendOverride={batchData.stats?.improvement || "0"} 
                                            />
                                        </div>
                                    </div>

                                    {/* Groups Section */}
                                    <div className="mt-6 sm:mt-8">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Batch Groups</h3>
                                        {batchData.groups && batchData.groups.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                                                    {batchData.groups.slice((currentPage - 1) * 16, currentPage * 16).map(group => {
                                                        const mod = group.assignedModerator;
                                                        const moderatorName = mod ? (mod.firstname || mod.lastname ? `${mod.firstname || ""} ${mod.lastname || ""}`.trim() : (mod.name || mod.username)) : "Not Assigned";
                                                        const groupDisplayName = group.name ? group.name.replace(/Limit/gi, 'Group') : group.name;
                                                        
                                                        return (
                                                        <div 
                                                            key={group._id} 
                                                            onClick={() => handleGroupClick(group)}
                                                            className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3.5 sm:p-4 xl:p-5 shadow-sm flex flex-col hover:shadow-md hover:border-[#3758EE]/50 transition-all cursor-pointer min-w-0"
                                                        >
                                                            <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-1 truncate" title={groupDisplayName}>
                                                                {groupDisplayName}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 mb-2 font-medium truncate" title={`Mod: ${moderatorName}`}>
                                                                Mod: <span className={mod ? "text-[#3758EE]" : "text-red-400"}>{moderatorName}</span>
                                                            </p>
                                                            
                                                            <div className="flex justify-between items-center gap-2 mb-2">
                                                                <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">Group</span>
                                                                <span className="text-xs sm:text-sm font-bold text-[#3758EE] whitespace-nowrap">
                                                                    {group.currentEnrollment}/{group.limit}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Progress Bar */}
                                                            <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 mb-2.5 sm:mb-3 overflow-hidden">
                                                                <div 
                                                                    className="bg-[#3758EE] h-full rounded-full transition-all duration-500" 
                                                                    style={{ width: `${Math.min(100, group.limit ? (group.currentEnrollment / group.limit) * 100 : 0)}%` }}
                                                                ></div>
                                                            </div>

                                                            <p className="text-[11px] sm:text-xs text-gray-500 mt-auto leading-relaxed">
                                                                <span className="font-semibold text-gray-700">{group.currentEnrollment}</span> enrolled and <span className="font-semibold text-gray-700">{group.limit}</span> is the max capacity
                                                            </p>
                                                        </div>
                                                    )})}
                                                </div>
                                                {Math.ceil(batchData.groups.length / 16) > 1 && (
                                                    <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end">
                                                        <CustomPagination 
                                                            currentPage={currentPage}
                                                            totalPages={Math.ceil(batchData.groups.length / 16)}
                                                            onPageChange={(page) => setCurrentPage(page)}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-8 sm:py-10 px-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-xs sm:text-sm text-gray-500 font-medium">No groups assigned to this batch yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-500 font-medium">Batch not found.</div>
                            )}
                        </div>
                    </main>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}} />
                </div>
            </div>
        </div>
    );
};

export default BatchDetailsPage;
