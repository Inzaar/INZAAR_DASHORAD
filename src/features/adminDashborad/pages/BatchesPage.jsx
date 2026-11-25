import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import { getAllBatches } from '@/api/batch';
import Loader from '@/components/ui/Loader';
import { CustomPagination } from '@/components/ui/Pagination';

const BatchesPage = ({ filter = 'All', isMyBatches = false }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                setIsLoading(true);
                const data = await getAllBatches(isMyBatches);
                
                // Map DB batches to the required format
                const formattedBatches = data.map(b => {
                    const isCompleted = new Date(b.endDate) < new Date();
                    return {
                        id: b._id,
                        title: b.name || "Unnamed Batch",
                        courseName: b.courseId?.title || "Unknown Course",
                        courseId: b.courseId?._id,
                        status: isCompleted ? "Completed" : "Running",
                        enrolled: b.enrollmentsCount || 0,
                        groups: b.groupsCount || 0,
                        startDate: b.startDate,
                        endDate: b.endDate
                    };
                });
                
                setBatches(formattedBatches);
            } catch (error) {
                console.error("Failed to fetch batches:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBatches();
    }, [isMyBatches]);

    const filteredBatches = filter === 'All' 
        ? batches 
        : batches.filter(b => b.status === filter);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, batches]);

    const itemsPerPage = 9;
    const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
    const paginatedBatches = filteredBatches.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
                            <h2 className="text-[18px] sm:text-[22px] xl:text-[24px] font-bold text-gray-900 mb-4 sm:mb-6">{filter} Batches</h2>
                            
                            {isLoading ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader />
                                </div>
                            ) : filteredBatches.length === 0 ? (
                                <div className="text-center py-16 sm:py-20 px-4 text-sm sm:text-base text-gray-500 font-medium bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                                    No {filter !== 'All' ? filter.toLowerCase() : ''} batches found.
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 xl:gap-6">
                                        {paginatedBatches.map(batch => (
                                        <div key={batch.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 xl:p-6 flex flex-col hover:shadow-md transition-shadow min-w-0">
                                            <div className="flex justify-between items-start gap-2.5 mb-1.5 sm:mb-2 min-w-0">
                                                <h3
                                                    className="text-base sm:text-lg xl:text-xl font-bold text-gray-900 truncate min-w-0 flex-1"
                                                    title={batch.title}
                                                >
                                                    {batch.title}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-full shrink-0 whitespace-nowrap ${batch.status === 'Running' ? 'bg-blue-100 text-[#3758EE]' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {batch.status}
                                                </span>
                                            </div>
                                            <p
                                                className="text-xs sm:text-sm font-medium text-gray-500 mb-3 sm:mb-4 truncate"
                                                title={`Course: ${batch.courseName}`}
                                            >
                                                Course: <span className="text-gray-700">{batch.courseName}</span>
                                            </p>

                                            <div className="bg-blue-50/50 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 mt-auto mb-4 sm:mb-5">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] sm:text-[11px] xl:text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1 truncate">Enrollments</span>
                                                    <span className="text-sm sm:text-[15px] font-bold text-[#3758EE]">{batch.enrolled}</span>
                                                </div>
                                                <div className="flex flex-col items-end min-w-0 shrink-0">
                                                    <span className="text-[10px] sm:text-[11px] xl:text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">Groups</span>
                                                    <span className="text-sm sm:text-[15px] font-bold text-[#3758EE]">{batch.groups}</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => navigate(isMyBatches ? `/my-batches/details/${batch.id}` : `/admin-batches/details/${batch.id}`)}
                                                className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white text-sm sm:text-base rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    ))}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="mt-6 sm:mt-8 xl:mt-10 flex justify-center sm:justify-end">
                                            <CustomPagination 
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
                                        </div>
                                    )}
                                </>
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

export default BatchesPage;
