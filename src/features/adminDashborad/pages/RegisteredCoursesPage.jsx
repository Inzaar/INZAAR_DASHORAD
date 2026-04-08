import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import { cn } from '@/lib/utils';
import { getAllCourses } from '@/api/course';

const RegisteredCoursesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const courseType = queryParams.get('type') || 'all';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const titles = {
        all: { header: "Registered Courses", main: "Total Registered Courses", sub: "Manage All Your Available Courses" },
        active: { header: "Active Courses", main: "Active Courses", sub: "Manage Your Currently Active Courses" },
        inactive: { header: "Inactive Courses", main: "Inactive Courses", sub: "Manage Your Inactive Courses" },
        draft: { header: "Draft Courses", main: "Draft Courses", sub: "Manage Your Draft Course content" }
    };

    const currentTitles = titles[courseType] || titles.all;

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const res = await getAllCourses();
                if (res?.data?.data) {
                    let filtered = res.data.data;

                    if (courseType === 'active') filtered = filtered.filter(c => c.status === 'active' || c.status === 'Active');
                    if (courseType === 'inactive') filtered = filtered.filter(c => c.status === 'inactive' || c.status === 'Inactive');
                    if (courseType === 'draft') filtered = filtered.filter(c => c.status === 'draft' || c.status === 'Draft');

                    const formatted = filtered.map(c => ({
                        id: c._id,
                        title: c.title,
                        date: new Date(c.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
                        lectures: c.totalLectures || 0,
                        duration: c.duration || "N/A",
                        status: c.status === 'draft' ? 'Draft' : 'Active'
                    }));
                    setCourses(formatted);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [courseType]);

    return (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative'>
                    {isSidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
                    <Sidebar onClose={() => setIsSidebarOpen(false)} className={cn("transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 lg:static lg:block fixed left-0 top-0 h-full lg:max-h-[800px] shadow-2xl", isSidebarOpen ? "translate-x-0" : "-translate-x-full")} />

                    <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <div className="py-4 pr-2">
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <h1 className="text-[20px] min-[641px]:text-3xl font-bold text-gray-900">{currentTitles.main}</h1>
                                    <p className="text-gray-500 text-[14px] min-[641px]:text-[16px]">{currentTitles.sub}</p>
                                </div>
                                <button onClick={() => navigate(-1)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-[8px] text-sm font-medium">Back</button>
                            </div>

                            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100">
                                <div className="flex flex-col xl:flex-row items-end gap-6 mb-10">
                                    <div className="flex-1 w-full">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">SEARCH COURSES</p>
                                        <div className="relative flex items-center bg-white border border-gray-100 rounded-lg h-[46px]">
                                            <Search className="absolute left-4 text-gray-400" size={18} />
                                            <input type="text" placeholder="Search by course title" className="w-full pl-11 pr-4 py-2 bg-transparent text-sm focus:outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>
                                    <button className="h-[46px] px-6 flex items-center gap-2 bg-gray-100 text-gray-400 font-bold text-[13px] rounded-lg hover:bg-gray-200 transition-all" onClick={() => setSearchTerm('')}>
                                        <BiFilterAlt size={18} /> Clear Filter
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead>
                                            <tr className="border-b border-gray-50 uppercase text-[12px] font-bold text-gray-800">
                                                <th className="text-left pb-4 pl-4 font-bold">Course Title</th>
                                                <th className="text-left pb-4 font-bold">Created Date</th>
                                                <th className="text-center pb-4 font-bold">Lectures</th>
                                                <th className="text-center pb-4 font-bold">Duration</th>
                                                <th className="text-center pb-4 font-bold">Status</th>
                                                <th className="text-center pb-4 font-bold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50/50">
                                            {loading ? <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-medium">Loading courses...</td></tr> : courses.length === 0 ? <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-medium">No courses found.</td></tr> : courses.map((course) => (
                                                <tr key={course.id} className="hover:bg-gray-50/40 transition-colors">
                                                    <td className="py-6 pl-4 font-medium text-gray-800">{course.title}</td>
                                                    <td className="py-6 text-[13px] text-gray-500">{course.date}</td>
                                                    <td className="py-6 text-center text-gray-700 font-medium">{course.lectures}</td>
                                                    <td className="py-6 text-center text-gray-700 font-medium">{course.duration}</td>
                                                    <td className="py-6 text-center">
                                                        <span className={cn("text-[13px] font-medium", course.status === 'Active' ? "text-emerald-500" : "text-gray-400")}>{course.status}</span>
                                                    </td>
                                                    <td className="py-6 text-center">
                                                        <GradiantButton 
                                                            onClick={() => navigate(`/admin-course-view/${course.id}`)}
                                                            className="px-5 py-2 rounded-lg text-[12px] font-bold shadow-lg shadow-blue-200/50"
                                                        >
                                                            View Details
                                                        </GradiantButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end items-center gap-2 mt-12 pb-2">
                                    <button className="flex items-center gap-1 text-[13px] font-bold text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft size={16} /> Previous</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold text-gray-400 hover:bg-gray-100">1</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold bg-[#6366F1] text-white shadow-lg shadow-blue-500/30">2</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold text-gray-400 hover:bg-gray-100">3</button>
                                    <span className="text-gray-300 font-bold px-1">...</span>
                                    <button className="flex items-center gap-1 text-[13px] font-bold text-gray-800 hover:text-gray-900 transition-colors">Next <ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
            </div>
        </div>
    );
};

export default RegisteredCoursesPage;
