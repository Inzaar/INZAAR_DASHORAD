import Navbar from '@/components/layouts/NavBar';
import Sidebar from '@/components/layouts/SideBar';
import React from 'react';
// Verify if you are using Vite/React (react-router-dom) or Next.js (next/navigation)
import { useNavigate } from 'react-router-dom';
import Notification from '@/components/shared/notification/Notification';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

import { getMyNotifications, markNotificationsAsSeen, markSingleAsRead } from '@/api/notification';
import { Loader, BellOff, Lock } from 'lucide-react';

const NotificationPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const translateMessage = (msg) => {
        if (!msg) return "";
        const cleanMsg = msg.trim().replace(/\s+/g, ' ');
        
        const courseMatch = cleanMsg.match(/^A new course "(.*?)" has been launched, check out now!$/i);
        if (courseMatch) return t("course_launched_msg", { courseName: t(courseMatch[1], courseMatch[1]), defaultValue: cleanMsg });
        
        const eventMatch = cleanMsg.match(/^There is a new event "(.*?)" happening, check it out!$/i);
        if (eventMatch) return t("event_happening_msg", { eventName: t(eventMatch[1], eventMatch[1]), defaultValue: cleanMsg });

        const haltDateMatch = cleanMsg.match(/^The event "(.*?)" scheduled on (.*?) has been put on halt$/i);
        if (haltDateMatch) return t("event_halted_date", { eventName: t(haltDateMatch[1], haltDateMatch[1]), date: haltDateMatch[2], defaultValue: cleanMsg });

        const renameMatch = cleanMsg.match(/^The event "(.*?)" has been renamed to "(.*?)"$/i);
        if (renameMatch) return t("event_renamed", { oldName: t(renameMatch[1], renameMatch[1]), newName: t(renameMatch[2], renameMatch[2]), defaultValue: cleanMsg });

        const modMatch = cleanMsg.match(/^"(.*?)" has been renamed\/shifted to (.*?) \/ modified!$/i);
        if (modMatch) return t("event_modified", { eventName: t(modMatch[1], modMatch[1]), date: modMatch[2], defaultValue: cleanMsg });

        const cancelMatch = cleanMsg.match(/^"(.*?)" has been canceled!$/i);
        if (cancelMatch) return t("event_canceled", { eventName: t(cancelMatch[1], cancelMatch[1]), defaultValue: cleanMsg });
        
        return t(cleanMsg, msg);
    };

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
            if (user?.role === 'guest') {
                setLoading(false);
                return;
            }

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
                            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 leading-[1.8] pt-2 pb-2">
                                {t('notifications', 'Notifications')}
                            </h2>
                            <p className="text-gray-400 text-sm md:text-base leading-[1.8]">
                                {t('notifications_list', 'Notifications List')}
                            </p>
                        </div>

                        <div className="flex flex-col">
                            {loading ? (
                                <div className="flex items-center justify-center h-[60vh]">
                                    <Loader className="w-10 h-10 text-[#3758EE] animate-spin" />
                                </div>
                            ) : user?.role === 'guest' ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <div className="w-16 h-16 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-2 border-4 border-[#F3E8FF]">
                                        <Lock className="w-8 h-8 text-[#B666E7]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Feature Locked</h3>
                                    <p className="text-gray-500 font-medium text-center max-w-sm">
                                        You are currently browsing as a guest. Please create an account or sign in to unlock notifications.
                                    </p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all"
                                    >
                                        Sign In / Create Account
                                    </button>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <Notification
                                        key={notification.id}
                                        isUnread={notification.isUnread}
                                        message={translateMessage(notification.message)}
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
                                    <p className="text-gray-400 font-medium">{t('no_notifications', 'No notifications yet')}</p>
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