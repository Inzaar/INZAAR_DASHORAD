import React from 'react';
import Sidebar from '@/components/layouts/SideBar';
import { Calendar18 } from '@/components/shared/Calender';
import CourseCard from '@/components/shared/CourseCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import LectureCard from '@/components/shared/LectureCard';
import OverviewCard from '@/components/shared/OverviewCard';

const DashboardPage = () => {
    return (
        <div className="flex bg-[#F8F9FA] min-h-screen font-sans text-slate-800">
            <Sidebar />
            <main className="flex-1 p-8 ml-[260px] overflow-y-auto h-screen">
                {/* Top Header Section */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500">Tuesday, January 27 2025</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full bg-white border border-gray-200 text-gray-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full">
                            <span className="text-sm font-medium">🇬🇧 English</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-white shadow-sm">
                            <img src="https://i.pravatar.cc/150?u=zain" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Greeting Section */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">Aslam Alaikum Zain 👋</h2>
                        <p className="text-gray-500">Let's learn something new today!</p>
                    </div>
                    <button className="px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                        Enrolled New Course
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Main Column */}
                    <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                        {/* Overview Stats */}
                        <div className="w-full">
                            <OverviewCard className="w-full max-w-full shadow-sm" />
                        </div>

                        {/* Enrolled Courses */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Enrolled Courses</h3>
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                <CourseCard title="Quran Recitation (Tajweed)" completed={14} total={30} className="min-w-[300px] shadow-sm" />
                                <CourseCard title="Quran Recitation (Tajweed)" completed={8} total={30} className="min-w-[300px] shadow-sm" />
                                <CourseCard title="Quran Recitation (Tajweed)" completed={1} total={30} className="min-w-[300px] shadow-sm opacity-50" />
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <HoursSpentCard className="w-full shadow-sm" />
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900">Ongoing Lectures</h3>
                                    <button className="text-sm text-gray-400">Quran Recitation...</button>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    <LectureCard className="shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Column */}
                    <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
                        <PerformanceCard className="w-full shadow-sm" />
                        <Calendar18 />
                    </div>
                </div>

                {/* Current Status Table */}
                <div className="mt-8 bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Current status</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Courses</th>
                                    <th className="px-4 py-3 font-medium">Lecture</th>
                                    <th className="px-4 py-3 font-medium">Title</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Progress</th>
                                    <th className="px-4 py-3 font-medium">Next Lecture</th>
                                    <th className="px-4 py-3 font-medium">Comments</th>
                                    <th className="px-4 py-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-4 py-4 font-medium text-gray-900">Tafseer</td>
                                    <td className="px-4 py-4 text-gray-500">#01</td>
                                    <td className="px-4 py-4 text-gray-500">Introduction</td>
                                    <td className="px-4 py-4 text-gray-500">05-Feb-2025</td>
                                    <td className="px-4 py-4 text-gray-500">40%</td>
                                    <td className="px-4 py-4 text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Locked</td>
                                    <td className="px-4 py-4 text-gray-500">N/A</td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="px-4 py-1.5 bg-[#7F60EA] text-white text-xs rounded hover:bg-[#6c4cd8] transition">Watch Again</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-4 py-4 font-medium text-gray-900">Hadith</td>
                                    <td className="px-4 py-4 text-gray-500">#03</td>
                                    <td className="px-4 py-4 text-gray-500">Conclusion</td>
                                    <td className="px-4 py-4 text-gray-500">05-Feb-2025</td>
                                    <td className="px-4 py-4 text-gray-500">90%</td>
                                    <td className="px-4 py-4 text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Unlocked</td>
                                    <td className="px-4 py-4 text-gray-500 max-w-[150px] truncate">Something is important...</td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="px-4 py-1.5 bg-[#7F60EA] text-white text-xs rounded hover:bg-[#6c4cd8] transition">Watch Again</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-4 py-4 font-medium text-gray-900">Hadith</td>
                                    <td className="px-4 py-4 text-gray-500">#10</td>
                                    <td className="px-4 py-4 text-gray-500">Introduction</td>
                                    <td className="px-4 py-4 text-gray-500">05-Feb-2025</td>
                                    <td className="px-4 py-4 text-gray-500">40%</td>
                                    <td className="px-4 py-4 text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Locked</td>
                                    <td className="px-4 py-4 text-gray-500">N/A</td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="px-4 py-1.5 bg-[#7F60EA] text-white text-xs rounded hover:bg-[#6c4cd8] transition">Watch Again</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
