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
import { getStudentsByGroup } from '@/api/limit';
import { CustomPagination } from '@/components/ui/Pagination';

const BatchDetailsPage = () => {
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
                const res = await getBatchById(id);
                setBatchData(res);
            } catch (error) {
                console.error("Failed to fetch batch details", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id]);

    const handleGroupClick = (group) => {
        navigate(`/admin-batches/groups/${group._id}/students?name=${encodeURIComponent(group.name)}`);
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans bg-[#F8F9FA]">
            <div className="relative w-full max-w-[1920px] mx-auto flex flex-col h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>
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
                    
                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-2 sm:py-4 px-2 sm:pr-2">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900">
                                    {batchData?.name || "Batch Details"}
                                </h2>
                                <GradiantButton
                                    onClick={() => navigate(-1)}
                                    className="bg-[#A892FF] hover:bg-[#937aff] text-white px-5 py-2 rounded-[4px] text-sm md:mt-0 font-medium shadow-sm"
                                >
                                    Back to list
                                </GradiantButton>
                            </div>
                            
                            
                            {loading ? (
                                <div className="flex justify-center items-center py-20"><Loader /></div>
                            ) : batchData ? (
                                <div className="w-full font-sans bg-white pb-8 mt-[20px] rounded-[10px] p-6">
                                    <h2 className="text-[16px] sm:text-[20px] font-semibold text-gray-800 mb-6">
                                        {batchData.courseId?.title}
                                    </h2>

                                    {/* Stats Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                        <div className="lg:col-span-2 flex flex-col gap-6">
                                            <MetricCard 
                                                title="Total Enrolled Students"
                                                value={batchData.stats?.totalEnrolled || 0}
                                                trend={batchData.stats?.improvement || "0%"} 
                                            />
                                            <OverviewCard
                                                statsOverride={{
                                                    col1: { value: batchData.stats?.totalGroups || 0, label: "total groups", color: "#22C55E" },
                                                    col2: { value: batchData.stats?.assignedGroups || 0, label: "assigned groups", color: "#3758EE" },
                                                    col3: { value: batchData.stats?.unassignedGroups || 0, label: "unassigned group", color: "#B666E7" }
                                                }}
                                            />
                                        </div>
                                        <div className="lg:col-span-1 h-full">
                                            <PerformanceCard 
                                                className="h-full justify-center"
                                                name="Course Completion Rate"
                                                percentageOverride={batchData.stats?.completionRate || 0}
                                                trendOverride={batchData.stats?.improvement || "0"} 
                                            />
                                        </div>
                                    </div>

                                    {/* Groups Section */}
                                    <div className="mt-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Groups</h3>
                                        {batchData.groups && batchData.groups.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                    {batchData.groups.slice((currentPage - 1) * 16, currentPage * 16).map(group => {
                                                        const mod = group.assignedModerator;
                                                    const moderatorName = mod ? (mod.firstname || mod.lastname ? `${mod.firstname || ""} ${mod.lastname || ""}`.trim() : (mod.name || mod.username)) : "Not Assigned";
                                                    
                                                    return (
                                                    <div 
                                                        key={group._id} 
                                                        onClick={() => handleGroupClick(group)}
                                                        className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col hover:shadow-md hover:border-[#3758EE]/50 transition-all cursor-pointer`}
                                                    >
                                                        <h4 className="text-md font-bold text-gray-800 mb-1">{group.name ? group.name.replace(/Limit/gi, 'Group') : group.name}</h4>
                                                        <p className="text-xs text-gray-500 mb-2 font-medium">Mod: <span className={mod ? "text-[#3758EE]" : "text-red-400"}>{moderatorName}</span></p>
                                                        
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Group</span>
                                                            <span className="text-sm font-bold text-[#3758EE]">
                                                                {group.currentEnrollment}/{group.limit}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Progress Bar */}
                                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                                                            <div 
                                                                className="bg-[#3758EE] h-2 rounded-full transition-all duration-500" 
                                                                style={{ width: `${Math.min(100, (group.currentEnrollment / group.limit) * 100)}%` }}
                                                            ></div>
                                                        </div>

                                                        <p className="text-xs text-gray-500 mt-auto">
                                                            <span className="font-semibold text-gray-700">{group.currentEnrollment}</span> enrolled and <span className="font-semibold text-gray-700">{group.limit}</span> is the max capacity
                                                        </p>
                                                    </div>
                                                )})}
                                            </div>
                                            {Math.ceil(batchData.groups.length / 16) > 1 && (
                                                <div className="mt-8">
                                                    <CustomPagination 
                                                        currentPage={currentPage}
                                                        totalPages={Math.ceil(batchData.groups.length / 16)}
                                                        onPageChange={(page) => setCurrentPage(page)}
                                                    />
                                                </div>
                                            )}
                                        </>
                                        ) : (
                                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-gray-500 font-medium">No groups assigned to this batch yet.</p>
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
