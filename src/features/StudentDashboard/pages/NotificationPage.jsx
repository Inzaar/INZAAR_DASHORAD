import Navbar from '@/components/layouts/NavBar';
import Sidebar from '@/components/layouts/SideBar';
import React from 'react';
// Verify if you are using Vite/React (react-router-dom) or Next.js (next/navigation)
import { useNavigate } from 'react-router-dom';
import Notification from '@/components/shared/notification/Notification';

import { getMyNotifications, markNotificationsAsSeen, markSingleAsRead } from '@/api/notification';
import { Loader2, BellOff } from 'lucide-react';

const NotificationPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read in backend
            await markSingleAsRead(notification.id);
            
            // Update local state for immediate feedback
            setNotifications(prev => prev.map(n => 
                n.id === notification.id ? { ...n, isUnread: false } : n
            ));

            // Navigate if link exists
            if (notification.title !== "Welcome Aboard" && notification.link) {
                navigate(notification.link);
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
            // Still navigate even if marking as read fails
            if (notification.title !== "Welcome Aboard" && notification.link) {
                navigate(notification.link);
            }
        }
    };

    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await getMyNotifications();
                setNotifications(res.data.data.notifications || []);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        // Changed h-screen to min-h-screen for better mobile compatibility
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
            {/* Added relative and overflow-hidden to prevent layout shifts */}
            <div className="relative w-full max-w-[1920px] flex flex-col h-screen overflow-hidden gap-4">

                <Navbar onMenuClick={toggleSidebar} />

                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4'>

                    {/* Overlay for mobile sidebar */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
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
                        `}
                    />

                    {/* The Main Scrollable Area */}
                    <main className="flex-1 overflow-y-auto no-scrollbar bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <div className="mb-8">
                            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
                                Notifications
                            </h2>
                            <p className="text-gray-400 text-sm md:text-base">
                                Notifications List
                            </p>
                        </div>

                        <div className="flex flex-col">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                                    <p className="text-gray-500 font-medium">Loading notifications...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <Notification
                                        key={notification.id}
                                        isUnread={notification.isUnread}
                                        message={notification.message}
                                        time={notification.time}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={notification.title !== "Welcome Aboard" && notification.link ? "cursor-pointer" : ""}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                        <BellOff className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-medium">No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Inlining the style is fine, but ensure it's not conflicting with Tailwind */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default NotificationPage;