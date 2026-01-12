import React from 'react';
import Sidebar from '@/components/layouts/SideBar';
import { Calendar18 } from '@/components/shared/Calender';
import CourseCard from '@/components/shared/CourseCard';
import PerformanceCard from '@/components/shared/PerformanceCard';
import HoursSpentCard from '@/components/shared/HoursSpentCard';
import LectureCard from '@/components/shared/LectureCard';
import OverviewCard from '@/components/shared/OverviewCard';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import MetricCard from '@/components/shared/MetricCard';
import Navbar from '@/components/layouts/Navbar';
import StatusTable from '@/components/ui/statusTable/StatusTable';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const DashboardPage = () => {
    const progressPercentage = 40;
    return (
        /* 1. Added 'h-screen' and 'overflow-hidden' to the wrapper to prevent double scrollbars */
        <div className="flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
            <Navbar />
            <div className='flex px-4 gap-4 flex-1 overflow-hidden'>
                <Sidebar />

                {/* 2. Used 'scrollbar-hide' and custom inline styles to ensure it's gone in all browsers */}
                <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                    msOverflowStyle: 'none',  /* IE and Edge */
                    scrollbarWidth: 'none'    /* Firefox */
                }}>
                    {/* Inner content wrapper */}
                    <div className="py-4 pr-2">
                        {/* Greeting Section */}
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-1">Aslam Alaikum Zain 👋</h2>
                                <p className="text-gray-500">Let's learn something new today!</p>
                            </div>
                            <GradiantButton className="px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                Enrolled New Course
                            </GradiantButton>
                        </div>

                        <div className="gap-6">
                            <div className=" flex flex-col gap-6">
                                <div className="flex gap-6">
                                    <div className='w-[65%] flex flex-col justify-between'>
                                        <div className='w-full'>
                                            <MetricCard className="w-full" />
                                        </div>
                                        <div className="w-full">
                                            <OverviewCard className="w-full max-w-full shadow-sm" />
                                        </div>
                                    </div>
                                    <PerformanceCard className="shadow-sm w-[35%]" />
                                </div>

                                <div className='flex w-full gap-6'>
                                    <div className="w-[76%] bg-white rounded-lg flex flex-col pt-2 px-2 shadow-sm no-scrollbar">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Enrolled Courses</h3>
                                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                                            <CourseCard title="Quran Recitation (Tajweed)" completed={14} total={30} className="min-w-[300px] shadow-sm" />
                                            <CourseCard title="Quran Recitation (Tajweed)" completed={8} total={30} className="min-w-[300px] shadow-sm" />
                                            <CourseCard title="Quran Recitation (Tajweed)" completed={1} total={30} className="min-w-[300px] shadow-sm" />
                                            <CourseCard title="Quran Recitation (Tajweed)" completed={8} total={30} className="min-w-[300px] shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="w-[25%]">
                                        <Calendar18 className="w-[200px] h-[200px]" />
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <HoursSpentCard className="w-full shadow-sm" />
                                    <div className="w-[60%] flex flex-col gap-6 bg-white rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-bold text-gray-900">Ongoing Lectures</h3>
                                            {/* <button className="text-sm text-gray-400">Quran Recitation...</button> */}
                                            <select className="outline-none bg-gray-100/60 rounded-lg px-6 py-2 shadow-sm">
                                                <option value="english">Quran Recitation...</option>
                                                <option value="urdu">Urdu</option>
                                                <option value="arabic">Arabic</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                                            <LectureCard className="shadow-sm" />
                                            <LectureCard className="shadow-sm" />
                                            <LectureCard className="shadow-sm" />
                                            <LectureCard className="shadow-sm" />
                                            <LectureCard className="shadow-sm" />
                                            <LectureCard className="shadow-sm" />
                                            <LectureCard className="shadow-sm" />
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#A892FF] rounded-full transition-all duration-300 ease-in-out"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Status Table */}
                        {/* <div className="mt-8 bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm mb-10">
                            <h3 className="font-bold text-gray-900 mb-6">Current status</h3> */}
                        {/* <table className="w-full text-sm text-left">
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
                                                <GradiantButton className="py-1.5 w-[100px] rounded">Watch Again</GradiantButton>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table> */}
                        <StatusTable />
                        {/* </div> */}
                        <PaginationContent className="w-full h-10 flex items-center justify-end">
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive className="bg-gradient-to-r from-[#A892FF] to-[#6C5DDC] text-white">
                                    2
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            {/* <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem> */}
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </div>

                </main>
            </div>

            {/* 3. Global CSS to hide scrollbars for Chrome/Safari */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default DashboardPage;