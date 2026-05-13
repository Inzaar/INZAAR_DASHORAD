import React from 'react';
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
                            <option value="student_table">Student Table</option>
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
                    <span className="text-gray-400 text-sm">No students found</span>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left font-bold text-[13px] text-gray-800 pb-4 pl-4 w-[15%]">Name</th>
                                    <th className="text-left font-bold text-[13px] text-gray-800 pb-4 w-[20%]">Contact</th>
                                    <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[20%]">Enrollments</th>
                                    <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[10%]">Progress</th>
                                    <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[12%]">Last Login</th>
                                    <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[10%]">Status</th>
                                    <th className="text-center font-bold text-[13px] text-gray-800 pb-4 w-[13%]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 pl-4">
                                            <span className="text-[14px] font-medium text-gray-700">{student.name}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] text-gray-600">{student.email}</span>
                                                <span className="text-[13px] text-gray-500">{student.phone}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                {(student.enrollments || []).length > 0 ? (
                                                    <>
                                                        {student.enrollments.slice(0, 3).map((course, idx) => (
                                                            <span key={idx} className="text-[12px] text-blue-500 underline cursor-pointer hover:text-blue-700">
                                                                {course}
                                                            </span>
                                                        ))}
                                                        {student.enrollments.length > 3 && (
                                                            <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                                                                + {student.enrollments.length - 3} more
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-[12px] text-gray-400">No enrollments</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="text-[14px] font-medium text-gray-700">{student.progress}</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="text-[14px] font-medium text-gray-700">{formatDate(student.lastLogin)}</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`text-[13px] px-2 py-1 rounded-full ${student.status === 'Active'
                                                ? 'text-[#00C896]'
                                                : 'text-red-500'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <GradiantButton
                                                className="text-[12px] px-4 py-2 rounded shadow-none font-medium bg-[#A892FF] hover:bg-[#6C5DDC]"
                                                onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                            >
                                                View Profile
                                            </GradiantButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex flex-wrap justify-between min-[600px]:justify-end items-center gap-2 mt-8">
                        <button
                            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40"
                            disabled={pagination.page <= 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((p, idx) => (
                                p === '...' ? (
                                    <span key={`dot-${idx}`} className="text-gray-400">...</span>
                                ) : p === pagination.page ? (
                                    <GradiantButton
                                        key={p}
                                        onClick={() => onPageChange(p)}
                                        className="w-8 h-8 !p-0 flex items-center justify-center text-sm font-bold rounded-lg shadow-sm"
                                    >
                                        {p}
                                    </GradiantButton>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => onPageChange(p)}
                                        className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
                                    >
                                        {p}
                                    </button>
                                )
                            ))}
                        </div>
                        <button
                            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => onPageChange(pagination.page + 1)}
                        >
                            Next
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
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
