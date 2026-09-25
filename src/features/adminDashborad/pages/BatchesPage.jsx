import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import { getAllBatches } from '@/api/batch';
import Loader from '@/components/ui/Loader';
import { CustomPagination } from '@/components/ui/Pagination';

const BatchesPage = ({ filter = 'All' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                setIsLoading(true);
                const data = await getAllBatches();
                
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
    }, []);

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
                            <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900 mb-6">{filter} Batches</h2>
                            
                            {isLoading ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader />
                                </div>
                            ) : filteredBatches.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-xl border border-gray-100">
                                    No {filter !== 'All' ? filter.toLowerCase() : ''} batches found.
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {paginatedBatches.map(batch => (
                                        <div key={batch.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{batch.title}</h3>
                                                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full shrink-0 ${batch.status === 'Running' ? 'bg-blue-100 text-[#3758EE]' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {batch.status}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-500 mb-4 line-clamp-1">Course: <span className="text-gray-700">{batch.courseName}</span></p>

                                            <div className="bg-blue-50/50 rounded-xl p-4 flex justify-between mt-auto mb-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Enrollments</span>
                                                    <span className="text-[15px] font-bold text-[#3758EE]">{batch.enrolled}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Groups</span>
                                                    <span className="text-[15px] font-bold text-[#3758EE]">{batch.groups}</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => navigate(`/admin-batches/details/${batch.id}`)}
                                                className="w-full py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    ))}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="mt-10">
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
