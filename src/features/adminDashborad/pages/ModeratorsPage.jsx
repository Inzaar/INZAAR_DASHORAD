import React, { useState } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import StatsCard from '../components/StatsCard';
import UserCard from '../components/UserCard';
import { Search, Plus } from 'lucide-react';
import { BiFilterAlt } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';


const ModeratorsPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // const firstName = localStorage.getItem('firstName');
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('NAME'); // 'NAME' or 'PHONE'

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const stats = [
        { title: "Total Moderators", value: "150", trend: "2.4%", trendDirection: "up", trendText: "vs last month" },
        { title: "Active Moderators", value: "122", trend: "2.4%", trendDirection: "up", trendText: "vs last month" },
        { title: "Inactive Moderators", value: "28", trend: "2.4%", trendDirection: "down", trendText: "vs last month" },
        { title: "Moderators in Pool", value: "14", trend: "2.4%", trendDirection: "up", trendText: "vs last month" },
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
                                    <h2 className="text-[24px] font-bold text-gray-900 mb-1">Moderators</h2>
                                    <p className="text-gray-500 text-[16px]">Manage All Your Moderators</p>
                                </div>
                                <GradiantButton
                                    onClick={() => navigate('/admin-add-course')}
                                    className="px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex gap-2 items-center"
                                >
                                    <Plus size={18} className="bg-white text-[#3758EE] rounded-full p-0.5" />
                                    Add New Course
                                </GradiantButton>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Moderator List</h3>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-col xl:flex-row gap-4 mb-8 ">
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


                                    {/* <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                                        <button className="px-4 py-1.5 text-xs font-bold text-white bg-[#A78BFA] rounded shadow-sm">PHONE#</button>
                                        <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700">NAME</button>
                                    </div> */}

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">From</span>
                                        <div className="relative">
                                            <input type="date" className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none" defaultValue="2024-04-12" />
                                            {/* <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" /> */}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">To</span>
                                        <div className="relative">
                                            <input type="date" className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 focus:outline-none" defaultValue="2024-04-20" />
                                            {/* <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" /> */}
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

                                {/* Moderators Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, idx) => (
                                        <UserCard
                                            key={idx}
                                            name="Mudassar"
                                            id="635261"
                                            status="online"
                                        />
                                    ))}
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

export default ModeratorsPage;
