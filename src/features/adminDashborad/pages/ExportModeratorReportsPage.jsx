import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Server-side Paginated API Data State (10 users per page)
    const itemsPerPage = 10;
    const [moderators, setModerators] = useState([]);
    const [printModerators, setPrintModerators] = useState([]);
    const [pendingPrint, setPendingPrint] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const latestRequestRef = useRef(0);
    const skipNextSearchEffectRef = useRef(false);

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

    const buildReportParams = useCallback((page = 1, limit = itemsPerPage, customParams = {}) => {
        const currentStatus = customParams.status !== undefined ? customParams.status : filterStatus;
        const currentFrom = customParams.from !== undefined ? customParams.from : filterFrom;
        const currentTo = customParams.to !== undefined ? customParams.to : filterTo;
        const currentSearch = customParams.search !== undefined ? customParams.search : tableSearch;
        const currentSearchType = customParams.searchType !== undefined ? customParams.searchType : tableSearchType;

        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        params.append('includeStats', 'false');

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

        return params;
    }, [filterStatus, filterFrom, filterTo, tableSearch, tableSearchType, user, itemsPerPage]);

    // Fetch paginated report data from API (10 moderators per page)
    const fetchReport = useCallback(async (page = 1, customParams = {}) => {
        const requestId = ++latestRequestRef.current;
        setPrintModerators([]);
        setLoading(true);
        try {
            const params = buildReportParams(page, itemsPerPage, customParams);
            const res = await axiosInstance.get(`/admin/reports/moderators?${params.toString()}`);
            if (requestId !== latestRequestRef.current) return;

            const data = res.data?.data || {};
            setModerators(data.moderatorsList || []);
            setPagination(data.pagination || { page, limit: itemsPerPage, total: 0, totalPages: 1 });
        } catch (err) {
            if (requestId === latestRequestRef.current) {
                console.error('Failed to fetch moderators report:', err);
            }
        } finally {
            if (requestId === latestRequestRef.current) {
                setLoading(false);
            }
        }
    }, [buildReportParams, itemsPerPage]);

    const fetchReportRef = useRef(fetchReport);
    useEffect(() => {
        fetchReportRef.current = fetchReport;
    }, [fetchReport]);

    // Initial mount and real-time search effect
    const isFirstMount = useRef(true);
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            fetchReportRef.current(1);
            return;
        }
        if (skipNextSearchEffectRef.current) {
            skipNextSearchEffectRef.current = false;
            return;
        }
        const timer = setTimeout(() => {
            fetchReportRef.current(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [tableSearch, tableSearchType]);

    // Trigger window.print() after full export records render in print container
    useEffect(() => {
        if (!pendingPrint) return;
        const frame = requestAnimationFrame(() => {
            setPendingPrint(false);
            window.print();
        });
        return () => cancelAnimationFrame(frame);
    }, [pendingPrint]);

    // Clean up temporary print payload after print dialog closes
    useEffect(() => {
        const handleAfterPrint = () => setPrintModerators([]);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

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
        if (tableSearch !== '') {
            skipNextSearchEffectRef.current = true;
        }
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

    // Server-side pagination
    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.totalPages && page !== pagination.page) {
            fetchReport(page);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    // Fetch all matching records on-demand only when exporting CSV or printing PDF
    const fetchAllForExport = async () => {
        if (pagination.total === 0 && moderators.length === 0) {
            return [];
        }
        if (pagination.total > 0 && pagination.total <= moderators.length && pagination.page === 1) {
            return moderators;
        }
        const exportLimit = Math.max(pagination.total || 0, 100000);
        const params = buildReportParams(1, exportLimit);
        const res = await axiosInstance.get(`/admin/reports/moderators?${params.toString()}`);
        return res.data?.data?.moderatorsList || [];
    };

    const handleExportCSV = async () => {
        setIsPrintDropdownOpen(false);
        setExporting(true);
        try {
            const exportRecords = await fetchAllForExport();

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

            exportRecords.forEach(mod => {
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
        } catch (err) {
            console.error('Failed to export moderators CSV:', err);
        } finally {
            setExporting(false);
        }
    };

    const handlePrintPDF = async () => {
        setIsPrintDropdownOpen(false);
        if (pagination.total <= moderators.length && pagination.page === 1) {
            setPrintModerators(moderators);
            setPendingPrint(true);
            return;
        }
        setExporting(true);
        try {
            const exportRecords = await fetchAllForExport();
            setPrintModerators(exportRecords);
            setPendingPrint(true);
        } catch (err) {
            console.error('Failed to prepare moderators PDF:', err);
        } finally {
            setExporting(false);
        }
    };

    const toggleColumn = (col) => {
        setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans print:block print:h-auto print:w-auto">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-2 sm:gap-4 print:h-auto print:max-h-none print:max-w-none print:overflow-visible print:bg-white print:gap-0 print:block">
                <div className="print:hidden">
                    <Navbar onMenuClick={toggleSidebar} />
                </div>

                <div className='flex flex-col lg:flex-row px-2 sm:px-4 gap-3 sm:gap-4 flex-1 overflow-hidden relative min-h-0 pb-2 sm:pb-4 print:block print:overflow-visible print:px-0 print:pb-0'>

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
                            <div className="flex flex-wrap items-end justify-between xl:justify-start gap-2.5 sm:gap-4 mb-4 sm:mb-6 relative w-full print:hidden">
                                <div className="hidden xl:flex flex-wrap gap-3 2xl:gap-4 items-end flex-1 w-full">
                                    <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                        <select value={filterStatus} onChange={(e) => handleStatusChange(e.target.value)} className="w-full h-[42px] pl-3.5 pr-8 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                                            <option value="">{t("all_moderators_filter", "All Moderators")}</option>
                                            <option value="active">{t("active_moderators", "Active Moderators")}</option>
                                            <option value="inactive">{t("inactive_moderators", "Inactive Moderators")}</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                        <div className="relative w-full">
                                            <input type="date" value={filterFrom} onChange={(e) => handleFromChange(e.target.value)} className="w-full h-[42px] pl-3.5 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                        <div className="relative w-full">
                                            <input type="date" value={filterTo} onChange={(e) => handleToChange(e.target.value)} className="w-full h-[42px] pl-3.5 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between xl:justify-start gap-2 w-full xl:w-auto">
                                    <div className="flex gap-2 flex-1 sm:flex-initial">
                                        <GradiantButton className="h-[38px] sm:h-[42px] px-3.5 sm:px-6 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center shrink-0 flex-1 sm:flex-initial" onClick={handleTopSearch}>
                                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" />
                                            <span>Search</span>
                                        </GradiantButton>
                                        <button className="h-[38px] sm:h-[42px] px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap shrink-0 flex-1 sm:flex-initial" onClick={handleTopClear}>
                                            <BiFilterAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                            <span>Clear Filter</span>
                                        </button>
                                    </div>
                                    <button type="button" onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="xl:hidden h-[38px] w-[38px] sm:h-[42px] sm:w-[42px] flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors shrink-0">
                                        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                    </button>
                                </div>

                                {isFilterDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsFilterDropdownOpen(false)} />
                                        <div className="xl:hidden absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-[280px] max-h-[80vh] overflow-y-auto p-3.5 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col gap-3 sm:gap-4">
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                                <select value={filterStatus} onChange={(e) => handleStatusChange(e.target.value)} className="w-full pl-3.5 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                                                    <option value="">{t("all_moderators_filter", "All Moderators")}</option>
                                                    <option value="active">{t("active_moderators", "Active Moderators")}</option>
                                                    <option value="inactive">{t("inactive_moderators", "Inactive Moderators")}</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                                <div className="relative">
                                                    <input type="date" value={filterFrom} onChange={(e) => handleFromChange(e.target.value)} className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                                <div className="relative">
                                                    <input type="date" value={filterTo} onChange={(e) => handleToChange(e.target.value)} className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
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
                                                disabled={exporting}
                                                onClick={() => setIsPrintDropdownOpen(!isPrintDropdownOpen)}
                                                className="flex items-center gap-2 px-4 h-[42px] bg-blue-100 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-200 transition-colors whitespace-nowrap print:hidden disabled:opacity-60"
                                            >
                                                {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                                                {exporting ? 'Exporting...' : 'Print'}
                                            </button>
                                            {isPrintDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsPrintDropdownOpen(false)} />
                                                    <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                                                        <button
                                                            onClick={handlePrintPDF}
                                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                                                        >
                                                            print as pdf
                                                        </button>
                                                        <button
                                                            onClick={handleExportCSV}
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
                                                    disabled={exporting}
                                                    onClick={() => setIsPrintDropdownOpen(!isPrintDropdownOpen)}
                                                    className="w-full flex items-center justify-center gap-2 px-3 h-10 sm:h-11 bg-blue-100 text-blue-600 font-bold text-xs sm:text-sm rounded-xl hover:bg-blue-200 transition-colors whitespace-nowrap print:hidden disabled:opacity-60"
                                                >
                                                    {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                                                    {exporting ? 'Exporting...' : 'Print'}
                                                </button>
                                                {isPrintDropdownOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setIsPrintDropdownOpen(false)} />
                                                        <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                                                            <button
                                                                onClick={handlePrintPDF}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                                                            >
                                                                print as pdf
                                                            </button>
                                                            <button
                                                                onClick={handleExportCSV}
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
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() => setIsTableFilterOpen(false)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-3rem)] max-w-[280px] max-h-[75vh] overflow-y-auto bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-4 sm:p-5 z-[50]">
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
                                                    </>
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
                                ) : moderators.length === 0 ? (
                                    <div className="flex items-center justify-center py-16">
                                        <span className="text-gray-400 text-sm">{t("no_moderators_found", "No moderators found")}</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Screen View (Server-side paginated to 10 items per page) */}
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
                                                        {moderators.map((moderator) => (
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
                                            {pagination.totalPages > 1 && (
                                                <div className="flex justify-center sm:justify-end items-center mt-4 sm:mt-6 xl:mt-auto print:hidden">
                                                    <CustomPagination 
                                                        currentPage={pagination.page} 
                                                        totalPages={pagination.totalPages} 
                                                        onPageChange={goToPage} 
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Print View (Shows all filtered moderators fetched on-demand when printed) */}
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
                                                    {(printModerators.length > 0 ? printModerators : moderators).map((moderator) => (
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
