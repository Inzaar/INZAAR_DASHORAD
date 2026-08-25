import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, Calendar as CalendarIcon, MoreVertical, X, ChevronDown, Printer } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import SharedStudentTable from '@/components/shared/SharedStudentTable';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/context/AuthContext';

const ExportStudentReportsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchType, setSearchType] = useState('NAME');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // API Data State
    const [students, setStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState({ count: 0, trend: '+2.7%' });
    const [overview, setOverview] = useState({ successRate: '0%', inProgress: '0', activeStatus: 'Active' });
    const [performance, setPerformance] = useState({ percentage: 0, trendingUp: 5.2 });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Filter State
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Applied Top Filters State
    const [appliedStatus, setAppliedStatus] = useState('');
    const [appliedFrom, setAppliedFrom] = useState('');
    const [appliedTo, setAppliedTo] = useState('');

    // Bottom table filters (separate from top)
    const [tableSearch, setTableSearch] = useState('');
    const [tableSearchType, setTableSearchType] = useState('NAME');
    const [isTableFilterOpen, setIsTableFilterOpen] = useState(false);
    const [isPrintDropdownOpen, setIsPrintDropdownOpen] = useState(false);
    
    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        name: true,
        contact: true,
        phone: true,
        enrollments: true,
        progress: true,
        lastLogin: true,
        status: true,
        action: false
    });
    const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Fetch report data from API
    const fetchReport = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', 100000); // Fetch all records for export view

            if (user?.role === 'moderator' && user?.gender) {
                params.append('gender', user.gender);
            }

            // Apply filters
            if (appliedStatus) params.append('status', appliedStatus);
            if (appliedFrom) params.append('from', appliedFrom);
            if (appliedTo) params.append('to', appliedTo);

            // Apply table filters
            if (tableSearch.trim()) {
                params.append('search', tableSearch.trim());
                params.append('searchType', tableSearchType);
            }

            const res = await axiosInstance.get(`/admin/reports/students?${params.toString()}`);
            const data = res.data.data;

            setStudents(data.studentsList || []);
            setTotalStudents(data.totalStudents || { count: 0, trend: '+2.7%' });
            setOverview(data.overview || { successRate: '0%', inProgress: '0', activeStatus: 'Active' });
            setPerformance(data.overallPerformance || { percentage: 0, trendingUp: 5.2 });
            setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
            setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
        } catch (err) {
            console.error('Failed to fetch students report:', err);
        } finally {
            setLoading(false);
        }
    }, [appliedStatus, appliedFrom, appliedTo, tableSearch, tableSearchType]);

    // Real-time search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReport(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [tableSearch, tableSearchType, fetchReport]);

    // Handle top search
    const handleTopSearch = () => {
        setAppliedStatus(filterStatus);
        setAppliedFrom(filterFrom);
        setAppliedTo(filterTo);
        setTableSearch(searchQuery);
        setTableSearchType(searchType);
        setIsFilterDropdownOpen(false);
        setTimeout(() => fetchReport(1), 0);
    };

    // Handle top clear filter
    const handleTopClear = () => {
        setFilterStatus('');
        setFilterFrom('');
        setFilterTo('');
        setAppliedStatus('');
        setAppliedFrom('');
        setAppliedTo('');
        setSearchQuery('');
        setTableSearch('');
        setTimeout(() => fetchReport(1), 0);
    };

    // Handle table filter search
    const handleTableSearch = () => {
        fetchReport(1);
    };

    // Handle table clear filter
    const handleTableClear = () => {
        setTableSearch('');
        setTimeout(() => {
            fetchReport(1);
        }, 0);
    };

    // Handle table clear (uses the ref-less approach)  
    useEffect(() => {
        // This runs when table filters change via clear
    }, [tableSearch]);

    // Pagination handler
    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchReport(page);
        }
    };

    const handleExportCSV = () => {
        const headers = ["Name", "Email", "Phone Number", "Enrollments", "Progress", "Last Login", "Status"];
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        students.forEach(student => {
            const row = [
                `"${student.name || ''}"`,
                `"${student.email || ''}"`,
                `"${student.phone || ''}"`,
                `"${student.enrollments || 0}"`,
                `"${student.progress || ''}"`,
                `"${formatDate(student.lastLogin)}"`,
                `"${student.status || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "students_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const total = pagination.totalPages;
        const current = pagination.page;
        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                pages.push(i);
            }
            if (current < total - 2) pages.push('...');
            pages.push(total);
        }
        return pages;
    };
    
    const toggleColumn = (col) => {
        setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans print:block print:h-auto print:w-auto">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4 print:h-auto print:max-h-none print:max-w-none print:overflow-visible print:bg-white print:gap-0 print:block">
                <div className="print:hidden">
                    <Navbar onMenuClick={toggleSidebar} />
                </div>

                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative min-h-0 pb-4 print:block print:overflow-visible print:px-0 print:pb-0'>

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
                        fixed left-0 top-0 shadow-2xl print:hidden
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10 min-h-0 print:overflow-visible print:pb-0">
                        <div className="py-4 pr-2 print:p-0">
                            {/* Print-only Header */}
                            <div className="hidden print:flex flex-col mb-6 pb-4 border-b border-gray-200">
                                <style>{`@media print { @page { size: auto; margin: 0; } body { margin: 1.5cm !important; } }`}</style>
                                <h2 className="text-[24px] font-bold text-gray-900 mb-1">Inzaar Student Report</h2>
                                <p className="text-gray-500 text-[16px]">Date: {new Date().toLocaleDateString()}</p>
                            </div>

                            {/* Header */}
                            <div className="mb-6 print:hidden">
                                <h2 className="text-[24px] font-bold text-gray-900 mb-1">{t("export_student_reports", "Export Student Reports")}</h2>
                                <p className="text-gray-500 text-[16px]">{t("manage_students_reports", "Export All Your Students Reports")}</p>
                            </div>

                            {/* Top Filters */}
                            <div className="flex flex-wrap items-end justify-between xl:justify-start gap-4 mb-6 relative w-full print:hidden">

                                {/* Desktop Inline Filters (Hidden on Mobile/Tablet) */}
                                <div className="hidden xl:flex flex-wrap gap-4 items-end flex-1 w-full">
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">{t("all_students_filter", "All Students")}</option>
                                            <option value="active">{t("active_students", "Active Students")}</option>
                                            <option value="inactive">{t("inactive_students", "Inactive Students")}</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                        <div className="relative w-full">
                                            <input
                                                type="date"
                                                value={filterFrom}
                                                onChange={(e) => setFilterFrom(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                        <div className="relative w-full">
                                            <input
                                                type="date"
                                                value={filterTo}
                                                onChange={(e) => setFilterTo(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Shared Search & Clear Buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    <GradiantButton
                                        className="h-[42px] px-6 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                                        onClick={handleTopSearch}
                                    >
                                        <Search className="w-4 h-4" />
                                        Search
                                    </GradiantButton>
                                    <button
                                        className="h-[42px] px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                                        onClick={handleTopClear}
                                    >
                                        <BiFilterAlt className="w-4 h-4" />
                                        Clear Filter
                                    </button>
                                </div>

                                {/* Mobile 3-Dots Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                    className="xl:hidden p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>

                                {/* Mobile Dropdown Popup */}
                                {isFilterDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsFilterDropdownOpen(false)}
                                        />
                                        <div className="xl:hidden absolute top-full right-0 mt-2 w-[260px] p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col gap-4">
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                                <select
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">{t("all_students_filter", "All Students")}</option>
                                                    <option value="active">{t("active_students", "Active Students")}</option>
                                                    <option value="inactive">{t("inactive_students", "Inactive Students")}</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={filterFrom}
                                                        onChange={(e) => setFilterFrom(e.target.value)}
                                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={filterTo}
                                                        onChange={(e) => setFilterTo(e.target.value)}
                                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>


                            {/* Students List Table */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8 print:border-none print:shadow-none print:rounded-none print:p-0 print:m-0">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t("students_list", "Students List")}</h3>
                                </div>

                                {/* Filters - Desktop */}
                                <div className="hidden xl:flex flex-row gap-4 mb-8 print:hidden">
                                    <div className='flex-1 flex gap-2 flex-col'>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">{t("advanced_search", "ADVANCED SEARCH")}</p>
                                        <div className="flex relative bg-gray-50 border border-gray-200 rounded transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder={tableSearchType === "NAME" ? t("search_by_name", "Search by name") : t("search_by_phone", "Search by phone")}
                                                className="w-full pl-10 pr-32 py-2.5 bg-transparent text-sm focus:outline-none"
                                                value={tableSearch}
                                                onChange={(e) => setTableSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleTableSearch()}
                                            />
                                            <div className="flex items-center p-1 gap-2 border-l border-gray-200 ml-2">
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'PHONE') {
                                                            setTableSearchType('PHONE');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`px-4 py-2.5 text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${tableSearchType === 'PHONE' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-md' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'NAME') {
                                                            setTableSearchType('NAME');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`px-4 py-2.5 text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${tableSearchType === 'NAME' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-md' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 relative">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("columns", "Columns")}</span>
                                        <button
                                            onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none flex items-center justify-between min-w-[150px]"
                                        >
                                            {t("select_columns", "Select Columns")}
                                            <ChevronDown size={16} className="text-gray-400 ml-2" />
                                        </button>
                                        {isColumnDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsColumnDropdownOpen(false)} />
                                                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                                                    {Object.keys(visibleColumns).filter(col => col !== 'action').map((col) => (
                                                        <label key={col} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={visibleColumns[col]}
                                                                onChange={() => toggleColumn(col)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700 capitalize">{col.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-2 self-end">
                                        <button
                                            onClick={handleTableClear}
                                            className="flex items-center gap-2 px-4 h-10 bg-gray-200 text-gray-500 font-bold text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap print:hidden"
                                        >
                                            <BiFilterAlt className="w-4 h-4" />
                                            Clear
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsPrintDropdownOpen(!isPrintDropdownOpen)}
                                                className="flex items-center gap-2 px-4 h-10 bg-blue-100 text-blue-600 font-bold text-sm rounded hover:bg-blue-200 transition-colors whitespace-nowrap print:hidden"
                                            >
                                                <Printer className="w-4 h-4" />
                                                Print
                                            </button>
                                            {isPrintDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsPrintDropdownOpen(false)} />
                                                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                                                        <button
                                                            onClick={() => { window.print(); setIsPrintDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                                                        >
                                                            print as pdf
                                                        </button>
                                                        <button
                                                            onClick={() => { handleExportCSV(); setIsPrintDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                                                        >
                                                            print as csv
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Filters - Responsive (Mobile Only) */}
                                <div className="flex xl:hidden flex-col gap-6 mb-8 relative print:hidden">
                                    <div className='flex flex-col gap-4'>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("advanced_search", "ADVANCED SEARCH")}</p>
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="flex gap-2 w-full mt-4">
                                                <button
                                                    onClick={handleTableClear}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-500 font-bold text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap print:hidden"
                                                >
                                                    <BiFilterAlt className="w-4 h-4" />
                                                    Clear Filter
                                                </button>
                                                <div className="flex-1 relative">
                                                    <button
                                                        onClick={() => setIsPrintDropdownOpen(!isPrintDropdownOpen)}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-600 font-bold text-sm rounded hover:bg-blue-200 transition-colors whitespace-nowrap print:hidden"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                        Print
                                                    </button>
                                                    {isPrintDropdownOpen && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={() => setIsPrintDropdownOpen(false)} />
                                                            <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                                                                <button
                                                                    onClick={() => { window.print(); setIsPrintDropdownOpen(false); }}
                                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                                                                >
                                                                    print as pdf
                                                                </button>
                                                                <button
                                                                    onClick={() => { handleExportCSV(); setIsPrintDropdownOpen(false); }}
                                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                                                                >
                                                                    print as csv
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsTableFilterOpen(!isTableFilterOpen)}
                                                    className={`w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 transition-all ${isTableFilterOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400'}`}
                                                >
                                                    {isTableFilterOpen ? <X size={20} /> : <MoreVertical size={20} />}
                                                </button>

                                                {isTableFilterOpen && (
                                                    <div className="absolute right-0 top-full mt-3 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-5 z-[50]">
                                                        <div className="space-y-5">
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("columns", "Columns")}</label>
                                                                <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                                                    {Object.keys(visibleColumns).filter(col => col !== 'action').map((col) => (
                                                                        <label key={col} className="flex items-center gap-3 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={visibleColumns[col]}
                                                                                onChange={() => toggleColumn(col)}
                                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                                            />
                                                                            <span className="text-sm font-medium text-gray-700 capitalize">{col.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
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
                                                    placeholder={tableSearchType === "NAME" ? t("search_by_name", "Search by name") : t("search_by_phone", "Search by phone")}
                                                    className="w-full bg-transparent text-[15px] font-medium text-gray-700 focus:outline-none placeholder:text-gray-300"
                                                    value={tableSearch}
                                                    onChange={(e) => setTableSearch(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleTableSearch()}
                                                />
                                            </div>
                                            <div className="flex items-center p-2 gap-2 bg-[#F8FAFF]">
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'PHONE') {
                                                            setTableSearchType('PHONE');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${tableSearchType === 'PHONE' ? 'bg-[#4E60FF] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'NAME') {
                                                            setTableSearchType('NAME');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`flex-1 py-3 text-[11px] font-[900] rounded-lg transition-all duration-200 ${tableSearchType === 'NAME' ? 'bg-[#6366F1] text-white shadow-lg shadow-blue-500/20' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <SharedStudentTable
                                    students={students}
                                    loading={loading}
                                    pagination={pagination}
                                    onPageChange={goToPage}
                                    title={t("students_list", "Students List")}
                                    showDropdown={false}
                                    hasContainer={false}
                                    showTitle={false}
                                    visibleColumns={visibleColumns}
                                    hidePagination={true}
                                />
                            </div>
                        </div>
                    </main>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}} />
                </div>
            </div >
        </div >
    );
};

export default ExportStudentReportsPage;
