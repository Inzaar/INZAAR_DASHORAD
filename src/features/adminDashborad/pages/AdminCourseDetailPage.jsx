import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, Calendar as CalendarIcon, ChevronRight, Trash2, ChevronDown } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { useParams, useNavigate } from 'react-router-dom';
import img from '@/assets/images/course.png';
import Analytics from '@/features/StudentDashboard/components/Analytics';
import { getAdminCourseById, deleteCourse, updateCourse } from '@/api/course';
import toast from 'react-hot-toast';
import DeleteCourseModal from '../components/DeleteCourseModal';
import { CustomPagination } from '@/components/ui/Pagination';

const AdminCourseDetailPage = () => {
    const { t } = useTranslation();

    const { id } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchType, setSearchType] = useState('NAME');
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const adminMenuRef = useRef(null);

    const [lecturesPage, setLecturesPage] = useState(1);
    const [studentsPage, setStudentsPage] = useState(1);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
                setIsAdminMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const res = await getAdminCourseById(id);
                setCourseData(res?.data?.data);
            } catch (err) {
                toast.error('Failed to fetch course details');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        try {
            await updateCourse(id, { status: newStatus });
            const displayStatus = newStatus === 'published' ? 'Active' : newStatus;
            toast.success(`Course status updated to ${displayStatus}`);
            setCourseData(prev => ({ ...prev, status: newStatus }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteCourse = async () => {
        try {
            setDeleting(true);
            await deleteCourse(id);
            toast.success(t('course_deleted_successfully', 'Course deleted successfully'));
            navigate('/admin-courses');
        } catch (error) {
            console.error("Error deleting course:", error);
            toast.error(error.response?.data?.message || t('failed_to_delete_course', 'Failed to delete course'));
        } finally {
            setDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // --- Mock Data ---

    // Total Enrollments Mini Bar Chart Data
    const miniBarData = [
        { name: '1', value: 10 },
        { name: '2', value: 30 },
        { name: '3', value: 20 },
        { name: '4', value: 40 },
        { name: '5', value: 30 },
    ];

    const lectures = courseData?.lectures || [];

    const students = courseData?.students || [];

    const lecturesPerPage = 8;
    const totalLecturesPages = Math.ceil(lectures.length / lecturesPerPage);
    const paginatedLectures = lectures.slice((lecturesPage - 1) * lecturesPerPage, lecturesPage * lecturesPerPage);

    const studentsPerPage = 5;
    const totalStudentsPages = Math.ceil(students.length / studentsPerPage);
    const paginatedStudents = students.slice((studentsPage - 1) * studentsPerPage, studentsPage * studentsPerPage);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center font-sans bg-[#F8F9FA]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-[#6366F1] rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium text-sm">Loading course details...</p>
                </div>
            </div>
        )
    }

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
                            <div className="grid grid-cols-[1fr_auto] items-center gap-4 mb-8 w-full">
                                <div className="min-w-0">
                                    <h2 className="text-[26px] md:text-[32px] font-extrabold text-gray-900 truncate leading-tight">{courseData?.title || 'Loading...'}</h2>
                                    <p className="text-gray-500 text-[12px] md:text-[14px] line-clamp-1">{courseData?.description || ''}</p>
                                </div>

                                {/* Desktop Buttons */}
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="relative group">
                                        <button className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-50 flex items-center gap-2 capitalize">
                                            Status: {courseData?.status === 'published' ? 'Active' : (courseData?.status || 'Draft')}
                                            <ChevronDown size={16} />
                                        </button>
                                        <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                            {['draft', 'published', 'inactive'].map((st) => (
                                                <button
                                                    key={st}
                                                    onClick={() => handleStatusChange(st)}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${courseData?.status === st ? 'text-[#8B5CF6] font-bold bg-blue-50' : 'text-gray-700'}`}
                                                >
                                                    {st === 'published' ? 'Active' : st}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <GradiantButton 
                                        onClick={() => toast.error('Certificate is not available yet')}
                                        className="bg-[#6366F1] px-6 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                                    >
                                        Download Certificate
                                    </GradiantButton>
                                    <GradiantButton
                                        onClick={() => navigate(`/admin-add-course?edit=true&id=${id}`)}
                                        className="bg-[#8B5CF6] px-8 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                                    >
                                        Edit
                                    </GradiantButton>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all whitespace-nowrap cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                        {t('delete', 'Delete')}
                                    </button>
                                </div>

                                {/* Mobile Three-Dots */}
                                <div className="md:hidden relative" ref={adminMenuRef}>
                                    <button
                                        onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                                        className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-600 active:scale-95"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                                    </button>

                                    {isAdminMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-[60] py-2 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-2 border-b border-gray-100 mb-2">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Change Status</p>
                                                <div className="flex flex-col gap-1">
                                                    {['draft', 'published', 'inactive'].map((st) => (
                                                        <button
                                                            key={st}
                                                            onClick={() => { handleStatusChange(st); setIsAdminMenuOpen(false); }}
                                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm capitalize ${courseData?.status === st ? 'bg-blue-50 text-[#8B5CF6] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            {st === 'published' ? 'Active' : st}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#3758EE] transition-colors"
                                                onClick={() => {
                                                    toast.error('Certificate is not available yet');
                                                    setIsAdminMenuOpen(false);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6366F1]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" y2="3" x2="12" /></svg>
                                                Download Certificate
                                            </button>
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#3758EE] transition-colors"
                                                onClick={() => {
                                                    navigate(`/admin-add-course?edit=true&id=${id}`);
                                                    setIsAdminMenuOpen(false);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B5CF6]"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                                Edit Course
                                            </button>
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                onClick={() => {
                                                    setIsAdminMenuOpen(false);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                                Delete Course
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <Analytics courseData={courseData} />

                            {/* Lectures Section */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">All Lectures</h3>
                                    <div className="relative">
                                        <select className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-blue-500">
                                            <option>All Lectures</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {paginatedLectures.map((lecture, index) => (
                                        <div key={lecture._id || index} className="border border-gray-200 rounded-[12px] p-2 bg-white flex flex-col hover:shadow-md transition-shadow">
                                            <div className="relative w-full h-[150px] rounded-[8px] overflow-hidden mb-3">
                                                <img src={lecture.thumbnail || img} alt={lecture.title} className="w-full h-full object-cover" />
                                                <div className="absolute top-2 left-2 text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded text-[10px]">
                                                    Lecture {String(lecture.lectureNo || index + 1).padStart(2, '0')}
                                                </div>
                                                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white p-0.5 shadow-sm">
                                                    <img src="https://via.placeholder.com/32x32" alt="Instructor" className="w-full h-full rounded-full object-cover" />
                                                </div>
                                                <div className="absolute bottom-2 left-2 text-white text-[10px] font-medium drop-shadow-md">
                                                    Date: {new Date(lecture.date || lecture.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-start mb-1 px-1">
                                                <h4 className="font-bold text-gray-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{lecture.title}</h4>
                                                <span className="text-[10px] text-gray-400 pl-2">{new Date(lecture.date || lecture.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            <p className="text-[10px] text-gray-500 px-1 mb-3">
                                                Type: {lecture.type || 'Video'}
                                            </p>


                                            <GradiantButton
                                                onClick={() => {
                                                    const returnPath = encodeURIComponent(`/admin-course-view/${id}`);
                                                    navigate(`/admin-course-play?id=${id}&lectureId=${lecture._id || lecture.id}&returnPath=${returnPath}`);
                                                }}
                                                className="w-full py-2 bg-[#6366F1] text-white text-xs rounded-[6px] font-medium mt-auto"
                                            >
                                                View Details
                                            </GradiantButton>
                                        </div>
                                    ))}
                                </div>

                                {totalLecturesPages > 1 && (
                                    <div className="flex justify-end items-center gap-2 mt-8">
                                        <CustomPagination 
                                            currentPage={lecturesPage}
                                            totalPages={totalLecturesPages}
                                            onPageChange={setLecturesPage}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Students List Table (Reused) */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">{t("student_table", "Student Table")}</h3>
                                    <div className="relative">
                                        <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded px-3 py-1.5 pr-7 focus:outline-none">
                                            <option>{t("student_table", "Student Table")}</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar-thin">
                                    <table className="w-full text-left border-collapse min-w-[900px]">
                                        <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                                            <tr className="text-[12px] font-bold text-gray-900 uppercase tracking-wider">
                                                <th className="px-6 py-4 w-[15%]">{t("name", "Name")}</th>
                                                <th className="px-6 py-4 w-[20%]">{t("contact", "Contact")}</th>
                                                <th className="px-6 py-4 text-center w-[20%]">{t("enrollments", "Enrollments")}</th>
                                                <th className="px-6 py-4 text-center w-[10%]">{t("progress", "Progress")}</th>
                                                <th className="px-6 py-4 text-center w-[15%]">{t("last_login", "Last Login")}</th>
                                                <th className="px-6 py-4 text-center w-[10%]">{t("status", "Status")}</th>
                                                <th className="px-6 py-4 text-center w-[10%]">{t("action", "Action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedStudents.map((student) => (
                                                <tr key={student.id} className="text-sm text-gray-600 hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-medium text-gray-900">{student.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-800 font-medium">{student.email}</span>
                                                            <span className="text-gray-500">{student.phone}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col gap-1 items-center">
                                                            {student.enrollments.slice(0, 3).map((course, idx) => (
                                                                <span key={idx} className="text-[11px] text-blue-500 underline cursor-pointer hover:text-blue-700">
                                                                    {course}
                                                                </span>
                                                            ))}
                                                            {student.enrollments.length > 3 && (
                                                                <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                                                                    + {student.enrollments.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[#3758EE] font-bold">{student.progress}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-gray-500">{student.lastLogin}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${student.status === 'Active'
                                                            ? 'text-emerald-500 bg-emerald-50'
                                                            : 'text-red-500 bg-red-50'
                                                            }`}>
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <GradiantButton 
                                                            onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                                            className="bg-[#3758EE] text-white text-[11px] font-bold px-4 py-1.5 rounded-[4px] hover:bg-blue-600 transition-colors mx-auto shadow-none"
                                                        >
                                                            View Profile
                                                        </GradiantButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalStudentsPages > 1 && (
                                    <div className="flex justify-end items-center gap-2 mt-6 p-4 border-t border-gray-100 w-full">
                                        <CustomPagination 
                                            currentPage={studentsPage}
                                            totalPages={totalStudentsPages}
                                            onPageChange={setStudentsPage}
                                        />
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

            <DeleteCourseModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCourse}
                courseId={id}
                courseTitle={courseData?.title || ""}
                loading={deleting}
            />
        </div>
    );
};

export default AdminCourseDetailPage;
