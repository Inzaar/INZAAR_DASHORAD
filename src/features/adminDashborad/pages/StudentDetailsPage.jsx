import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layouts/SideBar";
import Navbar from "@/components/layouts/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserProfileById, assignUserRole } from "@/api/user";
import toast from "react-hot-toast";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import deactivate from "@/assets/images/deactivate.png";
import ModeratorProfileComponent from "../components/moderator/ModeratorProfileComponent";
import StudentPerformance from "../components/student/StudentPerformance";
import StudentCourseDashboard from "../components/student/StudentCourseDashboard";
import StudentCertificates from "../components/student/StudentCertificates";
import AssignModeratorModal from "../components/student/AssignModeratorModal";
import { BsThreeDotsVertical } from "react-icons/bs";

const StudentDetailsPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { id } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Profile');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isModerator, setIsModerator] = useState(false);
    const dropdownRef = useRef(null);

    // outside click close for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const res = await getUserProfileById(id);
                if (res?.data) {
                    setProfileData(res.data);
                }
            } catch (error) {
                console.error("Error fetching student profile data:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfileData();
    }, [id]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (!user) {
        navigate("/login");
        return null;
    }

    const tabs = ["Profile", "Performance", "Courses", "Certificates"];

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />

                <div className="flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative pb-4">
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
                            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                        `}
                    />

                    <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide">
                        <div className="py-4 pr-2">
                            <div className="bg-white shadow rounded-lg p-4">
                                {/* Header Title and Back Button */}
                                <div className="hidden sm:flex sm:flex-row justify-between items-start sm:items-center mb-4">
                                    <h1 className="text-xl font-semibold text-gray-700">Profile</h1>
                                    <GradiantButton
                                        onClick={() => navigate(-1)}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-[4px] text-sm mt-2 sm:mt-0"
                                    >
                                        Back to list
                                    </GradiantButton>
                                </div>

                                {/* Tabs and Actions Bar */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                                    <div className="hidden md:flex items-center bg-gray-100 rounded-[4px] p-1 w-auto shrink-0">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-[4px] ${activeTab === tab
                                                    ? 'bg-white text-gray-800 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                        <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                                            Joining: <span className="text-gray-800">10/04/2025</span>
                                        </span>

                                        <div className="hidden xl:flex items-center gap-4">
                                            <button className="flex items-center gap-2 px-4 py-2 bg-[#B1B1B1] text-white rounded-[4px] text-sm font-medium hover:bg-gray-400 transition-all shadow-sm">
                                                <img src={deactivate} alt="Deactivate" className="w-4 h-4 object-contain" />
                                                Deactivate
                                            </button>

                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Switch as Moderator</span>
                                                <label className="relative inline-flex items-center cursor-pointer scale-90">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={isModerator}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setIsAssignModalOpen(true);
                                                            } else {
                                                                setIsModerator(false);
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3758EE]"></div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* 3-dot actions — hidden on xl+ */}
                                        <div ref={dropdownRef} className="relative xl:hidden">
                                            <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                                                <BsThreeDotsVertical size={20} />
                                            </button>
                                            {open && (
                                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-xl z-50 p-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                                                    {/* Navigation Section — hidden on md+ since tabs show outside */}
                                                    <div className="md:hidden mb-2 pb-2 border-b border-gray-100">
                                                        <p className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Navigation</p>
                                                        {tabs.map((tab) => (
                                                            <button
                                                                key={tab}
                                                                onClick={() => {
                                                                    setActiveTab(tab);
                                                                    setOpen(false);
                                                                }}
                                                                className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                                                                    ? 'bg-blue-50 text-[#3758EE]'
                                                                    : 'text-gray-600 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {tab}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Actions Section */}
                                                    <p className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Actions</p>
                                                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-left font-sans">
                                                        Deactivate Profile
                                                    </button>
                                                    <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                                                        <span>Switch as Moderator</span>
                                                        <label className="relative inline-flex items-center cursor-pointer scale-[0.8]">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer" 
                                                                checked={isModerator}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setIsAssignModalOpen(true);
                                                                    } else {
                                                                        setIsModerator(false);
                                                                    }
                                                                }}
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3758EE]"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Area */}
                                {activeTab === "Profile" ? (
                                    <ModeratorProfileComponent profileData={profileData} type="student" />
                                ) : activeTab === "Performance" ? (
                                    <StudentPerformance profileData={profileData} />
                                ) : activeTab === "Courses" ? (
                                    <StudentCourseDashboard profileData={profileData} />
                                ) : activeTab === "Certificates" ? (
                                    <StudentCertificates profileData={profileData} />
                                ) : (
                                    <div className="min-h-[400px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        {activeTab} Content (Coming Soon)
                                    </div>
                                )}

                                <AssignModeratorModal 
                                    isOpen={isAssignModalOpen}
                                    onClose={() => setIsAssignModalOpen(false)}
                                    onSave={async (data) => {
                                        try {
                                            await assignUserRole(id, {
                                                role: data.selectedRole || "moderator",
                                                assignedFeatures: data.features
                                            });
                                            toast.success("Moderator assigned successfully!");
                                            setIsModerator(true);
                                            setIsAssignModalOpen(false);
                                            navigate("/admin-moderators");
                                        } catch (err) {
                                            toast.error("Failed to assign moderator");
                                            console.error(err);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </main>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `
                }} />
            </div>
        </div>
    );
};

export default StudentDetailsPage;
