import Navbar from '@/components/layouts/NavBar';
import Sidebar from '@/components/layouts/SideBar';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '@/components/shared/notification/Notification';

const NotificationPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const progressPercentage = 40;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const navigate = useNavigate();

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
                        fixed left-0 top-0 h-full lg:max-h-[700px] shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 no-scrollbar scrollbar-hide overflow-y-auto bg-white rounded-xl border border-gray-100 p-4 shadow-lg shadow-[#F8F9FA] mb-2">
                        <div className="py-4 pr-2">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-[20px] min-[430px]:text-[24px] min-[641px]:text-3xl font-bold text-gray-900 mb-1">Notifications</h2>
                                    <p className="text-gray-500 text-[11px] min-[641px]:text-[16px]">Notifications List </p>
                                </div>
                                {/* <GradiantButton onClick={() => navigate('/courses')} className="max-[600px]:hidden px-6 py-2.5 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                    Enrolled New Course
                                </GradiantButton>
                                <GradiantButton onClick={() => navigate('/courses')} className="max-[600px]:block hidden text-[24px] px-4 py-1 bg-[#3758EE] text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                    +
                                </GradiantButton> */}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                            <Notification />
                        </div>

                    </main>
                </div>

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
        </div>
    );
};

export default NotificationPage;