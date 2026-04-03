import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import StatsCard from '../components/StatsCard';
import { Search, Plus } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '@/api/user';
import { getAllEnrollments } from '@/api/enrollment';

const StudentProfilesPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('NAME'); // 'NAME' or 'PHONE'
    const [students, setStudents] = useState([]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const fetchStudentsData = async () => {
            try {
                const [usersRes, enrollmentsRes] = await Promise.all([
                    getAllUsers(),
                    getAllEnrollments()
                ]);

                if (usersRes?.data && enrollmentsRes?.data) {
                    const studentUsers = usersRes.data.filter(u => u.role === 'user');
                    const allEnrollments = enrollmentsRes.data;

                    const formattedStudents = studentUsers.map(user => {
                        const userEnrollments = allEnrollments.filter(e => e.userId && e.userId._id === user._id);

                        const enrolledCourseNames = userEnrollments.map(e => e.courseId?.title || "Unknown Course");

                        let totalProgress = 0;
                        if (userEnrollments.length > 0) {
                            const completedCount = userEnrollments.filter(e => e.isCompleted).length;
                            totalProgress = Math.round((completedCount / userEnrollments.length) * 100);
                        }

                        return {
                            id: user._id,
                            name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username,
                            email: user.email,
                            phone: user.phone || "N/A",
                            enrollments: enrolledCourseNames,
                            progress: `${totalProgress}%`,
                            lastLogin: new Date(user.updatedAt || user.createdAt).toLocaleDateString(),
                            status: "Active"
                        };
                    });

                    setStudents(formattedStudents);
                }
            } catch (error) {
                console.error("Failed to fetch students data:", error);
            }
        };

        fetchStudentsData();
    }, []);

    const stats = [
        { title: "Total Registered Students", value: students.length.toString(), trend: "2.4%", trendDirection: "up", trendText: "vs last month" },
        { title: "Active Students", value: students.length.toString(), trend: "2.4%", trendDirection: "up", trendText: "vs last month" },
        { title: "Inactive Students", value: "0", trend: "2.4%", trendDirection: "down", trendText: "vs last month" },
        { title: "Pending Students", value: "0", trend: "2.4%", trendDirection: "up", trendText: "vs last month" },
    ];

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />

                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative'>

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
                        fixed left-0 top-0 h-full lg:max-h-[800px] shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-4 pr-2">
                            {/* Header */}
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-[24px] font-bold text-gray-900 mb-1">Students</h2>
                                    <p className="text-gray-500 text-[16px]">Manage All Your Students</p>
                                </div>
                                <GradiantButton
                                    onClick={() => navigate('/admin-add-course')}
                                    className="px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex gap-2 items-center"
                                >
                                    <Plus size={18} className="bg-white text-[#3758EE] rounded-full p-0.5" />
                                    Add New Student
                                </GradiantButton>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat, index) => (
                                    <StatsCard
                                        key={index}
                                        {...stat}
                                        trendColor={stat.trendDirection === 'down' ? 'text-red-500' : 'text-green-500'}
                                        iconColor={stat.trendDirection === 'down' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
                                    />
                                ))}
                            </div>

                            {/* Main Content Card */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Students List</h3>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-col xl:flex-row gap-4 mb-8">
                                    <div className='flex-1 flex gap-2 flex-col'>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">ADVANCED SEARCH</p>
                                        <div className={`flex relative bg-gray-50 border rounded transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 ${searchType === 'PHONE' ? 'border-gray-200' : 'border-gray-200'}`}>
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder={`Search by ${searchType.toLowerCase()}`}
                                                className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm focus:outline-none"
                                            />
                                            <div className="flex items-center p-1 gap-2">
                                                <button
                                                    onClick={() => setSearchType('PHONE')}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-all duration-200 ${searchType === 'PHONE' ? 'bg-[#A78BFA] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    PHONE#
                                                </button>
                                                <button
                                                    onClick={() => setSearchType('NAME')}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-all duration-200 ${searchType === 'NAME' ? 'bg-[#A78BFA] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    NAME
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">From</span>
                                        <div className="relative">
                                            <input type="date" className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none" defaultValue="2024-04-12" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">To</span>
                                        <div className="relative">
                                            <input type="date" className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none" defaultValue="2024-04-20" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                                        <select className="pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none appearance-none cursor-pointer">
                                            <option>Select</option>
                                            <option>Active</option>
                                            <option>Inactive</option>
                                        </select>
                                    </div>

                                    <button className="flex items-center gap-2 px-4 h-10 self-end bg-gray-200 text-gray-500 font-bold text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap">
                                        <BiFilterAlt className="w-4 h-4" />
                                        Clear Filter
                                    </button>
                                </div>

                                {/* Students Table */}
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
                                            {students.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="py-8 text-center text-gray-500">
                                                        No students found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                students.map((student) => (
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
                                                                {student.enrollments.length === 0 ? (
                                                                    <span className="text-[12px] text-gray-400 italic">No Enrollments</span>
                                                                ) : (
                                                                    student.enrollments.map((course, idx) => (
                                                                        <span key={idx} className="text-[12px] text-blue-500 underline cursor-pointer hover:text-blue-700">
                                                                            {course}
                                                                        </span>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            <span className="text-[14px] font-medium text-gray-700">{student.progress}</span>
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            <span className="text-[14px] font-medium text-gray-700">{student.lastLogin}</span>
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
                                                                onClick={() => navigate(`/admin/student-details/${student.id}`)}
                                                                className="text-[12px] px-4 py-2 rounded shadow-none font-medium text-white"
                                                            >
                                                                View Profile
                                                            </GradiantButton>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
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
                                        Next
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
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
        </div>
    );
};

export default StudentProfilesPage;
