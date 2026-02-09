import Navbar from '@/components/layouts/NavBar';
import Sidebar from '@/components/layouts/SideBar';
import React from 'react';
// Verify if you are using Vite/React (react-router-dom) or Next.js (next/navigation)
import { useNavigate } from 'react-router-dom';
import Notification from '@/components/shared/notification/Notification';

const AdminNotification = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const navigate = useNavigate(); // Ensure this is inside a <BrowserRouter>

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
        { id: 10, message: "Security Alert – A new login was detected from a new device in Sahiwal, Pakistan.", time: "3 weeks ago" },
        { id: 11, message: "Achievement Unlocked – You've earned the 'Early Bird' badge for submitting your project early!", time: "1 month ago" },
        { id: 12, message: "Exam Schedule – The schedule for the upcoming final exams (BSCS 6th Semester) has been released.", time: "1 month ago" },

        // --- Newly Added Messages ---
        { id: 13, message: "Payment Successful – Your invoice for 'Cloud Hosting Services' has been paid successfully.", time: "1 month ago" },
        { id: 14, message: "New Message – Your supervisor, Waseem Abbas, sent you a message regarding 'RecycoTrack' project updates.", time: "1 month ago" },
        { id: 15, message: "GitHub Integration – Your repository 'mern-stack-app' was successfully connected to the dashboard.", time: "2 months ago" },
        { id: 16, message: "Internship Update – Three new candidates have applied for the Web Development internship position.", time: "2 months ago" },
        { id: 17, message: "Server Alert – High CPU usage detected on your AWS EC2 instance. Please monitor the performance.", time: "2 months ago" },
        { id: 18, message: "Verification Required – Please verify your email address to access all features of the Inzaar portal.", time: "3 months ago" },
        { id: 19, message: "Project Milestone – 'Healthcare AIQ' Volume 1 has been marked as completed by client Ron.", time: "3 months ago" },
        { id: 20, message: "Database Backup – A full backup of your production database was successfully created.", time: "3 months ago" }
    ];

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
                            lg:translate-x-0 lg:static 
                            fixed left-0 top-0 h-[800px] w-64 bg-white
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
            </div>

            {/* Inlining the style is fine, but ensure it's not conflicting with Tailwind */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default AdminNotification;