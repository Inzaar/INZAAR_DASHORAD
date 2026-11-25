import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, Calendar as CalendarIcon, MoreVertical, X, ChevronDown, Loader, Printer } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import axiosInstance from '@/api/axiosInstance';
import { CustomPagination } from '@/components/ui/Pagination';

import { useAuth } from '@/context/AuthContext';

const ExportModeratorReportsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // API Data State
    const [moderators, setModerators] = useState([]);
    const [totalModerators, setTotalModerators] = useState({ count: 0, trend: '+2.7%' });
    const [overview, setOverview] = useState({ successRate: '0%', inProgress: '0', activeStatus: 'Active' });
    const [performance, setPerformance] = useState({ percentage: 0, trendingUp: 0 });
    const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 });

    // Client-side Pagination State (10 items per page)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter State (unified across top and table)
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');

    // Table Filter State
    const [tableSearch, setTableSearch] = useState('');
    const [tableSearchType, setTableSearchType] = useState('NAME');
    const [isTableFilterOpen, setIsTableFilterOpen] = useState(false);
    const [isPrintDropdownOpen, setIsPrintDropdownOpen] = useState(false);

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        name: true,
        contact: true,
        phone: true,
        manageBatches: true,
        progress: true,
        lastLogin: true,
        status: true
    });
    const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Fetch report data from API
    const fetchReport = useCallback(async (page = 1, customParams = {}) => {
        setLoading(true);
        try {
            const currentStatus = customParams.status !== undefined ? customParams.status : filterStatus;
            const currentFrom = customParams.from !== undefined ? customParams.from : filterFrom;
            const currentTo = customParams.to !== undefined ? customParams.to : filterTo;
            const currentSearch = customParams.search !== undefined ? customParams.search : tableSearch;
            const currentSearchType = customParams.searchType !== undefined ? customParams.searchType : tableSearchType;

            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', 100000); // Fetch all records for export view

            if (user?.role === 'moderator' && user?.gender) {
                params.append('gender', user.gender);
            }

            if (currentStatus) params.append('status', currentStatus);
            if (currentFrom) params.append('from', currentFrom);
            if (currentTo) params.append('to', currentTo);

            if (currentSearch && currentSearch.trim()) {
                params.append('search', currentSearch.trim());
                params.append('searchType', currentSearchType);
            }

            const res = await axiosInstance.get(`/admin/reports/moderators?${params.toString()}`);
            const data = res.data.data;

            setModerators(data.moderatorsList || []);
            setTotalModerators(data.totalModerators || { count: 0, trend: '+2.7%' });
            setOverview(data.overview || { successRate: '0%', inProgress: '0', activeStatus: 'Active' });
            setPerformance(data.overallPerformance || { percentage: 0, trendingUp: 0 });
            setPagination(data.pagination || { page: 1, limit: 5, total: 0, totalPages: 0 });
        } catch (err) {
            console.error('Failed to fetch moderators report:', err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterFrom, filterTo, tableSearch, tableSearchType, user]);

    // Initial mount and real-time search effect
    const isFirstMount = useRef(true);
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            fetchReport(1);
            return;
        }
        const timer = setTimeout(() => {
            fetchReport(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [tableSearch, tableSearchType]);

    const handleStatusChange = (val) => {
        setFilterStatus(val);
        fetchReport(1, { status: val });
    };

    const handleFromChange = (val) => {
        setFilterFrom(val);
        fetchReport(1, { from: val });
    };

    const handleToChange = (val) => {
        setFilterTo(val);
        fetchReport(1, { to: val });
    };

    // Top filter handlers
    const handleTopSearch = () => {
        setIsFilterDropdownOpen(false);
        fetchReport(1, {
            status: filterStatus,
            from: filterFrom,
            to: filterTo,
            search: tableSearch,
            searchType: tableSearchType
        });
    };

    const handleTopClear = () => {
        setFilterStatus('');
        setFilterFrom('');
        setFilterTo('');
        setTableSearch('');
        setIsFilterDropdownOpen(false);
        fetchReport(1, { status: '', from: '', to: '', search: '' });
    };

    // Table filter handlers
    const handleTableSearch = () => fetchReport(1);
    const handleTableClear = () => {
        handleTopClear();
    };

    // Client-side filtering memo
    const filteredModerators = useMemo(() => {
        return (moderators || []).filter(mod => {
            // 1. Status Filter: strictly match Active vs Inactive
            if (filterStatus === 'active' && (mod.status || '').toLowerCase() !== 'active') {
                return false;
            }
            if (filterStatus === 'inactive' && (mod.status || '').toLowerCase() === 'active') {
                return false;
            }

            // 2. Date Filter
            if (filterFrom || filterTo) {
                const dateVal = mod.lastLogin || mod.joiningDate;
                if (!dateVal) return false;
                const d = new Date(dateVal);
                if (isNaN(d.getTime())) return false;
                const modDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (filterFrom && modDateStr < filterFrom) return false;
                if (filterTo && modDateStr > filterTo) return false;
            }

            // 3. Search Filter
            if (tableSearch && tableSearch.trim()) {
                const q = tableSearch.trim().toLowerCase();
                if (tableSearchType === 'NAME') {
                    const name = (mod.name || '').toLowerCase();
                    const qWords = q.split(/\s+/).filter(Boolean);
                    const matches = qWords.every(word => name.includes(word));
                    if (!matches) return false;
                } else if (tableSearchType === 'EMAIL') {
                    const email = (mod.email || '').toLowerCase();
                    if (!email.includes(q)) return false;
                } else if (tableSearchType === 'PHONE') {
                    const phone = (mod.phone || '').replace(/\D/g, '');
                    const qPhone = q.replace(/\D/g, '');
                    if (qPhone && !phone.includes(qPhone)) return false;
                }
            }

            return true;
        });
    }, [moderators, filterStatus, filterFrom, filterTo, tableSearch, tableSearchType]);

    // Client-side pagination calculations
    const totalPages = Math.ceil(filteredModerators.length / itemsPerPage) || 1;

    // Reset to page 1 when any filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterFrom, filterTo, tableSearch, tableSearchType]);

    // Ensure currentPage stays within valid range
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const paginatedModerators = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredModerators.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredModerators, currentPage, itemsPerPage]);

    // Pagination
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    const handleExportCSV = () => {
        const headers = [];
        if (visibleColumns.name) headers.push('"Name"');
        if (visibleColumns.contact) headers.push('"Email"');
        if (visibleColumns.phone) headers.push('"Phone Number"');
        if (visibleColumns.manageBatches) headers.push('"Manage Batch\'s"');
        if (visibleColumns.progress) headers.push('"Progress"');
        if (visibleColumns.lastLogin) headers.push('"Last Login"');
        if (visibleColumns.status) headers.push('"Status"');

        const csvRows = [];
        csvRows.push(headers.join(','));

        filteredModerators.forEach(mod => {
            const batches = Array.isArray(mod.batches)
                ? mod.batches.filter(Boolean)
                : (mod.batches ? [mod.batches] : []);

            const batchEntries = batches.length > 0 ? batches : ["N/A"];
            const rowsToOutput = visibleColumns.manageBatches ? batchEntries : [null];

            rowsToOutput.forEach(batchName => {
                const row = [];
                if (visibleColumns.name) {
                    row.push(`"${(mod.name || '').toString().replace(/"/g, '""')}"`);
                }
                if (visibleColumns.contact) {
                    row.push(`"${(mod.email || '').toString().replace(/"/g, '""')}"`);
                }
                if (visibleColumns.phone) {
                    let p = String(mod.phone || '').trim();
                    if (p && !p.startsWith('+') && p.startsWith('92')) {
                        p = '+' + p;
                    }
                    const cleanP = p.replace(/"/g, '').replace(/,/g, '').trim();
                    row.push(cleanP ? `\u200C${cleanP}` : '""');
                }
                if (visibleColumns.manageBatches) {
                    row.push(`"${(batchName || '').toString().replace(/"/g, '""')}"`);
                }
                if (visibleColumns.progress) {
                    row.push(`"${(mod.progress || '').toString().replace(/"/g, '""')}"`);
                }
                if (visibleColumns.lastLogin) {
                    row.push(`"${formatDate(mod.lastLogin)}"`);
                }
                if (visibleColumns.status) {
                    row.push(`"${(mod.status || '').toString().replace(/"/g, '""')}"`);
                }
                csvRows.push(row.join(','));
            });
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moderator_reports_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
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

                <div className='flex flex-col lg:flex-row px-2 sm:px-4 gap-3 sm:gap-4 flex-1 overflow-hidden relative min-h-0 pb-4 print:block print:overflow-visible print:px-0 print:pb-0'>

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

                    <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar pb-6 sm:pb-10 min-h-0 print:overflow-visible print:pb-0">
                        <div className="py-2 sm:py-4 px-1 sm:px-2 print:p-0">
                            {/* Print-only Header */}
                            <div className="hidden print:flex flex-col mb-6 pb-4 border-b border-gray-200">
                                <style>{`@media print { @page { size: auto; margin: 0; } body { margin: 1.5cm !important; } }`}</style>
                                <h2 className="text-[24px] font-bold text-gray-900 mb-1">Inzaar Moderator Report</h2>
                                <p className="text-gray-500 text-[16px]">Date: {new Date().toLocaleDateString()}</p>
                            </div>

                            {/* Header */}
                            <div className="mb-4 sm:mb-6 print:hidden">
                                <h2 className="text-[18px] sm:text-[22px] md:text-[24px] font-bold text-gray-900 mb-0.5 sm:mb-1">{t("export_moderator_reports", "Export Moderator Reports")}</h2>
                                <p className="text-gray-400 sm:text-gray-500 text-xs sm:text-sm md:text-base">{t("manage_moderators_reports", "Export All Your Moderators Reports")}</p>
                            </div>

                            {/* Top Filters */}
                            <div className="flex flex-wrap items-end justify-between xl:justify-start gap-4 mb-6 relative w-full print:hidden">
                                <div className="hidden xl:flex flex-wrap gap-4 items-end flex-1 w-full">
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                        <select value={filterStatus} onChange={(e) => handleStatusChange(e.target.value)} className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                                            <option value="">{t("all_moderators_filter", "All Moderators")}</option>
                                            <option value="active">{t("active_moderators", "Active Moderators")}</option>
                                            <option value="inactive">{t("inactive_moderators", "Inactive Moderators")}</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                        <div className="relative w-full">
                                            <input type="date" value={filterFrom} onChange={(e) => handleFromChange(e.target.value)} className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                        <div className="relative w-full">
                                            <input type="date" value={filterTo} onChange={(e) => handleToChange(e.target.value)} className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 items-center w-full justify-between xl:justify-start xl:w-auto">
                                    <div className="xl:hidden w-[140px] shrink-0">
                                        <select value={filterStatus} onChange={(e) => handleStatusChange(e.target.value)} className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer h-[42px]">
                                            <option value="">{t("all_moderators_filter", "All Moderators")}</option>
                                            <option value="active">{t("active_moderators", "Active Moderators")}</option>
                                            <option value="inactive">{t("inactive_moderators", "Inactive Moderators")}</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <GradiantButton className="h-[42px] px-3 sm:px-6 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shrink-0" onClick={handleTopSearch}>
                                            <Search className="w-4 h-4" />
                                            <span className="hidden sm:inline">Search</span>
                                        </GradiantButton>
                                        <button className="h-[42px] px-3 sm:px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors shrink-0" onClick={handleTopClear}>
                                            <BiFilterAlt className="w-4 h-4" />
                                            <span className="hidden sm:inline">Clear Filter</span>
                                        </button>
                                        <button type="button" onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="xl:hidden h-[42px] px-2 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors shrink-0">
                                            <MoreVertical className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {isFilterDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsFilterDropdownOpen(false)} />
                                        <div className="xl:hidden absolute top-full right-0 mt-2 w-[260px] p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col gap-4">

                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                                <div className="relative">
                                                    <input type="date" value={filterFrom} onChange={(e) => handleFromChange(e.target.value)} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                                <div className="relative">
                                                    <input type="date" value={filterTo} onChange={(e) => handleToChange(e.target.value)} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>


                            {/* Moderators List Table */}
                            <div className="bg-white rounded-xl sm:rounded-[24px] p-3 sm:p-5 xl:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-8 print:border-none print:shadow-none print:rounded-none print:p-0 print:m-0">
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{t("moderators_list", "Moderators List")}</h3>
                                </div>

                                {/* Filters - Desktop */}
                                <div className="hidden xl:flex flex-row items-end gap-3 mb-6 print:hidden">
                                    <div className='flex-1 flex gap-2 flex-col'>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("advanced_search", "ADVANCED SEARCH")}</p>
                                        <div className="flex relative bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 h-[42px] items-center">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder={tableSearchType === "NAME" ? t("search_by_name", "Search by name") : tableSearchType === "EMAIL" ? t("search_by_email", "Search by email") : t("search_by_phone", "Search by phone")}
                                                className="w-full pl-9 pr-4 h-[42px] bg-transparent text-sm focus:outline-none"
                                                value={tableSearch}
                                                onChange={(e) => setTableSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleTableSearch()}
                                            />
                                            <div className="flex items-center p-1 gap-1.5 border-l border-gray-200 ml-2 shrink-0 pr-1.5">
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'PHONE') {
                                                            setTableSearchType('PHONE');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 h-[32px] text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 flex items-center justify-center ${tableSearchType === 'PHONE' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-sm' : 'bg-[#D6D9FF] text-white hover:bg-[#A8B1FF]'}`}
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
                                                    className={`px-3 py-1.5 h-[32px] text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 flex items-center justify-center ${tableSearchType === 'NAME' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-sm' : 'bg-[#D6D9FF] text-white hover:bg-[#A8B1FF]'}`}
                                                >
                                                    NAME
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'EMAIL') {
                                                            setTableSearchType('EMAIL');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 h-[32px] text-[10px] whitespace-nowrap font-bold rounded-lg transition-all duration-200 flex items-center justify-center ${tableSearchType === 'EMAIL' ? 'bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white shadow-sm' : 'bg-[#D6D9FF] text-white hover:bg-[#A8B1FF]'}`}
                                                >
                                                    EMAIL
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 relative">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("columns", "Columns")}</span>
                                        <button
                                            onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                                            className="px-4 h-[42px] bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none flex items-center justify-between min-w-[150px] hover:bg-gray-100 transition-colors"
                                        >
                                            {t("select_columns", "Select Columns")}
                                            <ChevronDown size={16} className="text-gray-400 ml-2" />
                                        </button>
                                        {isColumnDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsColumnDropdownOpen(false)} />
                                                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                                                    {Object.keys(visibleColumns).map((col) => (
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

                                    <div className="flex gap-2 items-center">
                                        <button
                                            onClick={handleTableClear}
                                            className="flex items-center gap-2 px-4 h-[42px] bg-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-300 transition-colors whitespace-nowrap print:hidden"
                                        >
                                            <BiFilterAlt className="w-4 h-4" />
                                            Clear
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsPrintDropdownOpen(!isPrintDropdownOpen)}
                                                className="flex items-center gap-2 px-4 h-[42px] bg-blue-100 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-200 transition-colors whitespace-nowrap print:hidden"
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
                                <div className="flex xl:hidden flex-col gap-4 mb-6 relative print:hidden">
                                    <div className='flex flex-col gap-2'>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("advanced_search", "ADVANCED SEARCH")}</p>
                                        <div className="flex items-center gap-2 w-full">
                                            <button
                                                onClick={handleTableClear}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 h-10 sm:h-11 bg-gray-200 text-gray-600 font-bold text-xs sm:text-sm rounded-xl hover:bg-gray-300 transition-colors whitespace-nowrap print:hidden"
                                            >
                                                <BiFilterAlt className="w-4 h-4" />
                                                {t("clear_filter", "Clear Filter")}
                                            </button>
                                            <div className="flex-1 relative">
                                                <button
                                                    onClick={() => setIsPrintDropdownOpen(!isPrintDropdownOpen)}
                                                    className="w-full flex items-center justify-center gap-2 px-3 h-10 sm:h-11 bg-blue-100 text-blue-600 font-bold text-xs sm:text-sm rounded-xl hover:bg-blue-200 transition-colors whitespace-nowrap print:hidden"
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
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsTableFilterOpen(!isTableFilterOpen)}
                                                    className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl border border-gray-200 transition-all shrink-0 ${isTableFilterOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                                >
                                                    {isTableFilterOpen ? <X size={18} /> : <MoreVertical size={18} />}
                                                </button>

                                                {isTableFilterOpen && (
                                                    <div className="absolute right-0 top-full mt-2 w-[260px] sm:w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-4 sm:p-5 z-[50]">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("columns", "Columns")}</label>
                                                                <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                                                    {Object.keys(visibleColumns).map((col) => (
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
                                    <div className='flex flex-col gap-2'>
                                        <div className="flex flex-col bg-white border border-[#4E60FF] rounded-xl transition-all duration-200 shadow-sm overflow-hidden">
                                            <div className="flex items-center px-3.5 py-2.5 sm:py-3 border-b border-gray-100">
                                                <Search className="text-gray-400 w-4 h-4 mr-2.5 shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder={tableSearchType === "NAME" ? t("search_by_name", "Search by name") : tableSearchType === "EMAIL" ? t("search_by_email", "Search by email") : t("search_by_phone", "Search by phone")}
                                                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-700 focus:outline-none placeholder:text-gray-300"
                                                    value={tableSearch}
                                                    onChange={(e) => setTableSearch(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleTableSearch()}
                                                />
                                            </div>
                                            <div className="flex items-center p-1.5 gap-1.5 bg-[#F8FAFF]">
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'PHONE') {
                                                            setTableSearchType('PHONE');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`flex-1 py-2 text-[10px] sm:text-[11px] font-[900] rounded-lg transition-all duration-200 ${tableSearchType === 'PHONE' ? 'bg-[#4E60FF] text-white shadow-sm' : 'bg-[#D6D9FF] text-white'}`}
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
                                                    className={`flex-1 py-2 text-[10px] sm:text-[11px] font-[900] rounded-lg transition-all duration-200 ${tableSearchType === 'NAME' ? 'bg-[#4E60FF] text-white shadow-sm' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    NAME
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (tableSearchType !== 'EMAIL') {
                                                            setTableSearchType('EMAIL');
                                                            setTableSearch('');
                                                        } else if (tableSearch.trim()) {
                                                            handleTableSearch();
                                                        }
                                                    }}
                                                    className={`flex-1 py-2 text-[10px] sm:text-[11px] font-[900] rounded-lg transition-all duration-200 ${tableSearchType === 'EMAIL' ? 'bg-[#4E60FF] text-white shadow-sm' : 'bg-[#D6D9FF] text-white'}`}
                                                >
                                                    EMAIL
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-24">
                                        <Loader className="w-10 h-10 text-[#3758EE] animate-spin" />
                                    </div>
                                ) : filteredModerators.length === 0 ? (
                                    <div className="flex items-center justify-center py-16">
                                        <span className="text-gray-400 text-sm">{t("no_moderators_found", "No moderators found")}</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Screen View (Paginated to 10 items per page) */}
                                        <div className="print:hidden">
                                            <div className="overflow-x-auto flex-1 custom-scrollbar-thin">
                                                <table className="w-full min-w-[650px] sm:min-w-[760px] xl:min-w-full border-separate border-spacing-y-1 sm:border-spacing-y-1.5 xl:border-spacing-y-2.5">
                                                    <thead>
                                                        <tr>
                                                            {visibleColumns.name && <th className="text-center font-bold text-xs sm:text-[13px] xl:text-[14px] text-gray-700 pb-1.5 sm:pb-2 px-2 sm:px-3">{t("name", "Name")}</th>}
                                                            {visibleColumns.contact && <th className="text-center font-bold text-xs sm:text-[13px] xl:text-[14px] text-gray-700 pb-1.5 sm:pb-2 px-2 sm:px-3">{t("email", "Email")}</th>}
                                                            {visibleColumns.phone && <th className="text-center font-bold text-xs sm:text-[13px] xl:text-[14px] text-gray-700 pb-1.5 sm:pb-2 px-2 sm:px-3">{t("phone", "Phone Number")}</th>}
                                                            {visibleColumns.manageBatches && <th className="text-center font-bold text-xs sm:text-[13px] xl:text-[14px] text-gray-700 pb-1.5 sm:pb-2 px-2 sm:px-3">{t("manage_batchs", "Manage Batch's")}</th>}
                                                            {visibleColumns.progress && <th className="text-center font-bold text-xs sm:text-[13px] xl:text-[14px] text-gray-700 pb-1.5 sm:pb-2 px-2 sm:px-3">{t("progress", "Progress")}</th>}
                                                            {visibleColumns.lastLogin && <th className="text-center font-bold text-xs sm:text-[13px] xl:text-[14px] text-gray-700 pb-1.5 sm:pb-2 px-2 sm:px-3">{t("last_login", "Last Login")}</th>}
                                                            {visibleColumns.status && <th className="text-center font-bold text-xs sm:text-[13px] xl:text-[14px] text-gray-700 pb-1.5 sm:pb-2 px-2 sm:px-3">{t("status", "Status")}</th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedModerators.map((moderator) => (
                                                            <tr key={moderator.id} className="bg-[#F8F9FA] transition-colors group">
                                                                {visibleColumns.name && (
                                                                    <td className="py-1.5 sm:py-2.5 xl:py-3.5 px-2 sm:px-3 text-center first:rounded-l-xl last:rounded-r-xl">
                                                                        <span className="text-xs sm:text-[13px] xl:text-[14px] font-medium text-gray-800 block max-w-[120px] sm:max-w-[140px] truncate mx-auto" title={moderator.name}>
                                                                            {t(moderator.name?.trim(), moderator.name)}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                {visibleColumns.contact && (
                                                                    <td className="py-1.5 sm:py-2.5 xl:py-3.5 px-2 sm:px-3 text-center first:rounded-l-xl last:rounded-r-xl">
                                                                        <span className="text-[11px] sm:text-xs xl:text-[13px] text-gray-800 leading-tight block max-w-[130px] sm:max-w-[160px] truncate mx-auto" title={moderator.email}>
                                                                            {moderator.email}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                {visibleColumns.phone && (
                                                                    <td className="py-1.5 sm:py-2.5 xl:py-3.5 px-2 sm:px-3 text-center first:rounded-l-xl last:rounded-r-xl">
                                                                        <span className="text-[11px] sm:text-xs xl:text-[13px] text-gray-800 block max-w-[110px] sm:max-w-[130px] truncate mx-auto" title={moderator.phone}>
                                                                            {moderator.phone}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                {visibleColumns.manageBatches && (
                                                                    <td className="py-1.5 sm:py-2.5 xl:py-3.5 px-2 sm:px-3 text-center first:rounded-l-xl last:rounded-r-xl">
                                                                        <div className="flex flex-col gap-0.5 sm:gap-1 items-center justify-center">
                                                                            {(moderator.batches || []).slice(0, 3).map((batch, idx) => (
                                                                                <span key={idx} className="text-[11px] sm:text-xs text-blue-500 underline cursor-pointer hover:text-blue-700 block max-w-[130px] sm:max-w-[150px] truncate mx-auto" title={batch}>
                                                                                    {t(batch?.trim(), batch)}
                                                                                </span>
                                                                            ))}
                                                                            {moderator.batches?.length > 3 && (
                                                                                <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium mt-0.5">
                                                                                    + {moderator.batches.length - 3} {t("more", "more")}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                )}
                                                                {visibleColumns.progress && (
                                                                    <td className="py-1.5 sm:py-2.5 xl:py-3.5 px-2 sm:px-3 text-center first:rounded-l-xl last:rounded-r-xl">
                                                                        <span className="text-xs sm:text-[13px] xl:text-[14px] font-medium text-gray-700 whitespace-nowrap">{moderator.progress || '0%'}</span>
                                                                    </td>
                                                                )}
                                                                {visibleColumns.lastLogin && (
                                                                    <td className="py-1.5 sm:py-2.5 xl:py-3.5 px-2 sm:px-3 text-center first:rounded-l-xl last:rounded-r-xl">
                                                                        <span className="text-xs sm:text-[13px] xl:text-[14px] font-medium text-gray-700 whitespace-nowrap">{formatDate(moderator.lastLogin)}</span>
                                                                    </td>
                                                                )}
                                                                {visibleColumns.status && (
                                                                    <td className="py-1.5 sm:py-2.5 xl:py-3.5 px-2 sm:px-3 text-center first:rounded-l-xl last:rounded-r-xl">
                                                                        <span className={`text-xs sm:text-[13px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${moderator.status === 'Active' ? 'text-[#00C896] bg-[#00C896]/10' : 'text-red-500 bg-red-500/10'}`}>
                                                                            {t(moderator.status?.trim().toLowerCase(), moderator.status)}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex justify-center sm:justify-end items-center mt-4 sm:mt-6 xl:mt-auto print:hidden">
                                                    <CustomPagination 
                                                        currentPage={currentPage} 
                                                        totalPages={totalPages} 
                                                        onPageChange={goToPage} 
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Print View (Shows all filtered moderators when printed) */}
                                        <div className="hidden print:block">
                                            <table className="w-full min-w-0 border-collapse border-spacing-0 border border-black text-[10px]">
                                                <thead>
                                                    <tr>
                                                        {visibleColumns.name && <th className="text-center font-bold text-[11px] text-gray-800 border border-black p-1">{t("name", "Name")}</th>}
                                                        {visibleColumns.contact && <th className="text-center font-bold text-[11px] text-gray-800 border border-black p-1">{t("email", "Email")}</th>}
                                                        {visibleColumns.phone && <th className="text-center font-bold text-[11px] text-gray-800 border border-black p-1">{t("phone", "Phone Number")}</th>}
                                                        {visibleColumns.manageBatches && <th className="text-center font-bold text-[11px] text-gray-800 border border-black p-1">{t("manage_batchs", "Manage Batch's")}</th>}
                                                        {visibleColumns.progress && <th className="text-center font-bold text-[11px] text-gray-800 border border-black p-1">{t("progress", "Progress")}</th>}
                                                        {visibleColumns.lastLogin && <th className="text-center font-bold text-[11px] text-gray-800 border border-black p-1">{t("last_login", "Last Login")}</th>}
                                                        {visibleColumns.status && <th className="text-center font-bold text-[11px] text-gray-800 border border-black p-1">{t("status", "Status")}</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredModerators.map((moderator) => (
                                                        <tr key={`print-${moderator.id}`}>
                                                            {visibleColumns.name && (
                                                                <td className="py-1 border border-black text-center text-[10px] text-gray-800">
                                                                    {t(moderator.name?.trim(), moderator.name)}
                                                                </td>
                                                            )}
                                                            {visibleColumns.contact && (
                                                                <td className="py-1 border border-black text-center text-[10px] text-gray-800 leading-tight">
                                                                    {moderator.email}
                                                                </td>
                                                            )}
                                                            {visibleColumns.phone && (
                                                                <td className="py-1 border border-black text-center text-[10px] text-gray-800">
                                                                    {moderator.phone}
                                                                </td>
                                                            )}
                                                            {visibleColumns.manageBatches && (
                                                                <td className="py-1 border border-black text-center text-[10px]">
                                                                    {(moderator.batches || []).join(', ') || '-'}
                                                                </td>
                                                            )}
                                                            {visibleColumns.progress && (
                                                                <td className="py-1 border border-black text-center text-[10px] text-gray-700">
                                                                    {moderator.progress || '0%'}
                                                                </td>
                                                            )}
                                                            {visibleColumns.lastLogin && (
                                                                <td className="py-1 border border-black text-center text-[10px] text-gray-700">
                                                                    {formatDate(moderator.lastLogin)}
                                                                </td>
                                                            )}
                                                            {visibleColumns.status && (
                                                                <td className="py-1 border border-black text-center text-[10px]">
                                                                    {t(moderator.status?.trim().toLowerCase(), moderator.status)}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
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
            </div >
        </div >
    );
};

export default ExportModeratorReportsPage;
