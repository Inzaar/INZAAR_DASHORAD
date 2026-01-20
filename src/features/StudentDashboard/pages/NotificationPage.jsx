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

    const mockNotifications = [
        { id: 1, message: "New Claim Submitted – John Mitchell has submitted a new warranty claim for his Toyota Camry on June 13, 2025.", time: "2 hours ago" },
        { id: 2, message: "System Update – The dashboard will be undergoing scheduled maintenance tonight from 12:00 AM to 2:00 AM.", time: "5 hours ago" },
        { id: 3, message: "Course Completed – Congratulations! You have successfully completed 'Advanced React Patterns'.", time: "1 day ago" },
        { id: 4, message: "New Assignment – A new assignment 'Redux State Management' has been uploaded to your course.", time: "1 day ago" },
        { id: 5, message: "Profile Updated – Your profile information was successfully updated.", time: "2 days ago" },
        { id: 6, message: "Welcome Aboard – Welcome to the Inzaar Student Dashboard! We're glad to have you here.", time: "1 week ago" },
        { id: 7, message: "Reminder – Your subscription is set to renew in 3 days. Please check your payment details.", time: "1 week ago" },
        { id: 8, message: "New Feature – Check out the new dark mode available in settings!", time: "2 weeks ago" },
        { id: 9, message: "Feedback Request – We'd love to hear your thoughts on the new dashboard design.", time: "2 weeks ago" },
        { id: 10, message: "Security Alert – A new login was detected from a new device.", time: "3 weeks ago" },
        { id: 11, message: "Achievement Unlocked – You've earned the 'Early Bird' badge!", time: "1 month ago" },
        { id: 12, message: "Exam Schedule – The schedule for the upcoming final exams has been released.", time: "1 month ago" }
    ];

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

                        <div className="flex flex-col">
                            {mockNotifications.map((notification) => (
                                <Notification
                                    key={notification.id}
                                    message={notification.message}
                                    time={notification.time}
                                />
                            ))}
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