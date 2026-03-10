import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import deactivate from "@/assets/images/deactivate.png";
import { RiDeleteBin6Fill } from "react-icons/ri";
import ModeratorRoll from '../components/moderator/ModeratorRoll';
import SessionActivity from '@/components/shared/SessionActivity';
import AssignBatches from '../components/moderator/AssignBatches';
import course2 from '../../../assets/images/course2.png'

const ModeratorBatches = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const firstName = localStorage.getItem('firstName');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
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
                    <main
                        className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide"
                        style={{
                            msOverflowStyle: "none",
                            scrollbarWidth: "none",
                        }}
                    >
                        <div className="py-4 pr-2">
                            <div className="bg-white shadow rounded-lg p-4">
                                {/* Top Section */}
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-xl font-semibold text-gray-700">
                                        Profile
                                    </h1>
                                    <GradiantButton className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-[4px] text-sm transition">
                                        Back to list
                                    </GradiantButton>
                                </div>

                                {/* Bottom Section */}
                                <div className="flex justify-between items-center">
                                    {/* Tabs */}
                                    <div className="flex bg-gray-100 rounded-[4px] overflow-hidden">
                                        <button className="px-4 py-2 text-gray-700 text-sm font-medium border-r">
                                            Profile
                                        </button>

                                        <button className="px-4 py-2  bg-white text-gray-600 text-sm hover:bg-gray-200">
                                            Batches
                                        </button>

                                        <button className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-200">
                                            Records
                                        </button>
                                    </div>

                                    {/* Right Side */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">
                                            Joining: 10/04/2025
                                        </span>

                                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-[4px] text-sm transition">
                                            Edit
                                        </button>

                                        <button className="bg-[#B1B1B1] text-white px-4 py-2 rounded-[4px] text-sm cursor-not-allowed flex items-center gap-[4px]">
                                            <img src={deactivate}></img>
                                            Deactivate
                                        </button>

                                        <button className="bg-[#ED3A3A] text-white px-4 py-2 rounded-[4px] text-sm transition flex items-center justify-center gap-[4px]">
                                            <RiDeleteBin6Fill />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                {/* check */}
                                <div className="mt-[20px] w-full">
                                    <div className="flex w-[1120px] h-[301px] gap-[10px]">
                                        <ModeratorRoll />
                                        <SessionActivity />
                                    </div>
                                </div>
                                <div className="mt-[12px] w-full">
                                    <div className="w-[1120px] h-[488px] rounded-[10px] flex items-center justify-center">
                                        <div className="w-[1092px] h-[440px] gap-[20px] ">
                                            <div className="w-[1092px] h-[40px] flex justify-between  items-center mt-[10px]">
                                                <h3 className="">Assigned Batches</h3>
                                                <GradiantButton className="w-[159px] h-[40px] font-bold text-[14px] rounded-[4px]">Assign new batch</GradiantButton>

                                            </div>
                                            {/* card */}
                                            <div className='w-[1092px] h-[320px] flex gap-[24px] '>
                                                <div className="flex gap-5 flex-wrap">

                                                    <AssignBatches
                                                        image={course2}
                                                        title="Stress Management Course"
                                                        students="55"
                                                        moderators="02"
                                                        performance="88%"
                                                        batch="S-25-01"
                                                        startDate="01/01/2025"
                                                        endDate="01/03/2025"
                                                    />

                                                    <AssignBatches
                                                        image={course2}
                                                        title="Stress Management Course"
                                                        students="40"
                                                        moderators="05"
                                                        performance="92%"
                                                        batch="S-25-02"
                                                        startDate="02/01/2025"
                                                        endDate="02/03/2025"
                                                    />

                                                    <AssignBatches
                                                        image={course2}
                                                        title="Stress Management Course"
                                                        students="70"
                                                        moderators="03"
                                                        performance="80%"
                                                        batch="S-25-03"
                                                        startDate="03/01/2025"
                                                        endDate="03/03/2025"
                                                    />

                                                </div>

                                            </div>
                                        </div>
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
                                        Next
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                    </button>
                                </div>
                            </div>
                            </div>
                            
                        </div>
                    </main>
                </div>

                            
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `,
                    }}
                />
            </div>
        </div>



    )
}

export default ModeratorBatches;