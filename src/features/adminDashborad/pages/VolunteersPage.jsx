import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import StatsCard from '../components/StatsCard';
import {
    Search,
    ChevronDown,
    X,
    Loader,
    RefreshCw,
    ExternalLink,
    CheckCircle2,
    Clock,
    PhoneCall,
    Mail,
    MapPin,
    GraduationCap,
    Briefcase,
    Calendar,
    MessageSquare,
    Trash2
} from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import { FaWhatsapp } from 'react-icons/fa';
import {
    getVolunteers,
    getVolunteerStats,
    getVolunteerById,
    updateVolunteerStatus,
    addVolunteerRemark,
    deleteVolunteer
} from '@/api/volunteer';
import { CustomPagination } from "@/components/ui/Pagination";

const DEPARTMENTS = [
    "All",
    "Event Management",
    "Education & Learning",
    "IT & Website Management",
    "Video & Media Production",
    "Graphic Design",
    "Marketing & Promotion",
    "Research & Administration",
    "Other"
];

const STATUSES = ["All", "Pending", "Reviewed", "Contacted", "Accepted", "Rejected"];

const VolunteersPage = () => {
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data States
    const [volunteers, setVolunteers] = useState([]);
    const [statsData, setStatsData] = useState({
        total: 0,
        pending: 0,
        contacted: 0,
        accepted: 0,
        reviewed: 0,
        rejected: 0
    });

    // Pagination & Filter States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isStatsLoading, setIsStatsLoading] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Details Modal State
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [newRemark, setNewRemark] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAddingRemark, setIsAddingRemark] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // Fetch Stats
    const fetchStats = async () => {
        setIsStatsLoading(true);
        try {
            const res = await getVolunteerStats();
            if (res.data?.success && res.data?.data) {
                setStatsData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch volunteer stats:", err);
        } finally {
            setIsStatsLoading(false);
        }
    };

    // Fetch Volunteers List
    const fetchVolunteersData = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                search: searchText.trim(),
                status: statusFilter !== "All" ? statusFilter : undefined,
                department: departmentFilter !== "All" ? departmentFilter : undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined
            };

            const res = await getVolunteers(params);
            if (res.data?.success && res.data?.data) {
                setVolunteers(res.data.data.volunteers || []);
                setTotalPages(res.data.data.pagination?.totalPages || 1);
                setTotalCount(res.data.data.pagination?.total || 0);
            }
        } catch (err) {
            console.error("Failed to fetch volunteers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchVolunteersData(currentPage);
    }, [currentPage, statusFilter, departmentFilter]);

    const handleSearchClick = () => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchVolunteersData(1);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleClearFilters = () => {
        setSearchText("");
        setStatusFilter("All");
        setDepartmentFilter("All");
        setFromDate("");
        setToDate("");
        setCurrentPage(1);
        setTimeout(() => {
            fetchVolunteersData(1);
            fetchStats();
        }, 50);
    };

    // Open Details Modal
    const handleViewDetails = async (volunteerId) => {
        setIsDetailsOpen(true);
        setIsDetailsLoading(true);
        setStatusMessage("");
        try {
            const res = await getVolunteerById(volunteerId);
            if (res.data?.success && res.data?.data) {
                setSelectedVolunteer(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch volunteer details:", err);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    // Update Status
    const handleStatusChange = async (newStatus) => {
        if (!selectedVolunteer) return;
        setIsUpdatingStatus(true);
        setStatusMessage("");
        try {
            const res = await updateVolunteerStatus(selectedVolunteer._id, newStatus);
            if (res.data?.success && res.data?.data) {
                setSelectedVolunteer((prev) => ({ ...prev, status: newStatus }));
                setVolunteers((prev) =>
                    prev.map((v) => (v._id === selectedVolunteer._id ? { ...v, status: newStatus } : v))
                );
                setStatusMessage(`Status updated to ${newStatus}`);
                fetchStats();
            }
        } catch (err) {
            console.error("Failed to update status:", err);
            setStatusMessage("Failed to update status.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Add Remark
    const handleAddRemark = async (e) => {
        e.preventDefault();
        if (!newRemark.trim() || !selectedVolunteer) return;
        setIsAddingRemark(true);
        try {
            const res = await addVolunteerRemark(selectedVolunteer._id, newRemark.trim());
            if (res.data?.success && res.data?.data) {
                setSelectedVolunteer(res.data.data);
                setNewRemark("");
            }
        } catch (err) {
            console.error("Failed to add remark:", err);
        } finally {
            setIsAddingRemark(false);
        }
    };

    // Delete volunteer
    const handleDeleteVolunteer = async (id) => {
        if (!window.confirm("Are you sure you want to delete this volunteer application?")) return;
        try {
            await deleteVolunteer(id);
            setIsDetailsOpen(false);
            fetchVolunteersData(currentPage);
            fetchStats();
        } catch (err) {
            console.error("Failed to delete volunteer:", err);
            alert("Failed to delete volunteer application.");
        }
    };

    // Format phone for WhatsApp wa.me
    const getCleanWhatsAppLink = (phone) => {
        if (!phone) return "#";
        const clean = phone.replace(/[^0-9]/g, '');
        return `https://wa.me/${clean}`;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Pending":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "Reviewed":
                return "bg-indigo-50 text-indigo-700 border-indigo-200";
            case "Contacted":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "Accepted":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Rejected":
                return "bg-rose-50 text-rose-700 border-rose-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} title="Volunteers" />

                <div className="flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4">
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`
                            transition-transform duration-300 ease-in-out z-40
                            lg:translate-x-0 lg:static lg:block
                            fixed left-0 top-0 shadow-2xl
                            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        `}
                    />

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-2 sm:py-4 px-2 sm:pr-2 space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Volunteers</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Manage and review all Inzaar volunteer applications and skill profiles.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            fetchVolunteersData(currentPage);
                                            fetchStats();
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl shadow-xs hover:bg-gray-50 transition-colors"
                                    >
                                        <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>

                            {/* Top KPI Metric Cards (Simple - No Graphs) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatsCard
                                    title="Total Volunteers"
                                    value={statsData.total.toString()}
                                    trend="Total"
                                    trendDirection="up"
                                    trendText="Registered applications"
                                />
                                <StatsCard
                                    title="Pending Review"
                                    value={statsData.pending.toString()}
                                    trend="Awaiting"
                                    trendDirection="up"
                                    trendText="Needs initial screening"
                                />
                                <StatsCard
                                    title="Contacted"
                                    value={statsData.contacted.toString()}
                                    trend="In Touch"
                                    trendDirection="up"
                                    trendText="Outreach ongoing"
                                />
                                <StatsCard
                                    title="Accepted"
                                    value={statsData.accepted.toString()}
                                    trend="Active"
                                    trendDirection="up"
                                    trendText="Approved Inzaar volunteers"
                                />
                            </div>

                            {/* Volunteers Section Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-900">Volunteers List</h2>
                                <span className="bg-purple-50 text-purple-700 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-purple-100">
                                    {totalCount} total
                                </span>
                            </div>
                        </div>

                        {/* Search & Filters Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            {/* Search */}
                            <div className="md:col-span-4 flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    Search
                                </span>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by Name, WhatsApp, Email, or City..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                    />
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            {/* Department Filter */}
                            <div className="md:col-span-3 flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    Department
                                </span>
                                <div className="relative">
                                    <select
                                        value={departmentFilter}
                                        onChange={(e) => {
                                            setDepartmentFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none cursor-pointer pr-8"
                                    >
                                        <option value="All">All Departments</option>
                                        {DEPARTMENTS.filter(d => d !== "All").map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="md:col-span-3 flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    Status
                                </span>
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none cursor-pointer pr-8"
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s} value={s}>
                                                {s === "All" ? "All Statuses" : s}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-2 flex items-center gap-2">
                                <button
                                    onClick={handleSearchClick}
                                    className="flex-1 py-2.5 bg-[#3758EE] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
                                >
                                    Search
                                </button>
                                <button
                                    onClick={handleClearFilters}
                                    title="Clear all filters"
                                    className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
                                >
                                    <BiFilterAlt size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto relative min-h-[380px]">
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <Loader className="w-8 h-8 text-[#3758EE] animate-spin" />
                                </div>
                            )}

                            <table className="w-full min-w-[950px]" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr>
                                        <th className="text-left font-bold text-[13px] text-gray-500 uppercase tracking-wider px-4 pb-2">Full Name</th>
                                        <th className="text-left font-bold text-[13px] text-gray-500 uppercase tracking-wider px-4 pb-2">Contact</th>
                                        <th className="text-left font-bold text-[13px] text-gray-500 uppercase tracking-wider px-4 pb-2">City & Education</th>
                                        <th className="text-left font-bold text-[13px] text-gray-500 uppercase tracking-wider px-4 pb-2">Profession</th>
                                        <th className="text-left font-bold text-[13px] text-gray-500 uppercase tracking-wider px-4 pb-2">Departments</th>
                                        <th className="text-left font-bold text-[13px] text-gray-500 uppercase tracking-wider px-4 pb-2">Availability</th>
                                        <th className="text-center font-bold text-[13px] text-gray-500 uppercase tracking-wider px-4 pb-2">Status</th>
                                        <th className="text-center font-bold text-[13px] text-gray-500 uppercase tracking-wider px-4 pb-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {volunteers.length === 0 ? (
                                        !isLoading && (
                                            <tr>
                                                <td colSpan={8} className="py-16 text-center bg-[#F8F9FA] rounded-xl">
                                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                                        <Search size={40} className="opacity-25" />
                                                        <p className="font-semibold text-base text-gray-700">No volunteers found</p>
                                                        <p className="text-sm text-gray-400">No applications match your current filters.</p>
                                                        <button
                                                            onClick={handleClearFilters}
                                                            className="text-blue-600 text-sm font-bold hover:underline mt-2"
                                                        >
                                                            Clear all filters
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    ) : (
                                        volunteers.map((vol) => (
                                            <tr key={vol._id} className="bg-[#F8F9FA] hover:bg-gray-100/70 transition-colors group">
                                                {/* Name */}
                                                <td className="py-3 px-4 rounded-l-xl">
                                                    <div className="font-bold text-gray-900 text-sm">{vol.fullName}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {vol.createdAt ? new Date(vol.createdAt).toLocaleDateString() : ""}
                                                    </div>
                                                </td>

                                                {/* Contact */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-800 font-medium">
                                                        <a
                                                            href={getCleanWhatsAppLink(vol.whatsappNumber)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                                                            title="Chat on WhatsApp"
                                                        >
                                                            <FaWhatsapp size={14} />
                                                            {vol.whatsappNumber}
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[180px]">
                                                        {vol.email}
                                                    </div>
                                                </td>

                                                {/* City & Education */}
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-gray-800 font-medium">
                                                        {vol.city} {vol.cityOther ? `(${vol.cityOther})` : ""}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {vol.education === "Other" && vol.educationOther ? vol.educationOther : vol.education}
                                                    </div>
                                                </td>

                                                {/* Profession */}
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-gray-800">
                                                        {vol.profession === "Other" && vol.professionOther ? vol.professionOther : vol.profession}
                                                    </div>
                                                </td>

                                                {/* Departments */}
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                        {(vol.interestedDepartments || []).slice(0, 2).map((dept) => (
                                                            <span
                                                                key={dept}
                                                                className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] font-semibold border border-purple-100"
                                                            >
                                                                {dept}
                                                            </span>
                                                        ))}
                                                        {(vol.interestedDepartments || []).length > 2 && (
                                                            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-md text-[10px] font-semibold">
                                                                +{vol.interestedDepartments.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Availability */}
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                                        {(vol.availability || []).join(", ")}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(vol.status)}`}>
                                                        {vol.status || "Pending"}
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="py-3 px-4 rounded-r-xl text-center">
                                                    <GradiantButton
                                                        onClick={() => handleViewDetails(vol._id)}
                                                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs whitespace-nowrap"
                                                    >
                                                        View Details
                                                    </GradiantButton>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500">
                                    Showing page {currentPage} of {totalPages} ({totalCount} total)
                                </span>
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                />
                            </div>
                        )}
                    </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Volunteer Details Modal / Drawer */}
            {isDetailsOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Volunteer Application</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Submitted on {selectedVolunteer?.createdAt ? new Date(selectedVolunteer.createdAt).toLocaleString() : ""}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsDetailsOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 flex-1">
                            {isDetailsLoading ? (
                                <div className="py-20 flex items-center justify-center">
                                    <Loader className="w-8 h-8 text-[#3758EE] animate-spin" />
                                </div>
                            ) : selectedVolunteer ? (
                                <>
                                    {/* Primary Info Card */}
                                    <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-4 sm:p-5 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900">{selectedVolunteer.fullName}</h4>
                                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={13} className="text-gray-400" />
                                                    {selectedVolunteer.city} {selectedVolunteer.cityOther ? `(${selectedVolunteer.cityOther})` : ""}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Mail size={13} className="text-gray-400" />
                                                    {selectedVolunteer.email}
                                                </span>
                                            </div>
                                        </div>

                                        <a
                                            href={getCleanWhatsAppLink(selectedVolunteer.whatsappNumber)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                                        >
                                            <FaWhatsapp size={16} />
                                            Chat on WhatsApp
                                        </a>
                                    </div>

                                    {/* Status Updater */}
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Application Status</span>
                                            <span className="text-xs text-gray-400">Current status of this volunteer in our pipeline</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={selectedVolunteer.status || "Pending"}
                                                onChange={(e) => handleStatusChange(e.target.value)}
                                                disabled={isUpdatingStatus}
                                                className="px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Reviewed">Reviewed</option>
                                                <option value="Contacted">Contacted</option>
                                                <option value="Accepted">Accepted</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                            {isUpdatingStatus && <Loader size={14} className="animate-spin text-purple-600" />}
                                            {statusMessage && <span className="text-xs text-emerald-600 font-medium">{statusMessage}</span>}
                                        </div>
                                    </div>

                                    {/* Detailed Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1">
                                            <span className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
                                                <GraduationCap size={14} /> Education / Qualification
                                            </span>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {selectedVolunteer.education === "Other" && selectedVolunteer.educationOther
                                                    ? selectedVolunteer.educationOther
                                                    : selectedVolunteer.education}
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1">
                                            <span className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
                                                <Briefcase size={14} /> Profession
                                            </span>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {selectedVolunteer.profession === "Other" && selectedVolunteer.professionOther
                                                    ? selectedVolunteer.professionOther
                                                    : selectedVolunteer.profession}
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1 sm:col-span-2">
                                            <span className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
                                                <Calendar size={14} /> Availability
                                            </span>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {(selectedVolunteer.availability || []).map((avail) => (
                                                    <span key={avail} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                                                        {avail}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 sm:col-span-2">
                                            <span className="text-xs text-gray-400 font-semibold uppercase">Interested Departments</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(selectedVolunteer.interestedDepartments || []).map((dept) => (
                                                    <span key={dept} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-100">
                                                        {dept} {dept === "Other" && selectedVolunteer.interestedDepartmentsOther ? `(${selectedVolunteer.interestedDepartmentsOther})` : ""}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 sm:col-span-2">
                                            <span className="text-xs text-gray-400 font-semibold uppercase">Skills / Areas of Interest</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(selectedVolunteer.skills || []).map((skill) => (
                                                    <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium border border-gray-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {selectedVolunteer.skillsOther && (
                                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium border border-amber-200">
                                                        Other: {selectedVolunteer.skillsOther}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {selectedVolunteer.additionalInformation && (
                                            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1 sm:col-span-2">
                                                <span className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
                                                    <MessageSquare size={14} /> Previous Experience / Additional Information
                                                </span>
                                                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed mt-1">
                                                    {selectedVolunteer.additionalInformation}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Remarks & Notes */}
                                    <div className="border-t border-gray-100 pt-4 space-y-3">
                                        <h5 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                            Internal Admin Notes
                                        </h5>

                                        {(selectedVolunteer.adminRemarks || []).length > 0 ? (
                                            <div className="space-y-2 max-h-[140px] overflow-y-auto">
                                                {selectedVolunteer.adminRemarks.map((rem, i) => (
                                                    <div key={i} className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1 border border-gray-100">
                                                        <div className="flex justify-between text-gray-400">
                                                            <span className="font-semibold text-gray-700">{rem.addedByName || "Admin"}</span>
                                                            <span>{new Date(rem.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-gray-800">{rem.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No notes added yet for this applicant.</p>
                                        )}

                                        <form onSubmit={handleAddRemark} className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add internal note..."
                                                value={newRemark}
                                                onChange={(e) => setNewRemark(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isAddingRemark || !newRemark.trim()}
                                                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
                                            >
                                                {isAddingRemark ? "Adding..." : "Add Note"}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex justify-between items-center">
                            <button
                                onClick={() => handleDeleteVolunteer(selectedVolunteer?._id)}
                                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-2 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={14} />
                                Delete Application
                            </button>
                            <button
                                onClick={() => setIsDetailsOpen(false)}
                                className="px-5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolunteersPage;

