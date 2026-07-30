import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, Calendar as CalendarIcon, ChevronRight, Trash2 } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { useParams, useNavigate } from 'react-router-dom';
import img from '@/assets/images/course.png';
import Analytics from '@/features/StudentDashboard/components/Analytics';
import { getAdminCourseById, deleteCourse } from '@/api/course';
import toast from 'react-hot-toast';
import DeleteCourseModal from '../components/DeleteCourseModal';

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
        const fetchCourse = async () => {
            try {
                const res = await getAdminCourseById(id);
                setCourseData(res.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching course details:", error);
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

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
                                    {lectures.map((lecture, index) => (
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
                                                    // ✅ Redirect both Quiz and Video lectures to the play page
                                                    // The play page (CourseView) will handle rendering the "Start Quiz" UI for quizzes
                                                    const returnPath = encodeURIComponent(`/admin-course-view/${id}`);
                                                    navigate(`/admin-course-play?id=${id}&lectureId=${lecture._id || lecture.id}&returnPath=${returnPath}`);
                                                }}
                                                className="w-full py-2 bg-[#6366F1] text-white text-xs rounded-[6px] font-medium mt-auto"
                                            >
                                                View Details
                                            </GradiantButton>

                                            {/* <GradiantButton
                                                onClick={() => {
                                                    const returnPath = encodeURIComponent(`/admin-course-view/${id}`);
                                                    navigate(`/admin-course-play?id=${id}&lectureId=${lecture._id || lecture.id}&returnPath=${returnPath}`);
                                                }}
                                                className="w-full py-2 bg-[#6366F1] text-white text-xs rounded-[6px] font-medium mt-auto"
                                            >
                                                View Details
                                            </GradiantButton> */}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end items-center gap-2 mt-8">
                                    <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                                        Previous
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">1</button>
                                    <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#6366F1] rounded-lg shadow-sm">2</button>
                                    <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">3</button>
                                    <span className="text-gray-400">...</span>
                                    <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                                        {t("next", "Next")}
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                    </button>
                                </div>
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

                                {/* Simplified Table (No Filters as per image/requirement, or keep them?) 
                                    Image shows "Student Table" title and dropdown, and then the table headers directly.
                                    So I will omit the filter bar here to match the specific design image provided for this page.
                                */}

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left font-bold text-[12px] text-gray-800 pb-4 pl-4 w-[15%]">{t("name", "Name")}</th>
                                                <th className="text-left font-bold text-[12px] text-gray-800 pb-4 w-[20%]">{t("contact", "Contact")}</th>
                                                <th className="text-center font-bold text-[12px] text-gray-800 pb-4 w-[20%]">{t("enrollments", "Enrollments")}</th>
                                                <th className="text-center font-bold text-[12px] text-gray-800 pb-4 w-[10%]">{t("progress", "Progress")}</th>
                                                <th className="text-center font-bold text-[12px] text-gray-800 pb-4 w-[15%]">{t("last_login", "Last Login")}</th>
                                                <th className="text-center font-bold text-[12px] text-gray-800 pb-4 w-[10%]">{t("status", "Status")}</th>
                                                <th className="text-center font-bold text-[12px] text-gray-800 pb-4 w-[10%]">{t("action", "Action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {students.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 pl-4">
                                                        <span className="text-[13px] font-medium text-gray-700">{student.name}</span>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] text-gray-600">{student.email}</span>
                                                            <span className="text-[12px] text-gray-500">{student.phone}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <div className="flex flex-col gap-1 items-center">
                                                            {student.enrollments.map((course, idx) => (
                                                                <span key={idx} className="text-[11px] text-blue-500 underline cursor-pointer hover:text-blue-700">
                                                                    {course}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="text-[13px] font-medium text-gray-700">{student.progress}</span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="text-[13px] font-medium text-gray-700">{student.lastLogin}</span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className={`text-[12px] px-2 py-1 rounded-full ${student.status === 'Active'
                                                            ? 'text-[#00C896]'
                                                            : 'text-red-500'
                                                            }`}>
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <GradiantButton 
                                                            onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                                            className="text-[10px] px-3 py-1.5 rounded shadow-none font-medium bg-[#6366F1]"
                                                        >
                                                            View Profile
                                                        </GradiantButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-end items-center gap-2 mt-6">
                                    <button className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                                        Previous
                                    </button>
                                    <button className="w-7 h-7 flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">1</button>
                                    <button className="w-7 h-7 flex items-center justify-center text-xs font-bold text-white bg-[#6366F1] rounded-lg shadow-sm">2</button>
                                    <button className="w-7 h-7 flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">3</button>
                                    <span className="text-gray-400 text-xs">...</span>
                                    <button className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900">
                                        {t("next", "Next")}
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                    </button>
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
