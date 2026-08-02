import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import PhoneInput from '@/components/ui/inputs/PhoneInput';
import StatsCard from '../components/StatsCard';
import UserCard from '../components/UserCard';
import { Search, Plus, ChevronDown, MoreVertical, X, Loader, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { getModeratorProfiles, adminCreateModerator, getAllUsers } from '@/api/user';
import AssignModeratorModal from '../components/student/AssignModeratorModal';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/Pagination";

const ModeratorsPage = ({ genderFilter = "All" }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('NAME'); // 'NAME' or 'PHONE'
    const [moderators, setModerators] = useState([]);
    const [statsData, setStatsData] = useState({
        totalModerators: 0,
        activeModerators: 0,
        inactiveModerators: 0,
        moderatorsInPool: 0
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

    // Add Moderator Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [newModerator, setNewModerator] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        gender: '',
        role: 'moderator',
        assignedFeatures: []
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const availableFeatures = [
        "Calendar",
        "Courses Management",
        "Reports & Logs",
        "Student Profiles"
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchModeratorsData = async () => {
        try {
            setIsLoading(true);
            const res = await getModeratorProfiles(currentPage, 6, searchText, statusFilter, genderFilter, fromDate, toDate, searchType);
            if (res?.data) {
                setModerators(res.data.moderators || []);
                setTotalPages(res.data.totalPages || 1);
                setStatsData(res.data.stats || {
                    totalModerators: 0,
                    activeModerators: 0,
                    inactiveModerators: 0,
                    moderatorsInPool: 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch moderators:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        setStatusFilter("");
        fetchModeratorsData();
    }, [genderFilter]);

    useEffect(() => {
        fetchModeratorsData();
    }, [currentPage, statusFilter, fromDate, toDate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchModeratorsData();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchText, searchType]);

    const handleSearchClick = () => {
        setCurrentPage(1);
        fetchModeratorsData();
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

    const handleFeatureToggle = (feature) => {
        setNewModerator(prev => {
            const features = prev.assignedFeatures.includes(feature)
                ? prev.assignedFeatures.filter(f => f !== feature)
                : [...prev.assignedFeatures, feature];
            return { ...prev, assignedFeatures: features };
        });
    };

    const handleAddModerator = async (e) => {
        e.preventDefault();
        setFormError('');

        if (newModerator.username && newModerator.username.includes(' ')) {
            setFormError('Username cannot contain spaces.');
            return;
        }

        const rawDigits = (newModerator.phone || '').replace(/\D/g, '');
        if (!newModerator.phone || rawDigits.length < 10) {
            setFormError('Please enter a valid phone number.');
            return;
        }

        if (newModerator.password.length < 8) {
            setFormError('Password must be at least 8 characters long.');
            return;
        }
        if (!/[A-Z]/.test(newModerator.password)) {
            setFormError('Password must contain at least one uppercase letter.');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newModerator.password)) {
            setFormError('Password must contain at least one special symbol.');
            return;
        }

        setIsAddModalOpen(false);
        setIsAssignModalOpen(true);
    };

    const handleFinalCreate = async (data) => {
        setIsSubmitting(true);
        setFormError('');
        try {
            const moderatorData = {
                ...newModerator,
                role: data.selectedRole || 'moderator',
                assignedFeatures: data.features
            };
            await adminCreateModerator(moderatorData);
            toast.success("Moderator created successfully!");
            setIsAssignModalOpen(false);
            setNewModerator({
                firstname: '',
                lastname: '',
                username: '',
                email: '',
                phone: '',
                password: '',
                gender: '',
                role: 'moderator',
                assignedFeatures: []
            });
            fetchModeratorsData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to add moderator';
            setFormError(errorMsg);
            toast.error(errorMsg);
            setIsAddModalOpen(true); // Re-open step 1 if error
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeCount = moderators.filter(m => m.status === 'active' || m.status === undefined).length;
    const inactiveCount = moderators.filter(m => m.status === 'in-active').length;
    const poolCount = moderators.filter(m => m.status === 'pending').length;

    const stats = [
        { title: `Total ${genderFilter === 'All' ? '' : genderFilter + ' '}Moderators`, value: (statsData?.totalModerators || 0).toString(), trend: "2.4%", trendDirection: "up", trendText: "vs last month", type: "" },
        { title: "Active Moderators", value: (statsData?.activeModerators || 0).toString(), trend: "2.4%", trendDirection: "up", trendText: "vs last month", type: "Active" },
        { title: "Inactive Moderators", value: (statsData?.inactiveModerators || 0).toString(), trend: "2.4%", trendDirection: "down", trendText: "vs last month", type: "Inactive" },
        { title: "Moderators in Pool", value: (statsData?.moderatorsInPool || 0).toString(), trend: "2.4%", trendDirection: "up", trendText: "vs last month", type: "Pool" },
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
                        <div className="py-2 sm:py-4 px-2 sm:pr-2">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8 gap-4">
                                <div>
                                    <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900 mb-1">{genderFilter === 'All' ? 'Moderators' : `${genderFilter} Moderators`}</h2>
                                    <p className="text-gray-400 sm:text-gray-500 text-[14px] sm:text-[16px]">Manage All Your {genderFilter === 'All' ? '' : `${genderFilter} `}Moderators</p>
                                </div>
                                <GradiantButton
                                    onClick={() => {
                                        setIsAddModalOpen(true);
                                        setModalStep(1);
                                    }}
                                    className="w-11 h-11 sm:w-auto sm:px-6 sm:py-2.5 bg-[#3758EE] text-white font-medium rounded-xl sm:rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <div className="flex items-center justify-center">
                                        <Plus size={20} strokeWidth={2.5} className="sm:bg-white sm:text-[#3758EE] sm:rounded-full sm:p-0.5" />
                                    </div>
                                    <span className="hidden sm:block">Add New Moderator</span>
                                </GradiantButton>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                            {/* Main Content Card */}
                            <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[600px] relative">
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[24px]">
                                        <Loader className="w-10 h-10 text-[#3758EE] animate-spin" />
                                    </div>
                                )}

                                <div className="mb-6 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Moderator List</h3>
                                    <button
                                        onClick={fetchModeratorsData}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? "animate-spin" : ""}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                                        Refresh
                                    </button>
                                </div>

                                {/* Filters */}
                                {/* Filters - Desktop */}
                                <div className="hidden xl:flex flex-row gap-4 mb-8">
                                    <div className='flex-1 flex gap-2 flex-col'>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">ADVANCED SEARCH</p>
                                        <div className="flex relative bg-gray-50 border border-gray-200 rounded transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder={`Search by ${searchType.toLowerCase()}`}
                                                className="w-full pl-10 pr-32 py-2.5 bg-transparent text-sm focus:outline-none"
                                                value={searchText}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                onKeyDown={handleSearchKeyDown}
                                            />
                                            <div className="flex items-center p-1 gap-2 border-l border-gray-200 ml-2">
                                                <button
                                                    onClick={() => {
                                                        if (searchType !== 'PHONE') {
                                                            setSearchType('PHONE');
                                                            setSearchText('');
                                                        } else if (searchText.trim()) {
                                                            handleSearchClick();
                                                        }
                                                    }}
                                                    className={`px-4 py-2.5 text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${searchType === 'PHONE' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-md' : 'bg-[#D6D9FF] text-white'}`}
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
                                                    className={`px-4 py-2.5 text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${searchType === 'NAME' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-md' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">From</span>
                                        <input
                                            type="date"
                                            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">To</span>
                                        <input
                                            type="date"
                                            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                                        <div className="relative">
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Pool">Pool</option>
                                                <option value="Deleted">Deleted</option>
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
                                        className="flex items-center gap-2 px-4 h-10 self-end bg-gray-200 text-gray-500 font-bold text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap"
                                    >
                                        <BiFilterAlt className="w-4 h-4" />
                                        Clear
                                    </button>
                                </div>

                                {/* Filters - Responsive (Mobile Only) */}
                                <div className="flex xl:hidden flex-col gap-6 mb-8 relative">
                                    <div className='flex flex-col gap-4'>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">ADVANCED SEARCH</p>
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
                                                Clear Filter
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
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                                                                <div className="relative">
                                                                    <select
                                                                        value={statusFilter}
                                                                        onChange={(e) => setStatusFilter(e.target.value)}
                                                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer font-medium"
                                                                    >
                                                                        <option value="">All Statuses</option>
                                                                        <option value="Active">Active</option>
                                                                        <option value="Inactive">Inactive</option>
                                                                        <option value="Pool">Pool</option>
                                                                        <option value="Deleted">Deleted</option>
                                                                    </select>
                                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">From</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none font-medium"
                                                                    value={fromDate}
                                                                    onChange={(e) => setFromDate(e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">To</label>
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
                                                    placeholder={`Search by ${searchType.toLowerCase()}`}
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
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${searchType === 'PHONE' ? 'bg-[#4E60FF] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
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
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${searchType === 'NAME' ? 'bg-[#6366F1] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Moderators Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {moderators.length === 0 ? (
                                        !isLoading && (
                                            <div className="col-span-full py-20 text-center">
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <Search size={48} className="opacity-20" />
                                                    <p className="font-medium text-[16px]">No moderators found matching your criteria</p>
                                                    <button
                                                        onClick={() => { setSearchText(""); setStatusFilter(""); fetchModeratorsData(); }}
                                                        className="text-blue-500 text-sm font-bold hover:underline"
                                                    >
                                                        Clear all filters
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        moderators.map((mod) => (
                                            <UserCard
                                                key={mod.id}
                                                name={mod.name}
                                                id={mod.id}
                                                image={mod.profileImageUrl}
                                                status={mod.status === 'Deleted' || mod.isDeleted ? "deleted" : (mod.isActive ? "online" : "offline")}
                                                email={mod.email}
                                                phone={mod.phone}
                                                joiningDate={new Date(mod.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                                                performance={mod.assignedBatches > 0 ? `${mod.assignedBatches} Batches` : "No Batches"}
                                                onViewClick={() => navigate(`/moderator-details/${mod.id}`)}
                                            />
                                        ))
                                    )}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-end items-center mt-12">
                                        <Pagination className="mx-0 w-auto">
                                            <PaginationContent className="gap-2">
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() => !isLoading && currentPage > 1 && setCurrentPage(prev => prev - 1)}
                                                        className={`cursor-pointer border-none hover:bg-transparent ${currentPage === 1 ? 'text-gray-200 pointer-events-none' : 'text-gray-500 hover:text-[#7C3AED]'}`}
                                                    />
                                                </PaginationItem>

                                                {(() => {
                                                    const pages = [];
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
                                                                        className={`cursor-pointer w-10 h-10 border-none rounded-[12px] text-[14px] font-bold transition-all ${isActive ? 'bg-gradient-to-br from-[#A5A6FF] to-[#7C3AED] text-white shadow-lg shadow-purple-200 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-[#7C3AED]'}`}
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
                                )}
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

            {/* Add Moderator Modal - Step 1 */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-[550px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Add New Moderator</h3>
                                <p className="text-sm text-gray-500">Step 1: Basic Information</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddModerator} className="p-6 space-y-4">
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
                                        value={newModerator.firstname}
                                        onChange={(e) => setNewModerator({ ...newModerator, firstname: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Last Name"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={newModerator.lastname}
                                        onChange={(e) => setNewModerator({ ...newModerator, lastname: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter Username"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={newModerator.username}
                                    onChange={(e) => setNewModerator({ ...newModerator, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="Enter Email Address"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={newModerator.email}
                                    onChange={(e) => setNewModerator({ ...newModerator, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                <PhoneInput
                                    name="phone"
                                    value={newModerator.phone}
                                    onChange={(e) => setNewModerator({ ...newModerator, phone: e.target.value })}
                                    label={null}
                                    containerClassName="w-full relative"
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
                                        value={newModerator.password}
                                        onChange={(e) => setNewModerator({ ...newModerator, password: e.target.value })}
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

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gender</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={newModerator.gender}
                                        onChange={(e) => setNewModerator({ ...newModerator, gender: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
                                    type="submit"
                                    className="flex-[2] py-3 px-4 bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    Next
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Step 2: Assign Moderator Modal (Shared Component) */}
            <AssignModeratorModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onSave={handleFinalCreate}
            />
        </div>
    );
};

export default ModeratorsPage;
