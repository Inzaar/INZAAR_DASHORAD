import GradiantButton from '@/components/ui/buttons/GradiantButton';
import Analytics from '@/features/StudentDashboard/components/Analytics';
import React, { useState, useRef, useEffect } from 'react';

const studentsData = [
    { id: 1, name: "Zain", email: "zain@gmail.com", phone: "0322 123456", progress: "40%", lastLogin: "05-Feb-2025", status: "In-active" },
    { id: 2, name: "Majid", email: "majid@gmail.com", phone: "0312 123488", progress: "80%", lastLogin: "14-Sep-2025", status: "Active" },
    { id: 3, name: "Usama", email: "usama@gmail.com", phone: "0300 123222", progress: "40%", lastLogin: "01-Sep-2025", status: "In-active" },
    { id: 4, name: "Noman", email: "noman@gmail.com", phone: "0323 123456", progress: "70%", lastLogin: "19-Sep-2025", status: "Active" }
];

export default function ModeratorRecordComponent() {
    const courses = ["Stress Management Course", "Imaniyaat Course", "Namaz Course"];
    const [selectedCourse, setSelectedCourse] = useState(courses[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full font-sans bg-white pb-8 mt-[20px] rounded-[10px] ">
            {/* Header section with course title and dropdown */}
            <div className="flex flex-row justify-between items-center w-full mb-6 gap-1 sm:gap-4 mt-[10px]">
                <h2 className="text-[12px] min-[480px]:text-[16px] sm:text-[20px] font-semibold text-gray-800 whitespace-nowrap flex-shrink-0">Stress Management Course</h2>

                <div className="flex items-center justify-end gap-1 min-[400px]:gap-2 min-w-0">
                    <div className="relative flex-shrink min-w-0" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="bg-[#8B5CF6] text-white px-2.5 py-1.5 min-[400px]:px-3 min-[400px]:py-2 sm:px-4 sm:py-2.5 rounded-[4px] sm:rounded-[6px] flex items-center justify-between gap-1 sm:gap-2 text-[10px] min-[400px]:text-[12px] sm:text-[14px] font-medium shadow-[0_2px_10px_rgba(139,92,246,0.2)] hover:bg-[#7c3aed] transition-colors max-w-full"
                        >
                            <span className="truncate block max-w-[90px] min-[400px]:max-w-[120px] sm:max-w-[150px] md:max-w-none text-left">{selectedCourse}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-2.5 h-2.5 min-[400px]:w-3 min-[400px]:h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-full min-w-[170px] bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                                {courses.map((course) => (
                                    <button
                                        key={course}
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2.5 text-[12px] sm:text-sm transition-colors ${selectedCourse === course ? 'text-[#8B5CF6] bg-purple-50 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {course}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Stats Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 w-full">

                {/* Left Side (Enrolled & Overview stacked) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Total Enrolled Students Card */}
                    {/* <div className="bg-white rounded-[12px] border border-gray-100 p-6 flex justify-between items-center shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-[14px] text-gray-500 font-medium mb-1">Total Enrolled Students</h3>
                            <div className="text-[36px] font-bold text-gray-900 leading-none">55</div>
                            <div className="flex items-center gap-1.5 mt-2 text-[12px]">
                                <span className="text-green-500 rounded-full border border-green-200 p-[2px] w-4 h-4 flex items-center justify-center">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                                </span>
                                <span className="text-green-500 font-medium">2.7%</span>
                                <span className="text-gray-400">Improvement From last Week</span>
                            </div>
                        </div>
                        <div className="flex items-end gap-[8px] h-[50px]">
                            <div className="w-[10px] bg-indigo-200 rounded-t-[3px] h-[45%]"></div>
                            <div className="w-[10px] bg-indigo-500 rounded-t-[3px] h-[90%]"></div>
                            <div className="w-[10px] bg-[#d8b4fe] rounded-t-[3px] h-[70%]"></div>
                        </div>
                    </div> */}
                    {/* <MetricCard /> */}

                    {/* Overview Card */}
                    {/* <div className="bg-white rounded-[12px] border border-gray-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full">
                        <h3 className="text-[14px] text-gray-500 font-medium mb-5">Overview</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="flex flex-col border-l-[3px] border-teal-500 pl-4 py-1">
                                <div className="text-[22px] font-bold text-gray-900 leading-none mb-1">8</div>
                                <div className="flex items-center gap-2 text-[13px] text-teal-500 font-medium">
                                    <div className="w-[6px] h-[6px] rounded-full bg-teal-500"></div>
                                    <span className="text-gray-500 font-normal">Active Students</span>
                                </div>
                            </div>
                            <div className="flex flex-col border-l-[3px] border-blue-600 pl-4 py-1">
                                <div className="text-[22px] font-bold text-gray-900 leading-none mb-1">2</div>
                                <div className="flex items-center gap-2 text-[13px] text-blue-600 font-medium">
                                    <div className="w-[6px] h-[6px] rounded-full bg-blue-600"></div>
                                    <span className="text-gray-500 font-normal">In Active Students</span>
                                </div>
                            </div>
                            <div className="flex flex-col border-l-[3px] border-purple-500 pl-4 py-1">
                                <div className="text-[22px] font-bold text-gray-900 leading-none mb-1">44%</div>
                                <div className="flex items-center gap-2 text-[13px] text-purple-500 font-medium">
                                    <div className="w-[6px] h-[6px] rounded-full bg-purple-500"></div>
                                    <span className="text-gray-500 font-normal">Average spend rate</span>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    {/* <OverviewCard /> */}
                </div>

                {/* Right Side (Course Completion Rate Card) */}
                {/* <div className="bg-white rounded-[12px] border border-gray-100 p-8 flex flex-col items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full lg:h-full">
                    <h3 className="text-[17px] font-bold text-gray-800 mb-6 w-full text-center">Course Completion Rate</h3>
                    <div className="relative w-[210px] h-[210px] flex items-center justify-center mb-6 mt-2">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 drop-shadow-sm">
                            <defs>
                                <linearGradient id="purpleRing" x1="0%" y1="100%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4F46E5" />
                                    <stop offset="100%" stopColor="#A855F7" />
                                </linearGradient>
                            </defs>
                            <path
                                className="text-gray-100"
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                strokeDasharray="100, 100"
                            />
                            <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="url(#purpleRing)"
                                strokeWidth="4.2"
                                strokeLinecap="round"
                                strokeDasharray="88, 100"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center mt-2">
                            <span className="text-[46px] font-extrabold text-gray-800 leading-none tracking-tight">88%</span>
                            <span className="text-[13px] text-gray-500 font-semibold mt-2">Performance</span>
                        </div>
                    </div>

                    
                    <div className="flex items-center gap-1.5 text-[14px] font-medium text-gray-800 mt-auto">
                        Trending up by <span className="text-[#8B5CF6] font-bold">2.7%</span> this Week
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 ml-0.5"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                </div> */}

            </div>

            <Analytics />

            {/* Student Table Section */}
            <div className="w-full">
                <h3 className="text-[17px] font-semibold text-gray-800 mb-4 px-2">Student Table</h3>

                <div className="bg-white rounded-[12px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[800px] text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr>
                                    <th className="pb-2 px-6 text-[13px] font-bold w-[15%]">Name</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold w-[25%]">Contact</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold text-center w-[15%]">Progress</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold w-[15%]">Last Login</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold w-[15%]">Status</th>
                                    <th className="pb-2 px-6 text-[13px] font-bold text-center w-[15%]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsData.map((student, idx) => (
                                    <tr key={student.id} className="bg-[#F8F9FA] hover:bg-gray-100 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                        <td className="py-4 px-6 text-[13px] font-medium text-gray-700 rounded-l-[8px]">{student.name}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-[2px]">
                                                <span className="text-[13px] font-medium text-gray-700">{student.email}</span>
                                                <span className="text-[12px] text-gray-500">{student.phone}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[13px] text-gray-700 text-center font-medium">{student.progress}</td>
                                        <td className="py-4 px-6 text-[13px] text-gray-600">{student.lastLogin}</td>
                                        <td className={`py-4 px-6 text-[13px] font-medium ${student.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                                            {student.status}
                                        </td>
                                        <td className="py-4 px-6 text-center rounded-r-[8px]">
                                            <GradiantButton className="bg-[#8B5CF6] text-white px-5 py-2 rounded-[6px] text-[12px] font-medium hover:bg-[#7c3aed] transition-colors shadow-sm w-[110px]">
                                                View Profile
                                            </GradiantButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-end items-center gap-2 mt-6 px-2">
                    <button className="flex items-center gap-1 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        Previous
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">1</button>
                    <button className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-white  bg-[#6366F1] rounded-lg shadow-sm">2</button>
                    <button className="w-8 h-8 flex items-center justify-center text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">3</button>
                    <span className="text-gray-400 px-1 text-[13px]">...</span>
                    <button className="flex items-center gap-1 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Next
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>

            </div>

        </div>
    );
}