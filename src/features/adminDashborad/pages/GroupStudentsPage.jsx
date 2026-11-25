import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import Loader from '@/components/ui/Loader';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { getStudentsByGroup, getLimitById } from '@/api/limit';
import BatchManagementModal from '@/components/layouts/ManageBatches/BatchManagementModal';

const GroupStudentsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    
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

    const filteredStudents = (students || []).filter(student => {
        let match = true;
        if (searchTerm && searchTerm.trim()) {
            const cleanTerm = searchTerm.trim().toLowerCase();
            if (searchType === 'EMAIL') {
                match = (student.email || "").toLowerCase().includes(cleanTerm);
            } else {
                const studentName = (student.name || "").toLowerCase();
                const directMatch = studentName.includes(cleanTerm);
                const tokens = cleanTerm.split(/\s+/).filter(Boolean);
                const tokensMatch = tokens.length > 0 && tokens.every(token => studentName.includes(token));
                const emailMatch = (student.email || "").toLowerCase().includes(cleanTerm);
                match = directMatch || tokensMatch || emailMatch;
            }
        }
        if (match && fromDate) {
            match = new Date(student.joiningDate) >= new Date(fromDate);
        }
        if (match && toDate) {
            const toDateEnd = new Date(toDate);
            toDateEnd.setHours(23, 59, 59, 999);
            match = new Date(student.joiningDate) <= toDateEnd;
        }
        if (match && statusFilter !== 'All') {
            if (statusFilter === 'Completed') match = Boolean(student.isCompleted);
            if (statusFilter === 'In Progress') match = !student.isCompleted;
        }
        return match;
    });

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
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col h-screen overflow-hidden gap-2 sm:gap-4">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <div className='flex flex-col lg:flex-row px-2 sm:px-4 gap-3 sm:gap-4 flex-1 overflow-hidden relative min-h-0 pb-4'>
                    {isSidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
                    <Sidebar onClose={() => setIsSidebarOpen(false)} className={cn("transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 lg:static lg:block fixed left-0 top-0 shadow-2xl", isSidebarOpen ? "translate-x-0" : "-translate-x-full")} />

                    <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar pb-6 sm:pb-10 min-h-0">
                        <div className="py-2 sm:py-4 px-1 sm:px-2">
                            <div className="mb-4 sm:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                                <div className="min-w-0 w-full md:w-auto">
                                    <h1 className="text-[18px] sm:text-2xl xl:text-[28px] font-bold text-gray-900 leading-snug break-words">
                                        Students in <span className="text-[#3758EE]">{groupName}</span>
                                    </h1>
                                    <p className="text-gray-500 text-xs sm:text-sm xl:text-base mt-0.5">Manage students enrolled in this specific group</p>
                                </div>
                                {limitData && user?.role === 'admin' && (
                                    <div className="flex flex-row justify-end gap-2 sm:gap-3 w-full md:w-auto shrink-0">
                                        <button
                                            onClick={() => handleOpenModal('assign')}
                                            className="flex-1 md:flex-none px-2.5 sm:px-4 py-2 border-2 border-[#5D5FEF] text-[#5D5FEF] rounded-lg font-bold text-xs sm:text-sm hover:bg-[#5D5FEF] hover:text-white transition-all active:scale-95 shadow-sm whitespace-nowrap text-center"
                                        >
                                            Assign Moderator
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal('students')}
                                            className="flex-1 md:flex-none px-2.5 sm:px-4 py-2 bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right text-white rounded-lg font-bold text-xs sm:text-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap text-center"
                                        >
                                            Adjust Students
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-xl sm:rounded-[16px] p-3 sm:p-5 xl:p-6 shadow-sm border border-gray-100">
                                <div className="flex flex-col gap-3 sm:gap-4 xl:flex-row xl:items-end xl:gap-4 mb-5 sm:mb-7">
                                    {/* Advanced Search */}
                                    <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 min-w-0">
                                        <p className="text-[11px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">ADVANCED SEARCH</p>
                                        {/* Mobile (< sm): stacked segmented search card */}
                                        <div className="flex sm:hidden flex-col bg-white border border-[#4E60FF] rounded-xl shadow-sm overflow-hidden">
                                            <div className="flex items-center px-3 py-2 border-b border-gray-100">
                                                <Search className="text-gray-400 w-4 h-4 mr-2 shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder={`Search by ${searchType.toLowerCase()}`}
                                                    className="w-full bg-transparent text-xs font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none min-w-0"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center p-1.5 gap-1.5 bg-[#F8FAFF]">
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'EMAIL') {
                                                            setSearchType('EMAIL');
                                                            setSearchTerm('');
                                                        }
                                                    }}
                                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 tracking-wide ${searchType === 'EMAIL' ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-sm' : 'bg-[#C2C9FF] text-white'}`}
                                                >
                                                    EMAIL
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'NAME') {
                                                            setSearchType('NAME');
                                                            setSearchTerm('');
                                                        }
                                                    }}
                                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 tracking-wide ${searchType === 'NAME' ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-sm' : 'bg-[#C2C9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                        {/* Tablet & Desktop (sm+): inline single-row search bar */}
                                        <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-lg p-1 transition-all duration-200 group focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:border-blue-500 h-[42px] min-w-0">
                                            <Search className="text-gray-400 w-4 h-4 ml-2 mr-2 shrink-0" />
                                            <input
                                                type="text"
                                                placeholder={`Search by ${searchType.toLowerCase()}`}
                                                className="flex-1 bg-transparent text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none min-w-0"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <div className="flex items-center gap-1.5 shrink-0 mr-0.5">
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'EMAIL') {
                                                            setSearchType('EMAIL');
                                                            setSearchTerm('');
                                                        }
                                                    }}
                                                    className={`px-3.5 py-1.5 h-[32px] text-[10px] whitespace-nowrap font-bold rounded-md transition-all duration-200 tracking-wide flex items-center justify-center ${searchType === 'EMAIL' ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-sm' : 'bg-[#C2C9FF] text-white hover:bg-[#A8B1FF]'}`}
                                                >
                                                    EMAIL
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'NAME') {
                                                            setSearchType('NAME');
                                                            setSearchTerm('');
                                                        }
                                                    }}
                                                    className={`px-3.5 py-1.5 h-[32px] text-[10px] whitespace-nowrap font-bold rounded-md transition-all duration-200 tracking-wide flex items-center justify-center ${searchType === 'NAME' ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-sm' : 'bg-[#C2C9FF] text-white hover:bg-[#A8B1FF]'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date, Status, and Clear Controls */}
                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap xl:flex-nowrap items-end gap-2.5 sm:gap-3 xl:gap-4">
                                        <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0 sm:flex-1 xl:flex-none">
                                            <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">From</span>
                                            <input
                                                type="date"
                                                className="w-full xl:w-[145px] px-2.5 sm:px-3 bg-white border border-gray-200 rounded-lg text-xs sm:text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 h-[38px] sm:h-[42px]"
                                                value={fromDate}
                                                onChange={(e) => setFromDate(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0 sm:flex-1 xl:flex-none">
                                            <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">To</span>
                                            <input
                                                type="date"
                                                className="w-full xl:w-[145px] px-2.5 sm:px-3 bg-white border border-gray-200 rounded-lg text-xs sm:text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 h-[38px] sm:h-[42px]"
                                                value={toDate}
                                                onChange={(e) => setToDate(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0 sm:flex-1 xl:flex-none">
                                            <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">Status</span>
                                            <div className="relative w-full xl:w-[145px]">
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    className="w-full px-2.5 sm:px-3 pr-8 h-[38px] sm:h-[42px] bg-white border border-gray-200 rounded-lg text-xs sm:text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                                                >
                                                    <option value="All">All Statuses</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="In Progress">In Progress</option>
                                                </select>
                                                <ChevronDown size={15} className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('All');
                                                setFromDate('');
                                                setToDate('');
                                            }}
                                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-[38px] sm:h-[42px] bg-[#E2E4E9] text-[#6A6F78] font-bold text-xs sm:text-[13px] rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap shrink-0 w-full sm:w-auto"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center gap-2 mb-3 sm:mb-5">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Enrolled Students</h3>
                                    <span className="bg-[#3758EE]/10 text-[#3758EE] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap shrink-0">
                                        Total: {filteredStudents.length}
                                    </span>
                                </div>

                                <div className="overflow-x-auto custom-scrollbar-thin">
                                    <table className="w-full min-w-[600px] sm:min-w-[660px] xl:min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-50 uppercase text-[11px] sm:text-xs font-bold text-gray-700">
                                                <th className="text-left pb-2.5 sm:pb-3 px-2 sm:pl-4 font-bold whitespace-nowrap">Student Name</th>
                                                <th className="text-left pb-2.5 sm:pb-3 px-2 font-bold whitespace-nowrap">Email</th>
                                                <th className="text-left pb-2.5 sm:pb-3 px-2 font-bold whitespace-nowrap">Gender</th>
                                                <th className="text-center pb-2.5 sm:pb-3 px-2 font-bold whitespace-nowrap">Joining Date</th>
                                                <th className="text-center pb-2.5 sm:pb-3 px-2 font-bold whitespace-nowrap">Progress</th>
                                                <th className="text-center pb-2.5 sm:pb-3 px-2 font-bold whitespace-nowrap">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50/50">
                                            {loading ? (
                                                <tr><td colSpan={6} className="py-16 sm:py-20 text-center"><Loader /></td></tr>
                                            ) : filteredStudents.length === 0 ? (
                                                <tr><td colSpan={6} className="py-16 sm:py-20 text-center text-xs sm:text-sm text-gray-400 font-medium">No students match your filter.</td></tr>
                                            ) : filteredStudents.map((student) => (
                                                <tr key={student._id} className="hover:bg-gray-50/40 transition-colors">
                                                    <td className="py-2.5 sm:py-3.5 xl:py-5 px-2 sm:pl-4 font-medium text-gray-800">
                                                        <span className="text-xs sm:text-[13px] xl:text-[14px] block max-w-[115px] sm:max-w-[150px] truncate" title={student.name}>{student.name}</span>
                                                    </td>
                                                    <td className="py-2.5 sm:py-3.5 xl:py-5 px-2 text-[11px] sm:text-xs xl:text-[13px] text-gray-500">
                                                        <span className="block max-w-[130px] sm:max-w-[180px] truncate" title={student.email}>{student.email}</span>
                                                    </td>
                                                    <td className="py-2.5 sm:py-3.5 xl:py-5 px-2 text-[11px] sm:text-xs xl:text-[13px] text-gray-500 whitespace-nowrap">{student.gender}</td>
                                                    <td className="py-2.5 sm:py-3.5 xl:py-5 px-2 text-[11px] sm:text-xs xl:text-[13px] text-gray-500 text-center whitespace-nowrap">
                                                        {new Date(student.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                                                    </td>
                                                    <td className="py-2.5 sm:py-3.5 xl:py-5 px-2">
                                                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                                                            <div className="w-16 sm:w-20 xl:w-24 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-[#3758EE] rounded-full" 
                                                                    style={{ width: `${student.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[11px] sm:text-xs font-bold text-gray-700 w-8 whitespace-nowrap">{student.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 sm:py-3.5 xl:py-5 px-2 text-center">
                                                        <GradiantButton
                                                            onClick={() => navigate(`/admin/student-details/${student._id}`)}
                                                            className="px-2.5 sm:px-4 xl:px-5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold shadow-sm hover:shadow-md whitespace-nowrap"
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
