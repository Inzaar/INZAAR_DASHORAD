import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layouts/SideBar";
import Navbar from "@/components/layouts/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserProfileById, assignUserRole, deleteUser, restoreUser } from "@/api/user";
import { RiDeleteBin6Fill, RiAlertFill, RiInformationFill } from "react-icons/ri";
import toast from "react-hot-toast";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import deactivate from "@/assets/images/deactivate.png";
import ModeratorProfileComponent from "../components/moderator/ModeratorProfileComponent";
import StudentPerformance from "../components/student/StudentPerformance";
import StudentCourseDashboard from "../components/student/StudentCourseDashboard";
import StudentCertificates from "../components/student/StudentCertificates";
import AssignModeratorModal from "../components/student/AssignModeratorModal";
import { BsThreeDotsVertical, BsChatDotsFill } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";

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
    const [isIncompleteCourseModalOpen, setIsIncompleteCourseModalOpen] = useState(false);
    const [isModerator, setIsModerator] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
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

    useEffect(() => {
        if (profileData?.user) {
            setIsModerator(profileData.user.role === 'moderator' || profileData.user.role === 'admin');
        }
    }, [profileData]);

    const handleDeactivate = async () => {
        try {
            await deleteUser(id);
            toast.success("Student deactivated successfully!");
            // Re-fetch to update isDeleted status
            const res = await getUserProfileById(id);
            if (res?.data) setProfileData(res.data);
        } catch (err) {
            toast.error("Failed to deactivate student");
            console.error(err);
        }
    };

    const handleRestore = async () => {
        try {
            await restoreUser(id);
            toast.success("Student restored successfully!");
            // Re-fetch to update isDeleted status
            const res = await getUserProfileById(id);
            if (res?.data) setProfileData(res.data);
        } catch (err) {
            toast.error("Failed to restore student");
            console.error(err);
        }
    };

    const handleSwitchAsModeratorClick = () => {
        if (profileData?.user?.isDeleted) return;

        if (!isModerator) {
            const enrolledCourses = profileData?.enrolledCourses || [];
            const requiredCourse = enrolledCourses.find(c =>
                c.title && c.title.trim().toLowerCase().replace(/\s+/g, ' ') === "quran ka matlob insaan"
            );

            const isCourseCompleted = requiredCourse && (
                requiredCourse.isCompleted ||
                (requiredCourse.totalLectures > 0 && requiredCourse.completedLecturesCount >= requiredCourse.totalLectures)
            );

            if (!isCourseCompleted) {
                setIsIncompleteCourseModalOpen(true);
                return;
            }
        }

        setIsAssignModalOpen(true);
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (!user) {
        navigate("/login");
        return null;
    }

    const tabs = ["Profile", "Performance", "Courses", "Certificates"];

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
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
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button className="flex items-center gap-2 bg-[#4E6BFF] hover:bg-[#3f5be0] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
                                            Send Message <BsChatDotsFill className="text-white/90" size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (profileData?.user?.phone) {
                                                    const phone = profileData.user.phone.replace(/\D/g, '');
                                                    window.open(`https://wa.me/${phone}`, '_blank');
                                                } else {
                                                    toast.error("Phone number not available");
                                                }
                                            }}
                                            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
                                        >
                                            WhatsApp <FaWhatsapp size={16} />
                                        </button>
                                        <GradiantButton
                                            onClick={() => navigate(-1)}
                                            className="bg-[#A892FF] hover:bg-[#937aff] text-white px-5 py-2 rounded-[4px] text-sm mt-2 sm:mt-0 font-medium shadow-sm"
                                        >
                                            Back to list
                                        </GradiantButton>
                                    </div>
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
                                            {!profileData?.user?.isDeleted ? (
                                                <button
                                                    onClick={() => setIsDeleteModalOpen(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#B1B1B1] text-white rounded-[4px] text-sm font-medium hover:bg-gray-400 transition-all shadow-sm"
                                                >
                                                    <img src={deactivate} alt="Deactivate" className="w-4 h-4 object-contain" />
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsRestoreModalOpen(true)}
                                                    className="bg-gradient-to-r from-[#FF4E4E] to-[#E52222] hover:opacity-90 text-white px-4 py-2 rounded-[4px] text-sm transition flex items-center justify-center gap-2 shadow-sm shadow-red-500/30"
                                                >
                                                    <RiDeleteBin6Fill className="rotate-180" /> Restore
                                                </button>
                                            )}

                                            {user?.role === 'admin' && (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-medium whitespace-nowrap ${profileData?.user?.isDeleted ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Switch as Moderator
                                                    </span>
                                                    <label className={`relative inline-flex items-center ${profileData?.user?.isDeleted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} scale-90`}>
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={isModerator}
                                                            disabled={profileData?.user?.isDeleted}
                                                            onChange={() => {
                                                                handleSwitchAsModeratorClick();
                                                            }}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3758EE]"></div>
                                                    </label>
                                                </div>
                                            )}
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
                                                    {!profileData?.user?.isDeleted ? (
                                                        <button
                                                            onClick={() => { setIsDeleteModalOpen(true); setOpen(false); }}
                                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-left font-sans"
                                                        >
                                                            Deactivate Profile
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setIsRestoreModalOpen(true); setOpen(false); }}
                                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors text-left font-sans"
                                                        >
                                                            <RiDeleteBin6Fill className="w-4 h-4 rotate-180" /> Restore Profile
                                                        </button>
                                                    )}
                                                    {user?.role === 'admin' && (
                                                        <div className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors ${profileData?.user?.isDeleted ? 'text-gray-400 hover:bg-transparent' : 'text-gray-600 hover:bg-gray-50'}`}>
                                                            <span>Switch as Moderator</span>
                                                            <label className={`relative inline-flex items-center ${profileData?.user?.isDeleted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} scale-[0.8]`}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only peer"
                                                                    checked={isModerator}
                                                                    disabled={profileData?.user?.isDeleted}
                                                                    onChange={() => {
                                                                        handleSwitchAsModeratorClick();
                                                                    }}
                                                                />
                                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3758EE]"></div>
                                                            </label>
                                                        </div>
                                                    )}
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
                                    initialRole={profileData?.user?.role === 'moderator' ? 'moderator' : ''}
                                    assignedFeatures={profileData?.user?.assignedFeatures || []}
                                    onClose={() => setIsAssignModalOpen(false)}
                                    onSave={async (data) => {
                                        try {
                                            await assignUserRole(id, {
                                                role: data.selectedRole || "moderator",
                                                assignedFeatures: data.features
                                            });
                                            toast.success("Moderator assigned successfully!");
                                            setIsAssignModalOpen(false);
                                            // Re-fetch to update state
                                            const res = await getUserProfileById(id);
                                            if (res?.data) {
                                                setProfileData(res.data);
                                            }
                                        } catch (err) {
                                            toast.error(err?.response?.data?.message || "Failed to assign moderator");
                                            console.error(err);
                                        }
                                    }}
                                />

                                {/* Deactivate/Delete Confirmation Modal */}
                                {isDeleteModalOpen && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-sans text-left">
                                        <div className="bg-white w-full max-w-[450px] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                                            <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-50 flex-shrink-0">
                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shadow-sm">
                                                    <RiDeleteBin6Fill className="text-red-600 w-5 h-5" />
                                                </div>
                                                <h2 className="text-[22px] font-bold text-gray-800">Confirm Deactivation</h2>
                                            </div>
                                            <div className="px-8 py-6 flex-1 text-gray-600 text-sm">
                                                Are you sure you want to deactivate <span className="font-bold">{profileData?.user?.firstname} {profileData?.user?.lastname}</span>?
                                                This will soft-delete their profile and disable their active roles.
                                            </div>
                                            <div className="px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50 flex-shrink-0 bg-white">
                                                <button onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto px-10 py-3 bg-[#F5F5F5] text-gray-600 rounded-[12px] font-bold text-sm hover:bg-gray-200 transition-all active:scale-95">
                                                    No, Cancel
                                                </button>
                                                <button onClick={() => { setIsDeleteModalOpen(false); handleDeactivate(); }} className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-[#FF4E4E] to-[#E52222] text-white rounded-[12px] font-bold text-sm shadow-lg shadow-red-500/30 hover:opacity-90 transition-all active:scale-95">
                                                    Yes, Deactivate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Restore Confirmation Modal */}
                                {isRestoreModalOpen && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-sans text-left">
                                        <div className="bg-white w-full max-w-[450px] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                                            <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-50 flex-shrink-0">
                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shadow-sm">
                                                    <RiDeleteBin6Fill className="text-[#E52222] w-5 h-5 rotate-180" />
                                                </div>
                                                <h2 className="text-[22px] font-bold text-gray-800">Confirm Restoration</h2>
                                            </div>
                                            <div className="px-8 py-6 flex-1 text-gray-600 text-sm">
                                                Are you sure you want to restore <span className="font-bold">{profileData?.user?.firstname} {profileData?.user?.lastname}</span>?
                                                This will make the student active and visible in the general lists again.
                                            </div>
                                            <div className="px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50 flex-shrink-0 bg-white">
                                                <button onClick={() => setIsRestoreModalOpen(false)} className="w-full sm:w-auto px-10 py-3 bg-[#F5F5F5] text-gray-600 rounded-[12px] font-bold text-sm hover:bg-gray-200 transition-all active:scale-95">
                                                    No, Cancel
                                                </button>
                                                <button onClick={() => { setIsRestoreModalOpen(false); handleRestore(); }} className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-[#FF4E4E] to-[#E52222] text-white rounded-[12px] font-bold text-sm shadow-lg shadow-red-500/30 hover:opacity-90 transition-all active:scale-95">
                                                    Yes, Restore
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                 {/* Incomplete Required Course Warning Modal */}
                                 {isIncompleteCourseModalOpen && (
                                     <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans text-left">
                                         <div className="bg-white w-full max-w-[460px] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                             <div className="pt-8 pb-4 px-6 flex flex-col items-center text-center">
                                                 <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-500 mb-4 shadow-sm">
                                                     <RiAlertFill className="w-8 h-8 text-amber-500" />
                                                 </div>
                                                 <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">
                                                     Course Completion Required
                                                 </h3>
                                                 <p className="text-gray-500 text-sm mt-2 leading-relaxed px-2">
                                                     To switch this student to a Moderator, completing the course <span className="font-bold text-gray-800 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200/60 inline-block my-1">"Quran ka Matlob Insaan"</span> is mandatory.
                                                 </p>
                                                 <div className="mt-4 p-3.5 bg-red-50/80 border border-red-100 rounded-xl text-left w-full flex items-start gap-2.5">
                                                     <RiInformationFill className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                     <p className="text-xs text-red-700 font-medium leading-normal">
                                                         This student has not completed this course yet and cannot be assigned as a moderator.
                                                     </p>
                                                 </div>
                                             </div>

                                             <div className="px-6 pb-6 pt-2 flex items-center justify-center">
                                                 <button
                                                     onClick={() => setIsIncompleteCourseModalOpen(false)}
                                                     className="w-full bg-[#3758EE] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] text-sm"
                                                 >
                                                     Understood
                                                 </button>
                                             </div>
                                         </div>
                                     </div>
                                 )}
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
