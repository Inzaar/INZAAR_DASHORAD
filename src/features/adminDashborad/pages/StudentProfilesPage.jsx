import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import StatsCard from '../components/StatsCard';
import ChartStatsCard from '../components/ChartStatsCard';
import { Search, Plus, ChevronDown, MoreVertical, X, Eye, EyeOff, Loader } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { getStudentProfiles, adminCreateStudent } from '@/api/user';
import { useAuth } from '@/context/AuthContext';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/Pagination";

const StudentProfilesPage = ({ genderFilter: propGenderFilter = "All" }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const genderFilter = (user?.role === 'moderator' && user?.gender) ? user.gender : propGenderFilter;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('NAME'); // 'NAME' or 'PHONE'
    const [students, setStudents] = useState([]);
    const [statsData, setStatsData] = useState({
        totalRegistered: 0,
        active: 0,
        inactive: 0,
        pending: 0
    });

    // Pagination & Loading
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Add Student Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchStudentsData = async () => {
        try {
            setIsLoading(true);
            const res = await getStudentProfiles(currentPage, 10, searchText, statusFilter, genderFilter, fromDate, toDate, searchType);
            if (res?.data) {
                setStudents(res.data.students || []);
                setTotalPages(res.data.totalPages || 1);
                setStatsData(res.data.stats || {
                    totalRegistered: 0,
                    active: 0,
                    inactive: 0,
                    pending: 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch students data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        setStatusFilter("");
        fetchStudentsData();
    }, [genderFilter]);

    useEffect(() => {
        fetchStudentsData();
    }, [currentPage, statusFilter, fromDate, toDate]);

    const handleSearchClick = () => {
        setCurrentPage(1);
        fetchStudentsData();
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleSearchChange = (val) => {
        if (searchType === 'PHONE') {
            const numericValue = val.replace(/[^0-9+]/g, '');
            setSearchText(numericValue);
        } else {
            setSearchText(val);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setFormError('');

        if (newStudent.phone.length !== 11) {
            setFormError('Phone number must be exactly 11 digits.');
            return;
        }

        if (newStudent.password.length < 8) {
            setFormError('Password must be at least 8 characters long.');
            return;
        }
        if (!/[A-Z]/.test(newStudent.password)) {
            setFormError('Password must contain at least one uppercase letter.');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newStudent.password)) {
            setFormError('Password must contain at least one special symbol.');
            return;
        }

        setIsSubmitting(true);
        try {
            await adminCreateStudent(newStudent);
            setIsAddModalOpen(false);
            setNewStudent({
                firstname: '',
                lastname: '',
                email: '',
                phone: '',
                password: ''
            });
            fetchStudentsData();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to add student');
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeCount = students.filter(s => s.status === 'Active').length;
    const inactiveCount = students.filter(s => s.status === 'Inactive').length;
    const pendingCount = students.filter(s => s.status === 'Pending').length;

    const stats = [
        { title: `Total ${genderFilter === 'All' ? '' : genderFilter + ' '}${t('students', 'Students')}`, value: (statsData?.totalRegistered || 0).toString(), trend: "+ 2.4%", trendDirection: "up", trendText: t("vs_last_month", "vs last month"), type: "" },
        { title: t("active_students", "Active Students"), value: (statsData?.active || 0).toString(), trend: "+ 2.4%", trendDirection: "up", trendText: t("vs_last_month", "vs last month"), type: "Active" },
        { title: t("inactive_students", "Inactive Students"), value: (statsData?.inactive || 0).toString(), trend: "- 2.4%", trendDirection: "down", trendText: t("vs_last_month", "vs last month"), type: "In-active" },
        { title: `Pending ${genderFilter === 'All' ? '' : genderFilter + ' '}${t('students', 'Students')}`, value: (statsData?.pending || 0).toString(), trend: "+ 1.2%", trendDirection: "up", trendText: t("vs_last_month", "vs last month"), isGray: true, type: "Pending" },
    ];

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4">
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
                        className={`
                        transition-transform duration-300 ease-in-out z-40
                        lg:translate-x-0 lg:static lg:block
                        fixed left-0 top-0 shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-4 pr-2">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8 gap-4">
                                <div>
                                    <h2 className="text-[24px] font-bold text-gray-900 mb-1">{genderFilter === 'All' ? 'Students' : `${genderFilter} Students`}</h2>
                                    <p className="text-gray-500 text-[16px]">Manage All Your {genderFilter === 'All' ? '' : `${genderFilter} `}Students</p>
                                </div>
                                <GradiantButton
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="w-11 h-11 sm:w-auto sm:px-6 sm:py-2.5 bg-[#3758EE] text-white font-medium rounded-xl sm:rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <div className="flex items-center justify-center">
                                        <Plus size={20} strokeWidth={2.5} className="sm:bg-white sm:text-[#3758EE] sm:rounded-full sm:p-0.5" />
                                    </div>
                                    <span className="hidden sm:block">{t('add_new_students', 'Add New Students')}</span>
                                </GradiantButton>
                            </div>

                            {/* 4 Basic Stats Grid (Always shown) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat, index) => (
                                    <StatsCard
                                        key={index}
                                        {...stat}
                                        trendColor={stat.trendDirection === 'down' ? 'text-red-500' : 'text-green-500'}
                                        iconColor={stat.trendDirection === 'down' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
                                        onClick={() => {
                                            setStatusFilter(stat.type);
                                            setCurrentPage(1);
                                        }}
                                        className={statusFilter === stat.type ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                                    />
                                ))}
                            </div>

                            {/* 2 Chart Stats Grid (Shown only for All Students) */}
                            {genderFilter === 'All' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <ChartStatsCard
                                        title={t("male_students", "Total Male Students")}
                                        total={statsData?.genderBreakdown?.male?.total || 0}
                                        active={statsData?.genderBreakdown?.male?.active || 0}
                                        inactive={statsData?.genderBreakdown?.male?.inactive || 0}
                                        trend="2.4%"
                                        trendDirection="up"
                                        trendText={t("vs_last_month", "vs last month")}
                                        color="#00C896"
                                    />
                                    <ChartStatsCard
                                        title={t("female_students", "Total Female Students")}
                                        total={statsData?.genderBreakdown?.female?.total || 0}
                                        active={statsData?.genderBreakdown?.female?.active || 0}
                                        inactive={statsData?.genderBreakdown?.female?.inactive || 0}
                                        trend="2.4%"
                                        trendDirection="up"
                                        trendText={t("vs_last_month", "vs last month")}
                                        color="#00C896"
                                    />
                                </div>
                            )}

                            {/* Main Content Card */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                                <div className="mb-6 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t("students_list", "Students List")}</h3>
                                    <button
                                        onClick={fetchStudentsData}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? "animate-spin" : ""}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                                        {t("refresh", "Refresh")}
                                    </button>
                                </div>

                                {/* Filters - Desktop */}
                                <div className="hidden xl:flex flex-row items-end gap-6 mb-8">
                                    <div className='flex-1 flex gap-2 flex-col'>
                                        <p className="text-xs text-gray-400 font-bold tracking-wide">{t("advanced_search", "ADVANCED SEARCH")}</p>
                                        <div className="flex items-center bg-white border border-gray-200 rounded-md p-1 transition-all duration-200 group focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:border-blue-500 h-[42px]">
                                            <Search className="text-gray-400 w-[18px] h-[18px] ml-2 mr-2 shrink-0" />
                                            <input
                                                type="text"
                                                placeholder={t("search_by_name", "Search by name")}
                                                className="flex-1 bg-transparent text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none min-w-0"
                                                value={searchText}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                onKeyDown={handleSearchKeyDown}
                                            />
                                            <div className="flex items-center gap-1.5 shrink-0 mr-1">
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'PHONE') {
                                                            setSearchType('PHONE');
                                                            setSearchText('');
                                                        } else if (searchText.trim()) {
                                                            handleSearchClick();
                                                        }
                                                    }}
                                                    className={`px-4 py-2 text-[11px] whitespace-nowrap font-bold rounded-md transition-all duration-200 tracking-wide ${searchType === 'PHONE' ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-sm' : 'bg-[#C2C9FF] text-white hover:bg-[#A8B1FF]'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'NAME') {
                                                            setSearchType('NAME');
                                                            setSearchText('');
                                                        } else if (searchText.trim()) {
                                                            handleSearchClick();
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
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t("from", "From")}</span>
                                        <input
                                            type="date"
                                            className="px-3 bg-white border border-gray-200 rounded-md text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[150px] h-[42px]"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t("to", "To")}</span>
                                        <input
                                            type="date"
                                            className="px-3 bg-white border border-gray-200 rounded-md text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[150px] h-[42px]"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t("status", "Status")}</span>
                                        <div className="relative w-[150px]">
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full px-3 h-[42px] bg-white border border-gray-200 rounded-md text-[13px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                                            >
                                                <option value="">{t("all_statuses", "All Statuses")}</option>
                                                <option value="Active">{t("active", "Active")}</option>
                                                <option value="In-active">{t("in_active", "In-active")}</option>
                                                <option value="Pending">{t("pending", "Pending")}</option>
                                                <option value="Deleted">{t("deleted", "Deleted")}</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSearchText("");
                                            setStatusFilter("");
                                            setFromDate("");
                                            setToDate("");
                                            setCurrentPage(1);
                                        }}
                                        className="flex items-center gap-2 px-4 h-[42px] bg-[#E2E4E9] text-[#6A6F78] font-bold text-[13px] rounded-md hover:bg-gray-300 transition-colors whitespace-nowrap ml-auto"
                                    >
                                        <BiFilterAlt className="w-4 h-4" />
                                        {t("clear_filter", "Clear Filter")}
                                    </button>
                                </div>

                                {/* Filters - Responsive (Mobile Only) */}
                                <div className="flex xl:hidden flex-col gap-6 mb-8 relative">
                                    <div className='flex flex-col gap-4'>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("advanced_search", "ADVANCED SEARCH")}</p>
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => {
                                                    setSearchText("");
                                                    setStatusFilter("");
                                                    setFromDate("");
                                                    setToDate("");
                                                    setCurrentPage(1);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                                            >
                                                <BiFilterAlt className="w-4 h-4" />
                                                {t("clear_filter", "Clear Filter")}
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                                    className={`w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 transition-all ${isFilterOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400'}`}
                                                >
                                                    {isFilterOpen ? <X size={20} /> : <MoreVertical size={20} />}
                                                </button>

                                                {isFilterOpen && (
                                                    <div className="absolute right-0 top-full mt-3 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-5 z-[50]">
                                                        <div className="space-y-5">
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("status", "Status")}</label>
                                                                <div className="relative">
                                                                    <select
                                                                        value={statusFilter}
                                                                        onChange={(e) => setStatusFilter(e.target.value)}
                                                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer font-medium"
                                                                    >
                                                                        <option value="">{t("all_statuses", "All Statuses")}</option>
                                                                        <option value="Active">{t("active", "Active")}</option>
                                                                        <option value="In-active">{t("inactive", "Inactive")}</option>
                                                                        <option value="Pending">{t("pending", "Pending")}</option>
                                                                        <option value="Deleted">{t("deleted", "Deleted")}</option>
                                                                    </select>
                                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("from", "From")}</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none font-medium"
                                                                    value={fromDate}
                                                                    onChange={(e) => setFromDate(e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("to", "To")}</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none font-medium"
                                                                    value={toDate}
                                                                    onChange={(e) => setToDate(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Search Segment UI as per request */}
                                    <div className='flex flex-col gap-3'>
                                        <div className="flex flex-col bg-white border border-[#4E60FF] rounded-xl transition-all duration-200 shadow-sm overflow-hidden">
                                            <div className="flex items-center px-4 py-3 border-b border-gray-100">
                                                <Search className="text-gray-400 w-5 h-5 mr-3" />
                                                <input
                                                    type="text"
                                                    placeholder={searchType === "NAME" ? t("search_by_name", "Search by name") : t("search_by_phone", "Search by phone")}
                                                    className="w-full bg-transparent text-[15px] font-medium text-gray-700 focus:outline-none placeholder:text-gray-300"
                                                    value={searchText}
                                                    onChange={(e) => handleSearchChange(e.target.value)}
                                                    onKeyDown={handleSearchKeyDown}
                                                />
                                            </div>
                                            <div className="flex items-center p-2 gap-2 bg-[#F8FAFF]">
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'PHONE') {
                                                            setSearchType('PHONE');
                                                            setSearchText('');
                                                        } else if (searchText.trim()) {
                                                            handleSearchClick();
                                                        }
                                                    }}
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${searchType === 'PHONE' ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'NAME') {
                                                            setSearchType('NAME');
                                                            setSearchText('');
                                                        } else if (searchText.trim()) {
                                                            handleSearchClick();
                                                        }
                                                    }}
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${searchType === 'NAME' ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Students Table */}
                                <div className="overflow-x-auto relative min-h-[400px]">
                                    {isLoading && (
                                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                            <Loader className="w-10 h-10 text-[#3758EE] animate-spin" />
                                        </div>
                                    )}
                                    <table className="w-full min-w-[1000px]" style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                                        <thead>
                                            <tr>
                                                <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("name", "Name")}</th>
                                                <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("contact", "Contact")}</th>
                                                <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("enrollments", "Enrollments")}</th>
                                                <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("progress", "Progress")}</th>
                                                <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("last_login", "Last Login")}</th>
                                                <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("status", "Status")}</th>
                                                <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("action", "Action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.length === 0 ? (
                                                !isLoading && (
                                                    <tr>
                                                        <td colSpan="7" className="py-20 text-center bg-[#F8F9FA] rounded-xl">
                                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                                <Search size={48} className="opacity-20" />
                                                                <p className="font-medium text-[16px]">{t("no_students_matching", "No students found matching your criteria")}</p>
                                                                <button
                                                                    onClick={() => { setSearchText(""); setStatusFilter(""); fetchStudentsData(); }}
                                                                    className="text-blue-500 text-sm font-bold hover:underline"
                                                                >
                                                                    {t("clear_all_filters", "Clear all filters")}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            ) : (
                                                students.map((student) => (
                                                    <tr key={student.id} className="bg-[#F8F9FA] transition-colors group">
                                                        <td className="py-4 rounded-l-xl text-center">
                                                            <span className="text-[14px] text-gray-800">{t(student.name?.trim().replace(/\s+/g, ' '), student.name)}</span>
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            <div className="flex flex-col items-center justify-center">
                                                                <span className="text-[13px] text-gray-800 leading-tight">{student.email}</span>
                                                                <span className="text-[13px] text-gray-800">{student.phone}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            <div className="flex flex-col items-center justify-center">
                                                                {!student.enrollments || student.enrollments.length === 0 ? (
                                                                    <span className="text-gray-400 text-[13px]">Not Enrolled</span>
                                                                ) : (
                                                                    student.enrollments.map((course, idx) => (
                                                                        <span key={idx} className="text-[13px] text-[#6366F1] underline cursor-pointer hover:text-blue-800 decoration-1 underline-offset-2">
                                                                            {(course.title || course.name || course) === "new" ? t("new_badge", "new") : t((course.title || course.name || course), (course.title || course.name || course))}
                                                                        </span>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            <span className="text-[14px] text-gray-800">{student.progress || '0%'}</span>
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            <span className="text-[14px] text-gray-800">{student.lastLogin || '-'}</span>
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            <span className={`text-[14px] ${student.status === 'Active' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                                                {student.status === 'In-active' ? 'In-active' : student.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-center rounded-r-xl">
                                                            <button
                                                                onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white text-[13px] font-medium rounded-md hover:opacity-90 transition-all shadow-sm"
                                                            >
                                                                View Profile
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-end items-center mt-12 mb-2">
                                    <Pagination className="justify-end mx-0">
                                        <PaginationContent className="gap-2">
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => !isLoading && currentPage > 1 && setCurrentPage(prev => prev - 1)}
                                                    className={`cursor-pointer border-none hover:bg-transparent ${currentPage === 1 ? 'text-gray-200 pointer-events-none' : 'text-gray-500 hover:text-[#7C3AED]'}`}
                                                />
                                            </PaginationItem>

                                            {(() => {
                                                const pages = [];
                                                const showMax = 3; // Pages around current

                                                for (let i = 1; i <= totalPages; i++) {
                                                    if (
                                                        i === 1 ||
                                                        i === totalPages ||
                                                        (i >= currentPage - 1 && i <= currentPage + 1)
                                                    ) {
                                                        const isActive = currentPage === i;
                                                        pages.push(
                                                            <PaginationItem key={i}>
                                                                <PaginationLink
                                                                    onClick={() => !isLoading && setCurrentPage(i)}
                                                                    isActive={isActive}
                                                                    className={`cursor-pointer w-10 h-10 border-none rounded-[8px] text-[14px] font-bold transition-all ${isActive ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-md hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                                >
                                                                    {i}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        );
                                                    } else if (
                                                        (i === currentPage - 2 && i > 1) ||
                                                        (i === currentPage + 2 && i < totalPages)
                                                    ) {
                                                        pages.push(
                                                            <PaginationItem key={i}>
                                                                <PaginationEllipsis className="text-gray-400" />
                                                            </PaginationItem>
                                                        );
                                                    }
                                                }
                                                return pages;
                                            })()}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => !isLoading && currentPage < totalPages && setCurrentPage(prev => prev + 1)}
                                                    className={`cursor-pointer border-none hover:bg-transparent ${currentPage === totalPages ? 'text-gray-200 pointer-events-none' : 'text-gray-500 hover:text-[#7C3AED]'}`}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </div>
                        </div>
                    </main>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}} />
                </div>
            </div>

            {/* Add Student Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Add New Student</h3>
                                <p className="text-sm text-gray-500">Create a new student profile</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                    <X size={16} className="bg-red-500 text-white rounded-full p-0.5" />
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter First Name"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={newStudent.firstname}
                                        onChange={(e) => setNewStudent({ ...newStudent, firstname: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Last Name"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={newStudent.lastname}
                                        onChange={(e) => setNewStudent({ ...newStudent, lastname: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gender</label>
                                <select
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={newStudent.gender || ""}
                                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="Enter Email Address"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="Enter Phone Number"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={newStudent.phone}
                                    maxLength={11}
                                    onChange={(e) => {
                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                        setNewStudent({ ...newStudent, phone: numericValue });
                                    }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter Password"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12"
                                        value={newStudent.password}
                                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="flex-[2] py-3 px-4 bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Plus size={18} className="bg-white text-blue-600 rounded-full p-0.5" />
                                            Create Student
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfilesPage;
