import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, Calendar as CalendarIcon, MoreVertical, X, ChevronDown, Printer, Loader } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import SharedStudentTable from '@/components/shared/SharedStudentTable';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/context/AuthContext';

const ExportStudentReportsPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Server-side Paginated API Data State (10 users per page)
    const itemsPerPage = 10;
    const [students, setStudents] = useState([]);
    const [printStudents, setPrintStudents] = useState([]);
    const [pendingPrint, setPendingPrint] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const latestRequestRef = useRef(0);
    const skipNextSearchEffectRef = useRef(false);

    // Filter State
    const [filterStatus, setFilterStatus] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');

    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [moderators, setModerators] = useState([]);

    const [filterCourse, setFilterCourse] = useState('');
    const [filterBatch, setFilterBatch] = useState('');
    const [filterModerator, setFilterModerator] = useState('');

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
        gender: false,
        age: false,
        ageGroup: false,
        region: false,
        country: false,
        education: false,
        profession: false,
        loginFrequency: false,
        lastLearningActivity: false,
        courseCompletionRate: false,
        action: false
    });
    const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

    
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [cRes, bRes, mRes] = await Promise.all([
                    axiosInstance.get('/admin/courses'),
                    axiosInstance.get('/batches'),
                    axiosInstance.get('/admin/moderators')
                ]);
                const cData = cRes.data?.data;
                const bData = bRes.data?.data;
                const mData = mRes.data?.data;

                setCourses(Array.isArray(cData) ? cData : cData?.coursesList || cData?.courses || []);
                setBatches(Array.isArray(bData) ? bData : bData?.batches || []);
                setModerators(Array.isArray(mData) ? mData : mData?.moderatorsList || mData?.moderators || []);
            } catch (err) {
                console.error("Failed to fetch filter lists", err);
            }
        };
        fetchFilterData();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const buildReportParams = useCallback((page = 1, limit = itemsPerPage, customParams = {}) => {
        const currentStatus = customParams.status !== undefined ? customParams.status : filterStatus;
        const currentGender = customParams.gender !== undefined ? customParams.gender : filterGender;
        const currentCourse = customParams.courseId !== undefined ? customParams.courseId : filterCourse;
        const currentBatch = customParams.batchId !== undefined ? customParams.batchId : filterBatch;
        const currentModerator = customParams.moderatorId !== undefined ? customParams.moderatorId : filterModerator;
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
        } else if (currentGender) {
            params.append('gender', currentGender);
        }

        if (currentStatus) params.append('status', currentStatus);
        if (currentFrom) params.append('from', currentFrom);
        if (currentTo) params.append('to', currentTo);
        if (currentCourse) params.append('courseId', currentCourse);
        if (currentBatch) params.append('batchId', currentBatch);
        if (currentModerator) params.append('moderatorId', currentModerator);

        if (currentSearch && currentSearch.trim()) {
            params.append('search', currentSearch.trim());
            params.append('searchType', currentSearchType);
        }

        return params;
    }, [filterStatus, filterGender, filterCourse, filterBatch, filterModerator, filterFrom, filterTo, tableSearch, tableSearchType, user, itemsPerPage]);

    // Fetch paginated report data from API (10 users per page)
    const fetchReport = useCallback(async (page = 1, customParams = {}) => {
        const requestId = ++latestRequestRef.current;
        setPrintStudents([]);
        setLoading(true);
        try {
            const params = buildReportParams(page, itemsPerPage, customParams);
            const res = await axiosInstance.get(`/admin/reports/students?${params.toString()}`);
            if (requestId !== latestRequestRef.current) return;

            const data = res.data?.data || {};
            setStudents(data.studentsList || []);
            setPagination(data.pagination || { page, limit: itemsPerPage, total: 0, totalPages: 1 });
        } catch (err) {
            if (requestId === latestRequestRef.current) {
                console.error('Failed to fetch students report:', err);
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

    // Initial mount and debounce for tableSearch / tableSearchType
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
        const handleAfterPrint = () => setPrintStudents([]);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    const handleStatusChange = (val) => {
        setFilterStatus(val);
        fetchReport(1, { status: val });
    };

    const handleGenderChange = (val) => {
        setFilterGender(val);
        fetchReport(1, { gender: val });
    };

    const handleCourseChange = (val) => {
        setFilterCourse(val);
        fetchReport(1, { courseId: val });
    };

    const handleBatchChange = (val) => {
        setFilterBatch(val);
        fetchReport(1, { batchId: val });
    };

    const handleModeratorChange = (val) => {
        setFilterModerator(val);
        fetchReport(1, { moderatorId: val });
    };

    const handleFromChange = (val) => {
        setFilterFrom(val);
        fetchReport(1, { from: val });
    };

    const handleToChange = (val) => {
        setFilterTo(val);
        fetchReport(1, { to: val });
    };

    // Handle top search
    const handleTopSearch = () => {
        setIsFilterDropdownOpen(false);
        fetchReport(1, {
            status: filterStatus,
            gender: filterGender,
            courseId: filterCourse,
            batchId: filterBatch,
            moderatorId: filterModerator,
            from: filterFrom,
            to: filterTo,
            search: tableSearch,
            searchType: tableSearchType
        });
    };

    // Handle top clear filter
    const handleTopClear = () => {
        if (tableSearch !== '') {
            skipNextSearchEffectRef.current = true;
        }
        setFilterStatus('');
        setFilterGender('');
        setFilterCourse('');
        setFilterBatch('');
        setFilterModerator('');
        setFilterFrom('');
        setFilterTo('');
        setTableSearch('');
        setIsFilterDropdownOpen(false);
        fetchReport(1, {
            status: '',
            gender: '',
            courseId: '',
            batchId: '',
            moderatorId: '',
            from: '',
            to: '',
            search: ''
        });
    };

    // Handle table filter search
    const handleTableSearch = () => {
        fetchReport(1);
    };

    // Handle table clear filter
    const handleTableClear = () => {
        if (tableSearch !== '') {
            skipNextSearchEffectRef.current = true;
        }
        setTableSearch('');
        fetchReport(1, { search: '' });
    };

    // Server-side pagination handler
    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.totalPages && page !== pagination.page) {
            fetchReport(page);
        }
    };

    // Fetch all matching records on-demand only when exporting CSV or printing PDF
    const fetchAllForExport = async () => {
        if (pagination.total === 0 && students.length === 0) {
            return [];
        }
        if (pagination.total > 0 && pagination.total <= students.length && pagination.page === 1) {
            return students;
        }
        const exportLimit = Math.max(pagination.total || 0, 100000);
        const params = buildReportParams(1, exportLimit);
        const res = await axiosInstance.get(`/admin/reports/students?${params.toString()}`);
        return res.data?.data?.studentsList || [];
    };

    const handleExportCSV = async () => {
        setIsPrintDropdownOpen(false);
        setExporting(true);
        try {
            const exportRecords = await fetchAllForExport();

            // Build headers dynamically from visibleColumns, skipping 'action'
            const columnMap = {
                name: "Name",
                contact: "Email",
                email: "Email",
                phone: "Phone Number",
                enrollments: "Enrollments",
                progress: "Progress",
                lastLogin: "Last Login",
                status: "Status",
                gender: "Gender",
                age: "Age",
                ageGroup: "Age Group",
                region: "Region",
                country: "Country",
                education: "Education",
                profession: "Profession",
                loginFrequency: "Login Frequency",
                lastLearningActivity: "Last Learning Activity",
                courseCompletionRate: "Course Completion Rate"
            };
            
            const activeKeys = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'action');
            const headers = activeKeys.map(key => `"${columnMap[key] || key}"`);

            const csvRows = [];
            csvRows.push(headers.join(','));
            
            exportRecords.forEach(student => {
                const courses = Array.isArray(student.enrollments)
                    ? student.enrollments.filter(Boolean)
                    : (student.enrollments ? [student.enrollments] : []);

                const enrollmentEntries = courses.length > 0 ? courses : ["Not Enrolled"];
                const rowsToOutput = visibleColumns.enrollments ? enrollmentEntries : [null];

                rowsToOutput.forEach(courseName => {
                    const rowValues = [];
                    activeKeys.forEach(key => {
                        if (key === 'enrollments') {
                            rowValues.push(`"${(courseName || '').toString().replace(/"/g, '""')}"`);
                        } else if (key === 'phone') {
                            let p = String(student.phone || '').trim();
                            if (p && !p.startsWith('+') && p.startsWith('92')) {
                                p = '+' + p;
                            }
                            const cleanP = p.replace(/"/g, '').replace(/,/g, '').trim();
                            rowValues.push(cleanP ? `\u200C${cleanP}` : '""');
                        } else if (key === 'contact' || key === 'email') {
                            const email = student.email || student.contact?.email || student.contact || '';
                            rowValues.push(`"${(email || '').toString().replace(/"/g, '""')}"`);
                        } else if (key === 'progress') {
                            const prog = student.progress || '0%';
                            rowValues.push(`"${prog.toString().replace(/"/g, '""')}"`);
                        } else if (key === 'lastLogin') {
                            const login = formatDate(student.lastLogin) || '-';
                            rowValues.push(`"${login.toString().replace(/"/g, '""')}"`);
                        } else {
                            const val = student[key];
                            rowValues.push(`"${(val || '').toString().replace(/"/g, '""')}"`);
                        }
                    });
                    csvRows.push(rowValues.join(','));
                });
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `student_reports_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export students CSV:', err);
        } finally {
            setExporting(false);
        }
    };

    const handlePrintPDF = async () => {
        setIsPrintDropdownOpen(false);
        if (pagination.total <= students.length && pagination.page === 1) {
            setPrintStudents(students);
            setPendingPrint(true);
            return;
        }
        setExporting(true);
        try {
            const exportRecords = await fetchAllForExport();
            setPrintStudents(exportRecords);
            setPendingPrint(true);
        } catch (err) {
            console.error('Failed to prepare PDF print:', err);
        } finally {
            setExporting(false);
        }
    };

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
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
                                <h2 className="text-[24px] font-bold text-gray-900 mb-1">Inzaar Student Report</h2>
                                <p className="text-gray-500 text-[16px]">Date: {new Date().toLocaleDateString()}</p>
                            </div>

                            {/* Header */}
                            <div className="mb-4 sm:mb-6 print:hidden">
                                <h2 className="text-[18px] sm:text-[22px] md:text-[24px] font-bold text-gray-900 mb-0.5 sm:mb-1">{t("export_student_reports", "Export Student Reports")}</h2>
                                <p className="text-gray-400 sm:text-gray-500 text-xs sm:text-sm md:text-base">{t("manage_students_reports", "Export All Your Students Reports")}</p>
                            </div>

                            {/* Top Filters */}
                            <div className="flex flex-wrap items-center justify-between xl:justify-start gap-2 sm:gap-4 mb-4 sm:mb-6 relative w-full print:hidden">

                                {/* Desktop Inline Filters (Hidden on Mobile/Tablet) */}
                                <div className="hidden xl:flex flex-wrap gap-4 items-end flex-1 w-full">
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">{t("all_students_filter", "All Students")}</option>
                                            <option value="active">{t("active_students", "Active Students")}</option>
                                            <option value="inactive">{t("inactive_students", "Inactive Students")}</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">GENDER</span>
                                        <select
                                            value={filterGender}
                                            onChange={(e) => handleGenderChange(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">All Genders</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">COURSE</span>
                                        <select
                                            value={filterCourse}
                                            onChange={(e) => handleCourseChange(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">All Courses</option>
                                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">BATCH</span>
                                        <select
                                            value={filterBatch}
                                            onChange={(e) => handleBatchChange(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">All Batches</option>
                                            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">MODERATOR</span>
                                        <select
                                            value={filterModerator}
                                            onChange={(e) => handleModeratorChange(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">All Moderators</option>
                                            {moderators.map(m => <option key={m._id} value={m._id}>{m.firstname} {m.lastname}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                        <div className="relative w-full">
                                            <input
                                                type="date"
                                                value={filterFrom}
                                                onChange={(e) => handleFromChange(e.target.value)}
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
                                                onChange={(e) => handleToChange(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Shared Search & Clear Buttons */}
                                <div className="flex gap-2 items-center w-full justify-between xl:justify-start xl:w-auto">
                                    <div className="flex gap-2 flex-1 sm:flex-initial">
                                        <GradiantButton
                                            className="h-[38px] sm:h-[42px] px-3.5 sm:px-6 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center shrink-0 flex-1 sm:flex-initial"
                                            onClick={handleTopSearch}
                                        >
                                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" />
                                            <span>Search</span>
                                        </GradiantButton>
                                        <button
                                            className="h-[38px] sm:h-[42px] px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap shrink-0 flex-1 sm:flex-initial"
                                            onClick={handleTopClear}
                                        >
                                            <BiFilterAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                            <span>Clear Filter</span>
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                        className="xl:hidden h-[38px] w-[38px] sm:h-[42px] sm:w-[42px] flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors shrink-0"
                                    >
                                        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                    </button>
                                </div>

                                {/* Mobile Dropdown Popup */}
                                {isFilterDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsFilterDropdownOpen(false)}
                                        />
                                        <div className="xl:hidden absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-[280px] max-h-[80vh] overflow-y-auto p-3.5 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col gap-3 sm:gap-4">
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                                <select
                                                    value={filterStatus}
                                                    onChange={(e) => handleStatusChange(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">{t("all_students_filter", "All Students")}</option>
                                                    <option value="active">{t("active_students", "Active Students")}</option>
                                                    <option value="inactive">{t("inactive_students", "Inactive Students")}</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">GENDER</span>
                                                <select
                                                    value={filterGender}
                                                    onChange={(e) => handleGenderChange(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">All Genders</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">COURSE</span>
                                                <select
                                                    value={filterCourse}
                                                    onChange={(e) => handleCourseChange(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">All Courses</option>
                                                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">BATCH</span>
                                                <select
                                                    value={filterBatch}
                                                    onChange={(e) => handleBatchChange(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">All Batches</option>
                                                    {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">MODERATOR</span>
                                                <select
                                                    value={filterModerator}
                                                    onChange={(e) => handleModeratorChange(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">All Moderators</option>
                                                    {moderators.map(m => <option key={m._id} value={m._id}>{m.firstname} {m.lastname}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={filterFrom}
                                                        onChange={(e) => handleFromChange(e.target.value)}
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
                                                        onChange={(e) => handleToChange(e.target.value)}
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
                            <div className="bg-white rounded-xl sm:rounded-[24px] p-3 sm:p-5 xl:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-8 print:border-none print:shadow-none print:rounded-none print:p-0 print:m-0">
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{t("students_list", "Students List")}</h3>
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
                                                Clear Filter
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

                                {/* Screen View (Server-side paginated to 10 items per page) */}
                                <div className="print:hidden">
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
                                        hidePagination={false}
                                    />
                                </div>

                                {/* Print View (Shows all filtered students fetched on-demand when printed) */}
                                <div className="hidden print:block">
                                    <SharedStudentTable
                                        students={printStudents.length > 0 ? printStudents : students}
                                        loading={false}
                                        title={t("students_list", "Students List")}
                                        showDropdown={false}
                                        hasContainer={false}
                                        showTitle={false}
                                        visibleColumns={visibleColumns}
                                        hidePagination={true}
                                    />
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
            </div >
        </div >
    );
};

export default ExportStudentReportsPage;
