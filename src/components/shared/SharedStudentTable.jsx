import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Loader } from 'lucide-react';

const SharedStudentTable = ({
    students = [],
    loading = false,
    pagination = { page: 1, limit: 5, totalPages: 1 },
    onPageChange,
    title = "Students List",
    showDropdown = false,
    hasContainer = true,
    showTitle = true
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
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
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
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]" style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                            <thead>
                                <tr>
                                    <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("name", "Name")}</th>
                                    <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("contact", "Contact")}</th>
                                    <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("enrollments", "Enrollments")}</th>
                                    <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("progress_avg", "Progress")}</th>
                                    <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("last_login", "Last Login")}</th>
                                    <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("status", "Status")}</th>
                                    <th className="text-center font-bold text-[14px] text-gray-800 pb-2">{t("action", "Action")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
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
                                                {(student.enrollments || []).length > 0 ? (
                                                    <>
                                                        {student.enrollments.slice(0, 3).map((course, idx) => (
                                                            <span key={idx} className="text-[13px] text-[#6366F1] underline cursor-pointer hover:text-blue-800 decoration-1 underline-offset-2">
                                                                {(course.title || course.name || course) === "new" ? t("new_badge", "new") : t((course.title || course.name || course), (course.title || course.name || course))}
                                                            </span>
                                                        ))}
                                                        {student.enrollments.length > 3 && (
                                                            <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                                                                {t('more_count', { count: student.enrollments.length - 3, defaultValue: '+ {{count}} more' })}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-[13px]">{t("not_enrolled", "Not Enrolled")}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="text-[14px] text-gray-800">{student.progress || '0%'}</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="text-[14px] text-gray-800">{formatDate(student.lastLogin) || '-'}</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`text-[14px] ${student.status === 'Active' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                                {t(student.status.toLowerCase(), student.status)}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center rounded-r-xl">
                                            <div className="flex justify-center items-center">
                                                <GradiantButton
                                                    className="text-[13px] px-4 py-2 font-medium rounded-md hover:opacity-90 transition-all shadow-sm bg-gradient-to-r from-[#6366F1] to-[#A855F7]"
                                                    onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                                >
                                                    {t("view_profile", "View Profile")}
                                                </GradiantButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex flex-wrap justify-between min-[600px]:justify-end items-center gap-2 mt-8">
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
                </>
            )}
        </>
    );

    if (!hasContainer) {
        return content;
    }

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8 mt-6">
            {content}
        </div>
    );
};

export default SharedStudentTable;
