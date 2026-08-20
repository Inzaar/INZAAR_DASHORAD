import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import { useNavigate } from 'react-router-dom';
import Profile from '@/components/layouts/profile/profile';
import { getUserById } from '@/api/auth';
import { Loader, ServerCrash } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [userPayload, setUserPayload] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    console.log("working before the useEffect")
    useEffect(() => {
        const getUserdata = async () => {
            if (user?.role === 'guest') {
                const guestProfile = {
                    firstname: "Guest",
                    lastname: "User",
                    email: "guest@inzaar.org",
                    role: "guest",
                    phone: "N/A",
                    gender: "N/A",
                    dob: null,
                    address: "N/A"
                };
                setUserInfo(guestProfile);
                setUserPayload(guestProfile);
                setIsLoading(false);
                return;
            }

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
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>
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
                        fixed left-0 top-0 shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />
                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <div className="">
                            {isLoading ? (
                                <div className="w-full h-[70vh] flex justify-center items-center">
                                    <Loader className="w-10 h-10 text-[#3758EE] animate-spin" />
                                </div>
                            ) : userInfo ? (
                                <Profile userInfo={userInfo} setUserPayload={setUserPayload} userPayload={userPayload} />
                            ) : (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ServerCrash className="w-10 h-10 text-red-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Connection Error</h3>
                                        <p className="text-slate-600 mb-8 leading-relaxed">
                                            We're having trouble connecting to the server to load your profile. Please check your connection or try again later.
                                        </p>
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="w-full bg-[#3758EE] hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
                                        >
                                            Try Again
                                        </button>
                                    </div>
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