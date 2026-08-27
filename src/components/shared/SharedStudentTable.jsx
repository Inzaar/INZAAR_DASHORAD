import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Loader } from 'lucide-react';

const SharedStudentTable = ({
    students = [],
    loading = false,
    pagination = { page: 1, limit: 10, totalPages: 1 },
    onPageChange,
    title = "Students List",
    showDropdown = false,
    hasContainer = true,
    showTitle = true,
    visibleColumns = {
        name: true,
        contact: true,
        enrollments: true,
        progress: true,
        lastLogin: true,
        status: true,
        action: true
    },
    hidePagination = false
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

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

    const content = (
        <>
            {showTitle && (
                <div className="mb-6 flex justify-between items-center">
                    <h3 className="text-[20px] font-bold text-gray-900 mb-1">{title}</h3>
                    {showDropdown && (
                        <select className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none cursor-pointer">
                            <option value="student_table">{t("student_table", "Student Table")}</option>
                        </select>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader className="w-10 h-10 text-[#3758EE] animate-spin" />
                </div>
            ) : students.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <span className="text-gray-400 text-sm">{t("no_students_found", "No students found")}</span>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full min-w-[1000px] print:min-w-0 print:w-full border-separate border-spacing-y-[10px] print:border-collapse print:border-spacing-0 print:border print:border-black print:text-[10px]">
                            <thead>
                                <tr>
                                    {visibleColumns.name && <th className="text-center font-bold text-[16px] print:text-[11px] text-gray-800 pb-2 print:border print:border-black print:p-1">{t("name", "Name")}</th>}
                                    {visibleColumns.contact && <th className="text-center font-bold text-[16px] print:text-[11px] text-gray-800 pb-2 print:border print:border-black print:p-1">{t("email", "Email")}</th>}
                                    {visibleColumns.phone && <th className="text-center font-bold text-[16px] print:text-[11px] text-gray-800 pb-2 print:border print:border-black print:p-1">{t("phone", "Phone Number")}</th>}
                                    {visibleColumns.enrollments && <th className="text-center font-bold text-[16px] print:text-[11px] text-gray-800 pb-2 print:border print:border-black print:p-1">{t("enrollments", "Enrollments")}</th>}
                                    {visibleColumns.progress && <th className="text-center font-bold text-[16px] print:text-[11px] text-gray-800 pb-2 print:border print:border-black print:p-1">{t("progress_avg", "Progress")}</th>}
                                    {visibleColumns.lastLogin && <th className="text-center font-bold text-[16px] print:text-[11px] text-gray-800 pb-2 print:border print:border-black print:p-1">{t("last_login", "Last Login")}</th>}
                                    {visibleColumns.status && <th className="text-center font-bold text-[16px] print:text-[11px] text-gray-800 pb-2 print:border print:border-black print:p-1">{t("status", "Status")}</th>}
                                    {visibleColumns.action && <th className="text-center font-bold text-[16px] print:hidden text-gray-800 pb-2">{t("action", "Action")}</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id} className="bg-[#F8F9FA] transition-colors group">
                                        {visibleColumns.name && (
                                            <td className={`py-4 print:py-1 print:border print:border-black ${!visibleColumns.contact && !visibleColumns.enrollments ? 'rounded-l-xl print:rounded-none' : (Object.values(visibleColumns).every(v=>v) ? 'rounded-l-xl print:rounded-none' : '')} text-center`}>
                                                <span className="text-[16px] print:text-[10px] text-gray-800">{t(student.name?.trim().replace(/\s+/g, ' '), student.name)}</span>
                                            </td>
                                        )}
                                        {visibleColumns.contact && (
                                            <td className="py-4 print:py-1 print:border print:border-black text-center">
                                                <span className="text-[15px] print:text-[10px] text-gray-800 leading-tight">{student.email}</span>
                                            </td>
                                        )}
                                        {visibleColumns.phone && (
                                            <td className="py-4 print:py-1 print:border print:border-black text-center">
                                                <span className="text-[15px] print:text-[10px] text-gray-800">{student.phone}</span>
                                            </td>
                                        )}
                                        {visibleColumns.enrollments && (
                                            <td className="py-4 print:py-1 print:border print:border-black text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    {(student.enrollments || []).length > 0 ? (
                                                        <>
                                                            {student.enrollments.slice(0, 3).map((course, idx) => (
                                                                <span key={idx} className="text-[15px] print:text-[10px] text-[#6366F1] print:text-black underline cursor-pointer hover:text-blue-800 decoration-1 underline-offset-2">
                                                                    {(course.title || course.name || course) === "new" ? t("new_badge", "new") : t((course.title || course.name || course), (course.title || course.name || course))}
                                                                </span>
                                                            ))}
                                                            {student.enrollments.length > 3 && (
                                                                <span className="text-[13px] print:text-[9px] text-gray-400 print:text-gray-700 font-medium mt-0.5">
                                                                    {t('more_count', { count: student.enrollments.length - 3, defaultValue: '+ {{count}} more' })}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 print:text-gray-700 text-[15px] print:text-[10px]">{t("not_enrolled", "Not Enrolled")}</span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.progress && (
                                            <td className="py-4 print:py-1 print:border print:border-black text-center">
                                                <span className="text-[16px] print:text-[10px] text-gray-800">{student.progress || '0%'}</span>
                                            </td>
                                        )}
                                        {visibleColumns.lastLogin && (
                                            <td className="py-4 print:py-1 print:border print:border-black text-center">
                                                <span className="text-[16px] print:text-[10px] text-gray-800">{formatDate(student.lastLogin) || '-'}</span>
                                            </td>
                                        )}
                                        {visibleColumns.status && (
                                            <td className="py-4 print:py-1 print:border print:border-black text-center">
                                                <span className={`text-[16px] print:text-[10px] ${student.status === 'Active' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                                    {t(student.status.toLowerCase(), student.status)}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.action && (
                                            <td className={`py-4 print:hidden text-center ${Object.values(visibleColumns).every(v=>v) ? 'rounded-r-xl print:rounded-none' : ''}`}>
                                                <div className="flex justify-center items-center w-full">
                                                    <GradiantButton
                                                        className="text-[15px] print:text-[10px] px-4 py-2 print:p-1 font-medium rounded-md print:rounded-none hover:opacity-90 transition-all shadow-sm bg-gradient-to-r from-[#6366F1] to-[#A855F7] print:bg-none print:text-black print:border print:border-black"
                                                        onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                                    >
                                                        {t("view_profile", "View Profile")}
                                                    </GradiantButton>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {!hidePagination && pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-end items-center gap-2 mt-auto print:hidden">
                            <button
                            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#7C3AED] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            disabled={pagination.page <= 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            <span className="hidden sm:inline">{t("previous", "Previous")}</span>
                        </button>
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((p, idx) => (
                                p === '...' ? (
                                    <span key={`dot-${idx}`} className="text-gray-400">...</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => onPageChange(p)}
                                        className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-[8px] transition-all ${p === pagination.page
                                            ? 'bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-md'
                                            : 'text-gray-600 hover:text-[#6366F1] hover:bg-gray-100'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            ))}
                        </div>
                        <button
                            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#7C3AED] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => onPageChange(pagination.page + 1)}
                        >
                            <span className="hidden sm:inline">{t("next", "Next")}</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                    )}
                </>
            )}
        </>
    );

    if (!hasContainer) {
        return content;
    }

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8 mt-6 flex flex-col flex-1 min-h-[600px] print:rounded-none print:border-none print:shadow-none print:p-0 print:m-0">
            {content}
        </div>
    );
};

export default SharedStudentTable;
