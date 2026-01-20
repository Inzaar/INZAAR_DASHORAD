import React from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/Navbar';
import { useNavigate } from 'react-router-dom';

const Certificates = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
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
                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className="py-4 pr-2">

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

export default Certificates;