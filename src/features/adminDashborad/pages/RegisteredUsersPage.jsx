import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import { cn } from '@/lib/utils';
import { getAllUsers } from '@/api/user';
import { getAllEnrollments } from '@/api/enrollment';

const RegisteredUsersPage = () => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userType = queryParams.get('type') || 'all_students';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchType, setSearchType] = useState('NAME'); // 'NAME' or 'PHONE'
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dynamic Titles based on userType
    const titles = {
        all_students: { header: "Registered Students", main: "Total Registered Students", sub: "Manage All Your Registered Students" },
        active_students: { header: "Active Students", main: "Active Students", sub: "Manage Your Active Students" },
        inactive_students: { header: "Inactive Students", main: "Inactive Students", sub: "Manage Your Inactive Students" },
        pending_students: { header: "Pending Students", main: "Pending Students", sub: "Manage Your Pending Students" },
        moderators: { header: "Moderators", main: "Total Moderators", sub: "Manage All Your Moderators" },
        active_moderators: { header: "Active Moderators", main: "Active Moderators", sub: "Manage Your Active Moderators" },
        inactive_moderators: { header: "Inactive Moderators", main: "Inactive Moderators", sub: "Manage Your Inactive Moderators" },
        moderator_pool: { header: "Moderator Pool", main: "Moderators in Pool", sub: "Manage Your Pending Moderators Pool" }
    };

    const currentTitles = titles[userType] || titles.all_students;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usersRes, enrollmentsRes] = await Promise.all([
                    getAllUsers(),
                    getAllEnrollments()
                ]);

                // Use only API results
                let filteredUsers = usersRes?.data || [];
                const allEnrollments = enrollmentsRes?.data || [];

                // Filter by role first
                if (userType.includes('student')) {
                    filteredUsers = filteredUsers.filter(u => u.role === 'user');
                } else if (userType.includes('moderator')) {
                    filteredUsers = filteredUsers.filter(u => u.role === 'moderator');
                }

                const formattedData = filteredUsers.map(user => {
                    const userEnrollments = allEnrollments.filter(e => e.userId && (e.userId._id === user._id || e.userId === user._id));
                    const enrolledCourseNames = userEnrollments.map(e => e.courseId?.title || "Unknown Course");

                    let totalProgress = 0;
                    const hasActivity = userEnrollments.some(e => e.isCompleted || (e.completedLectures && e.completedLectures.length > 0));
                    const hasEnrollments = userEnrollments.length > 0;

                    if (hasEnrollments) {
                        const sumOfProgress = userEnrollments.map(e => {
                            if (e.isCompleted) return 100;
                            if (!e.completedLectures?.length) return 0;
                            return e.completedLectures.reduce((sum, l) => sum + (l.watchedPercentage || 0), 0) / e.completedLectures.length;
                        }).reduce((a, b) => a + b, 0);
                        totalProgress = Math.round(sumOfProgress / userEnrollments.length);
                    }

                    // Determine Dynamic Status
                    let dynamicStatus = "Pending";
                    if (hasActivity) {
                        dynamicStatus = "Active";
                    } else if (hasEnrollments) {
                        dynamicStatus = "In-active";
                    }

                    return {
                        id: user._id,
                        name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || "Unknown",
                        email: user.email,
                        phone: user.phone || "0322 123456",
                        enrollments: enrolledCourseNames.length > 0 ? enrolledCourseNames : ["N/A"],
                        progress: `${totalProgress}%`,
                        lastLogin: new Date(user.updatedAt || user.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
                        rawDate: new Date(user.updatedAt || user.createdAt),
                        status: dynamicStatus,
                        rawStatus: user.status // preserve original if needed
                    };
                });

                // Re-apply type filtering on formatted data with dynamic status
                let finalUsers = formattedData;
                if (userType === 'active_students') finalUsers = formattedData.filter(u => u.status === 'Active');
                if (userType === 'inactive_students') finalUsers = formattedData.filter(u => u.status === 'In-active');
                if (userType === 'pending_students') finalUsers = formattedData.filter(u => u.status === 'Pending');
                if (userType === 'active_moderators') finalUsers = formattedData.filter(u => u.rawStatus === 'active' || u.rawStatus === undefined);
                if (userType === 'inactive_moderators') finalUsers = formattedData.filter(u => u.rawStatus === 'in-active');
                if (userType === 'moderator_pool') finalUsers = formattedData.filter(u => u.rawStatus === 'pending');

                setUsers(finalUsers);
            } catch (error) {
                console.error("Failed to fetch registered users data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userType]);

    const displayedUsers = users.filter(user => {
        let matchesSearch = true;
        let matchesDate = true;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            if (searchType === 'NAME') {
                matchesSearch = String(user.name).toLowerCase().includes(term);
            } else if (searchType === 'PHONE') {
                // Remove spaces to make phone matching robust (e.g. "+92 300" matches "+92300")
                const cleanPhone = String(user.phone).replace(/\s+/g, '').toLowerCase();
                const cleanTerm = term.replace(/\s+/g, '').toLowerCase();
                matchesSearch = cleanPhone.includes(cleanTerm);
            }
        }

        if (fromDate || toDate) {
            const userDate = user.rawDate;
            if (fromDate) {
                matchesDate = matchesDate && userDate >= new Date(fromDate);
            }
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && userDate <= end;
            }
        }

        return matchesSearch && matchesDate;
    });

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden">
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
                        className={cn(
                            "transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 lg:static lg:block fixed left-0 top-0 shadow-2xl",
                            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        )}
                    />

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-4 pr-2">
                            {/* Page Header Area */}
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <h1 className="text-[20px] min-[641px]:text-3xl font-bold text-gray-900">{currentTitles.main}</h1>
                                    <p className="text-gray-500 text-[14px] min-[641px]:text-[16px]">{currentTitles.sub}</p>
                                </div>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-[8px] text-sm font-medium transition-colors"
                                >
                                    Back
                                </button>
                            </div>

                            {/* Main Content Card */}
                            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100">

                                {/* Filters Row */}
                                <div className="flex flex-col xl:flex-row items-end gap-6 mb-10">
                                    {/* Advanced Search */}
                                    <div className="flex-1 w-full">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">ADVANCED SEARCH</p>
                                        <div className="relative flex items-center bg-white border border-gray-100 rounded-lg h-[46px] group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                            <Search className="absolute left-4 text-gray-400 group-focus-within:text-blue-500" size={18} />
                                            <input
                                                type="text"
                                                placeholder={`Search by ${searchType.toLowerCase()}`}
                                                className="w-full pl-11 pr-[160px] py-2 bg-transparent text-sm focus:outline-none placeholder:text-gray-300"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <div className="absolute right-1 flex items-center gap-1">
                                                <GradiantButton
                                                    onClick={() => setSearchType('PHONE')}
                                                    className={cn(
                                                        "px-4 py-1.5 text-[11px] font-bold rounded shadow-sm transition-all",
                                                        searchType === 'PHONE'
                                                            ? "shadow-md shadow-blue-500/20"
                                                            : "opacity-30 grayscale-[0.5]"
                                                    )}
                                                >
                                                    PHONE#
                                                </GradiantButton>
                                                <GradiantButton
                                                    onClick={() => setSearchType('NAME')}
                                                    className={cn(
                                                        "px-4 py-1.5 text-[11px] font-bold rounded shadow-sm transition-all",
                                                        searchType === 'NAME'
                                                            ? "shadow-md shadow-blue-500/20"
                                                            : "opacity-30 grayscale-[0.5]"
                                                    )}
                                                >
                                                    NAME
                                                </GradiantButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* From Date */}
                                    <div className="w-full xl:w-auto">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">FROM</p>
                                        <input
                                            type="date"
                                            className="w-full xl:w-[200px] h-[46px] px-4 bg-white border border-gray-100 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                        />
                                    </div>

                                    {/* To Date */}
                                    <div className="w-full xl:w-auto">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">TO</p>
                                        <input
                                            type="date"
                                            className="w-full xl:w-[200px] h-[46px] px-4 bg-white border border-gray-100 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                    </div>

                                    {/* Clear Filter */}
                                    <button
                                        className="h-[46px] px-6 flex items-center gap-2 bg-gray-100 text-gray-400 font-bold text-[13px] rounded-lg hover:bg-gray-200 transition-all whitespace-nowrap"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFromDate('');
                                            setToDate('');
                                        }}
                                    >
                                        <BiFilterAlt size={18} />
                                        Clear Filter
                                    </button>
                                </div>

                                {/* Results Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1000px]">
                                        <thead>
                                            <tr className="border-b border-gray-50 uppercase text-[12px] font-bold text-gray-800">
                                                <th className="text-left pb-4 pl-4 font-bold">{t("name", "Name")}</th>
                                                <th className="text-left pb-4 font-bold">{t("contact", "Contact")}</th>
                                                <th className="text-center pb-4 font-bold">{t("enrollments", "Enrollments")}</th>
                                                <th className="text-center pb-4 font-bold">{t("progress", "Progress")}</th>
                                                <th className="text-center pb-4 font-bold">{t("last_login", "Last Login")}</th>
                                                <th className="text-center pb-4 font-bold">{t("status", "Status")}</th>
                                                <th className="text-center pb-4 font-bold">{t("action", "Action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50/50">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={7} className="py-20 text-center text-gray-400 font-medium">Loading participants...</td>
                                                </tr>
                                            ) : displayedUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-20 text-center text-gray-400 font-medium">No records found.</td>
                                                </tr>
                                            ) : (
                                                displayedUsers.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                                                        <td className="py-6 pl-4 font-medium text-gray-800">{user.name}</td>
                                                        <td className="py-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-[13px] text-gray-500">{user.email}</span>
                                                                <span className="text-[13px] text-gray-400">{user.phone}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 text-center">
                                                            <div className="flex flex-col gap-0.5 items-center">
                                                                {user.enrollments.slice(0, 3).map((course, idx) => (
                                                                    <span key={idx} className="text-[12px] text-blue-500 underline underline-offset-2 hover:text-blue-700 cursor-pointer">{course}</span>
                                                                ))}
                                                                {user.enrollments.length > 3 && (
                                                                    <span className="text-[12px] text-gray-400 font-bold">...</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 text-center text-gray-700 font-medium">{user.progress}</td>
                                                        <td className="py-6 text-center text-gray-700 font-medium whitespace-nowrap">{user.lastLogin}</td>
                                                        <td className="py-6 text-center">
                                                            <span className={cn(
                                                                "text-[13px] font-medium",
                                                                user.status === 'Active' ? "text-emerald-500" : "text-red-500"
                                                            )}>
                                                                {user.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-6 text-center">
                                                            <GradiantButton
                                                                onClick={() => navigate(`/admin/student-details/${user.id}`)}
                                                                className="text-[12px] px-5 py-2 rounded-lg font-bold shadow-lg shadow-blue-200/50"
                                                            >
                                                                View Profile
                                                            </GradiantButton>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end items-center gap-1 sm:gap-2 mt-12 pb-2">
                                    <button className="flex items-center gap-1 text-[13px] font-bold text-gray-400 hover:text-[#7C3AED] transition-colors">
                                        <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
                                    </button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-[12px] text-[13px] font-bold text-gray-400 hover:bg-gray-50 hover:text-[#7C3AED]">1</button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-[12px] text-[13px] font-bold bg-gradient-to-br from-[#A5A6FF] to-[#7C3AED] text-white shadow-lg shadow-purple-200">2</button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-[12px] text-[13px] font-bold text-gray-400 hover:bg-gray-50 hover:text-[#7C3AED]">3</button>
                                    <span className="text-gray-300 font-bold px-1">...</span>
                                    <button className="flex items-center gap-1 text-[13px] font-bold text-gray-400 hover:text-[#7C3AED] transition-colors">
                                        <span className="hidden sm:inline">{t("next", "Next")}</span> <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
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

export default RegisteredUsersPage;
