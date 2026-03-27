import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import Profile from '@/components/layouts/profile/profile';
import { getUserById } from '@/api/auth';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [userPayload, setUserPayload] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const progressPercentage = 40;

    console.log("working before the useEffect")
    useEffect(() => {
        const getUserdata = async () => {
            try {
                const res = await getUserById();
                console.log("useEffect", res.data.data.user);
                setUserInfo(res.data.data.user);
                setUserPayload(res.data.data.user);
            } catch (error) {
                console.log("useEffect error", error);
            } finally {
                setIsLoading(false);
            }
        }
        getUserdata();
    }, []);

    // useEffect(() => {
    //     console.log("userInfo", userInfo);
    // }, [userInfo]);

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
                            {isLoading ? (
                                <div className="w-full flex justify-center items-center py-20">
                                    <p className="text-gray-500 text-lg font-medium">Loading profile details...</p>
                                </div>
                            ) : userInfo ? (
                                <Profile userInfo={userInfo} setUserPayload={setUserPayload} userPayload={userPayload} />
                            ) : (
                                <div className="w-full flex justify-center items-center py-20">
                                    <p className="text-red-500 text-lg font-medium">Failed to load profile details. Are you logged in?</p>
                                </div>
                            )}
                        </div>

                    </main>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />
            </div>
        </div>
    );
};

export default ProfilePage;