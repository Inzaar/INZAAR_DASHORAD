import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import Loader from '@/components/ui/Loader';
import { ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStudentsByGroup, getLimitById } from '@/api/limit';
import BatchManagementModal from '@/components/layouts/ManageBatches/BatchManagementModal';

const GroupStudentsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    
    // Extract group name from URL query if available
    const queryParams = new URLSearchParams(location.search);
    const groupNameRaw = queryParams.get('name') || 'Group';
    const groupName = groupNameRaw.replace(/Limit/gi, 'Group');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('NAME');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [limitData, setLimitData] = useState(null);
    const [modalData, setModalData] = useState({ isOpen: false, initialTab: 'assign' });

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const [res, limitRes] = await Promise.all([
                getStudentsByGroup(id),
                getLimitById(id)
            ]);
            setStudents(res || []);
            if (limitRes) {
                setLimitData({
                    ...limitRes,
                    displayGroupName: limitRes.name || limitRes._id.substring(0, 8),
                    courseName: limitRes.courseId?.title || 'Unknown Course',
                    genderType: limitRes.genderType || 'Unassigned',
                    enrolledCount: (res || []).length
                });
            }
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchStudents();
    }, [id]);

    const handleOpenModal = (tab) => {
        setModalData({ isOpen: true, initialTab: tab });
    };

    const handleCloseModal = () => {
        setModalData(prev => ({ ...prev, isOpen: false }));
        fetchStudents();
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans bg-[#F8F9FA]">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>
                    {isSidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
                    <Sidebar onClose={() => setIsSidebarOpen(false)} className={cn("transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 lg:static lg:block fixed left-0 top-0 shadow-2xl", isSidebarOpen ? "translate-x-0" : "-translate-x-full")} />

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-4 pr-2">
                            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h1 className="text-[20px] min-[641px]:text-3xl font-bold text-gray-900">
                                        Students in <span className="text-[#3758EE]">{groupName}</span>
                                    </h1>
                                    <p className="text-gray-500 text-[14px] min-[641px]:text-[16px]">Manage students enrolled in this specific group</p>
                                </div>
                                {limitData && (
                                    <div className="flex flex-row justify-end gap-2 sm:gap-3 w-full md:w-auto flex-shrink-0">
                                        <button
                                            onClick={() => handleOpenModal('assign')}
                                            className="flex-1 sm:flex-none sm:w-auto px-4 py-2 border-2 border-[#5D5FEF] text-[#5D5FEF] rounded-lg font-bold text-[13px] sm:text-sm hover:bg-[#5D5FEF] hover:text-white transition-all active:scale-95 shadow-sm whitespace-nowrap text-center"
                                        >
                                            Assign Moderator
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal('students')}
                                            className="flex-1 sm:flex-none sm:w-auto px-4 py-2 bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right text-white rounded-lg font-bold text-[13px] sm:text-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap text-center"
                                        >
                                            Adjust Students
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100">
                                <div className="hidden xl:flex flex-row items-end gap-6 mb-8 mt-4">
                                    <div className='flex-1 flex gap-2 flex-col'>
                                        <p className="text-xs text-gray-400 font-bold tracking-wide">ADVANCED SEARCH</p>
                                        <div className="flex items-center bg-white border border-gray-200 rounded-md p-1 transition-all duration-200 group focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:border-blue-500 h-[42px]">
                                            <Search className="text-gray-400 w-[18px] h-[18px] ml-2 mr-2 shrink-0" />
                                            <input
                                                type="text"
                                                placeholder={`Search by ${searchType.toLowerCase()}`}
                                                className="flex-1 bg-transparent text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none min-w-0"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <div className="flex items-center gap-1.5 shrink-0 mr-1">
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'PHONE') {
                                                            setSearchType('PHONE');
                                                            setSearchTerm('');
                                                        }
                                                    }}
                                                    className={`px-4 py-2 text-[11px] whitespace-nowrap font-bold rounded-md transition-all duration-200 tracking-wide ${searchType === 'PHONE' ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-sm' : 'bg-[#C2C9FF] text-white hover:bg-[#A8B1FF]'}`}
                                                >
                                                    PHONE
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'NAME') {
                                                            setSearchType('NAME');
                                                            setSearchTerm('');
                                                        }
                                                    }}
                                                    className={`px-4 py-2 text-[11px] whitespace-nowrap font-bold rounded-md transition-all duration-200 tracking-wide ${searchType === 'NAME' ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-sm' : 'bg-[#C2C9FF] text-white hover:bg-[#A8B1FF]'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">From</span>
                                        <input
                                            type="date"
                                            className="px-3 bg-white border border-gray-200 rounded-md text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[150px] h-[42px]"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">To</span>
                                        <input
                                            type="date"
                                            className="px-3 bg-white border border-gray-200 rounded-md text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[150px] h-[42px]"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status</span>
                                        <div className="relative w-[150px]">
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full px-3 h-[42px] bg-white border border-gray-200 rounded-md text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                                            >
                                                <option value="All">All Statuses</option>
                                                <option value="Completed">Completed</option>
                                                <option value="In Progress">In Progress</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('All');
                                            setFromDate('');
                                            setToDate('');
                                        }}
                                        className="flex items-center gap-2 px-4 h-[42px] bg-[#E2E4E9] text-[#6A6F78] font-bold text-[13px] rounded-md hover:bg-gray-300 transition-colors whitespace-nowrap ml-auto"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                        Clear
                                    </button>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Enrolled Students</h3>
                                    <span className="bg-[#3758EE]/10 text-[#3758EE] px-4 py-1.5 rounded-full text-sm font-bold">
                                        Total: {students.length}
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead>
                                            <tr className="border-b border-gray-50 uppercase text-[12px] font-bold text-gray-800">
                                                <th className="text-left pb-4 pl-4 font-bold">Student Name</th>
                                                <th className="text-left pb-4 font-bold">Email</th>
                                                <th className="text-left pb-4 font-bold">Gender</th>
                                                <th className="text-center pb-4 font-bold">Joining Date</th>
                                                <th className="text-center pb-4 font-bold">Progress</th>
                                                <th className="text-center pb-4 font-bold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50/50">
                                            {loading ? (
                                                <tr><td colSpan={6} className="py-20 text-center"><Loader /></td></tr>
                                            ) : students.length === 0 ? (
                                                <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-medium">No students match your filter.</td></tr>
                                            ) : students
                                                .filter(student => {
                                                    let match = true;
                                                    if (searchTerm) {
                                                        const term = searchTerm.toLowerCase();
                                                        if (searchType === 'NAME') {
                                                            match = student.name.toLowerCase().includes(term);
                                                        } else {
                                                            match = (student.phone || "").toLowerCase().includes(term);
                                                        }
                                                    }
                                                    if (match && fromDate) {
                                                        match = new Date(student.joiningDate) >= new Date(fromDate);
                                                    }
                                                    if (match && toDate) {
                                                        match = new Date(student.joiningDate) <= new Date(toDate);
                                                    }
                                                    if (match && statusFilter !== 'All') {
                                                        if (statusFilter === 'Completed') match = student.isCompleted;
                                                        if (statusFilter === 'In Progress') match = !student.isCompleted;
                                                    }
                                                    return match;
                                                })
                                                .map((student) => (
                                                <tr key={student._id} className="hover:bg-gray-50/40 transition-colors">
                                                    <td className="py-6 pl-4 font-medium text-gray-800">{student.name}</td>
                                                    <td className="py-6 text-[13px] text-gray-500">{student.email}</td>
                                                    <td className="py-6 text-[13px] text-gray-500">{student.gender}</td>
                                                    <td className="py-6 text-[13px] text-gray-500 text-center">
                                                        {new Date(student.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                                                    </td>
                                                    <td className="py-6">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-[#3758EE] rounded-full" 
                                                                    style={{ width: `${student.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-700 w-8">{student.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 text-center">
                                                        <GradiantButton
                                                            onClick={() => navigate(`/admin/student-details/${student._id}`)}
                                                            className="px-5 py-2 rounded-lg text-[12px] font-bold shadow-lg shadow-[#3758EE]/20 hover:shadow-[#3758EE]/40"
                                                        >
                                                            View Profile
                                                        </GradiantButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <BatchManagementModal
                            isOpen={modalData.isOpen}
                            onClose={handleCloseModal}
                            batchData={limitData}
                            initialTab={modalData.initialTab}
                        />
                    </main>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
            </div>
        </div>
    );
};

export default GroupStudentsPage;
