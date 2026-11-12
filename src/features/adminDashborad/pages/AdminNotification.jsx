import Navbar from '@/components/layouts/NavBar';
import Sidebar from '@/components/layouts/SideBar';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/context/NotificationContext';
import { BellOff } from 'lucide-react';

import Notification from '@/components/shared/notification/Notification';

const NotificationSkeleton = () => {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            {/* Section 1 Skeleton */}
            <div className="flex flex-col">
                <div className="h-3.5 bg-gray-200 rounded w-24 mb-3 mx-1"></div>
                {[
                    { w: 'w-[85%]', t: 'w-14' },
                    { w: 'w-[75%]', t: 'w-14' },
                    { w: 'w-[90%]', t: 'w-14' },
                    { w: 'w-[70%]', t: 'w-14' },
                    { w: 'w-[65%]', t: 'w-14' },
                ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3.5 md:p-4 border-b border-gray-100">
                        <div className="flex-1 flex items-center gap-4 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                            <div className="flex items-center gap-2 flex-1 min-w-0 pr-4">
                                <div className={`h-4 bg-gray-200 rounded ${item.w} max-w-full`}></div>
                            </div>
                        </div>
                        <div className={`h-3 bg-gray-200 rounded ${item.t} shrink-0 ml-4`}></div>
                    </div>
                ))}
            </div>

            {/* Section 2 Skeleton */}
            <div className="flex flex-col">
                <div className="h-3.5 bg-gray-200 rounded w-20 mb-3 mx-1"></div>
                {[
                    { w: 'w-[80%]', t: 'w-16' },
                    { w: 'w-[92%]', t: 'w-16' },
                    { w: 'w-[68%]', t: 'w-16' },
                    { w: 'w-[74%]', t: 'w-16' },
                    { w: 'w-[82%]', t: 'w-16' },
                ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3.5 md:p-4 border-b border-gray-100">
                        <div className="flex-1 flex items-center gap-4 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                            <div className="flex items-center gap-2 flex-1 min-w-0 pr-4">
                                <div className={`h-4 bg-gray-200 rounded ${item.w} max-w-full`}></div>
                            </div>
                        </div>
                        <div className={`h-3 bg-gray-200 rounded ${item.t} shrink-0 ml-4`}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminNotification = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const { notifications, loading, markAsRead } = useNotification();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleNotificationClick = async (notification) => {
        try {
            if (notification.isUnread) {
                await markAsRead(notification.id);
            }

            if (notification.title !== "Welcome Aboard" && notification.link) {
                let targetLink = notification.link;

                // Intercept any notifications that point to admin-course-play for comments
                // and redirect them back to the student details page
                if (targetLink.includes("/admin-course-play") && targetLink.includes("lectureId=") && targetLink.includes("userId=")) {
                    try {
                        const urlParams = new URLSearchParams(targetLink.split('?')[1]);
                        const userId = urlParams.get('userId');
                        const courseId = urlParams.get('id');
                        const lectureId = urlParams.get('lectureId');
                        if (userId && courseId && lectureId) {
                            targetLink = `/admin/student-details/${userId}?courseId=${courseId}&lectureId=${lectureId}`;
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }

                if (targetLink.startsWith("/dashboard")) {
                    targetLink = targetLink.replace("/dashboard", "/admin-calendar");
                } else if (targetLink.startsWith("/courses")) {
                    targetLink = targetLink.replace("/courses", "/admin-courses");
                }

                navigate(targetLink);
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
            if (notification.title !== "Welcome Aboard" && notification.link) {
                let targetLink = notification.link;

                // Intercept for error block too
                if (targetLink.includes("/admin-course-play") && targetLink.includes("lectureId=") && targetLink.includes("userId=")) {
                    try {
                        const urlParams = new URLSearchParams(targetLink.split('?')[1]);
                        const userId = urlParams.get('userId');
                        const courseId = urlParams.get('id');
                        const lectureId = urlParams.get('lectureId');
                        if (userId && courseId && lectureId) {
                            targetLink = `/admin/student-details/${userId}?courseId=${courseId}&lectureId=${lectureId}`;
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }

                if (targetLink.startsWith("/dashboard")) {
                    targetLink = targetLink.replace("/dashboard", "/admin-calendar");
                } else if (targetLink.startsWith("/courses")) {
                    targetLink = targetLink.replace("/courses", "/admin-courses");
                }
                navigate(targetLink);
            }
        }
    };

    const groupNotificationsByDate = (notifs) => {
        const today = [];
        const yesterday = [];
        const earlier = [];

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        notifs.forEach((item) => {
            let category = 'earlier';

            if (item.createdAt) {
                const date = new Date(item.createdAt);
                if (date >= todayStart) {
                    category = 'today';
                } else if (date >= yesterdayStart) {
                    category = 'yesterday';
                } else {
                    category = 'earlier';
                }
            } else if (item.time) {
                const timeLower = item.time.toLowerCase();
                if (timeLower.includes('just now') || timeLower.includes('minute') || timeLower.includes('hour')) {
                    category = 'today';
                } else if (timeLower.includes('1 day') || timeLower.includes('yesterday')) {
                    category = 'yesterday';
                } else {
                    category = 'earlier';
                }
            }

            if (category === 'today') today.push(item);
            else if (category === 'yesterday') yesterday.push(item);
            else earlier.push(item);
        });

        return { today, yesterday, earlier };
    };

    return (
        // Changed h-screen to min-h-screen for better mobile compatibility
        <div className="min-h-screen max-h-[1680px] w-full flex items-center justify-center bg-[#F8F9FA]">
            {/* Added relative and overflow-hidden to prevent layout shifts */}
            <div className="relative w-full max-w-[1920px] max-h-[1680px] flex flex-col h-screen overflow-hidden gap-4">

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
                                <NotificationSkeleton />
                            ) : notifications.length > 0 ? (
                                (() => {
                                    const { today, yesterday, earlier } = groupNotificationsByDate(notifications);
                                    return (
                                        <div className="flex flex-col gap-6">
                                            {today.length > 0 && (
                                                <div className="flex flex-col">
                                                    <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                                        Today
                                                    </h3>
                                                    {today.map((notification) => (
                                                        <Notification
                                                            key={notification.id}
                                                            isUnread={notification.isUnread}
                                                            message={notification.message}
                                                            time={notification.time}
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className={notification.title !== "Welcome Aboard" && notification.link ? "cursor-pointer" : ""}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {yesterday.length > 0 && (
                                                <div className="flex flex-col">
                                                    <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                                        Yesterday
                                                    </h3>
                                                    {yesterday.map((notification) => (
                                                        <Notification
                                                            key={notification.id}
                                                            isUnread={notification.isUnread}
                                                            message={notification.message}
                                                            time={notification.time}
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className={notification.title !== "Welcome Aboard" && notification.link ? "cursor-pointer" : ""}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {earlier.length > 0 && (
                                                <div className="flex flex-col">
                                                    <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                                        Earlier
                                                    </h3>
                                                    {earlier.map((notification) => (
                                                        <Notification
                                                            key={notification.id}
                                                            isUnread={notification.isUnread}
                                                            message={notification.message}
                                                            time={notification.time}
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className={notification.title !== "Welcome Aboard" && notification.link ? "cursor-pointer" : ""}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <BellOff className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No notifications yet</p>
                                    <p className="text-sm">We'll notify you of new activities!</p>
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

export default AdminNotification;