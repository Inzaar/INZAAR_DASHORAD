import React, { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/layouts/SideBar";
import Navbar from "@/components/layouts/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import { getInstructorById, deleteInstructor } from "@/api/instructor";
import { getAllCourses } from "@/api/course";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import InstructorProfileComponent from "../components/instructor/InstructorProfileComponent";
import toast from "react-hot-toast";

const InstructorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        fetchInstructorData();
    }, [id]);

    const fetchInstructorData = async () => {
        try {
            setLoading(true);
            const response = await getInstructorById(id);
            if (response.data && response.data.data) {
                const instructorData = response.data.data;
                try {
                    const coursesRes = await getAllCourses();
                    if (coursesRes.data && coursesRes.data.data) {
                        const allCourses = coursesRes.data.data;
                        const fullName = `${instructorData.firstname || ''} ${instructorData.lastname || ''}`.trim();
                        instructorData.assignedCourses = allCourses.filter(c => 
                            c.instructor === instructorData._id || 
                            c.instructor === fullName ||
                            c.instructor === instructorData.firstname
                        );
                    }
                } catch (err) {
                    console.error("Failed to fetch courses:", err);
                }
                setInstructor(instructorData);
            }
        } catch (error) {
            console.error("Error fetching instructor:", error);
            toast.error("Failed to load instructor details.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this instructor?");
        if (confirmDelete) {
            try {
                await deleteInstructor(id);
                toast.success("Instructor deleted successfully");
                navigate('/admin-instructors');
            } catch (error) {
                console.error("Error deleting instructor:", error);
                toast.error("Failed to delete instructor");
            }
        }
    };

    const renderLayout = (content) => (
        <div className="h-screen w-screen flex items-center justify-center font-sans">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-3 sm:gap-4">
                <Navbar onMenuClick={toggleSidebar} />

                <div className='flex flex-col lg:flex-row px-2 sm:px-4 gap-3 sm:gap-4 flex-1 overflow-hidden relative pb-2 sm:pb-4'>
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
                        fixed left-0 top-0 shadow-2xl h-[calc(100vh-2rem)] mt-4
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        `}
                    />

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] overflow-hidden rounded-2xl">
                        <div className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return renderLayout(
            <div className="flex-1 flex justify-center items-center">
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!instructor) {
        return renderLayout(
            <div className="flex-1 flex justify-center items-center gap-4">
                <p className="text-sm text-gray-500">Instructor not found.</p>
                <GradiantButton onClick={() => navigate('/admin-instructors')} className="px-4 py-2 text-white rounded-lg text-sm">Back</GradiantButton>
            </div>
        );
    }

    return renderLayout(
        <>
            {/* Header */}
            <div className="flex flex-row justify-between items-center gap-3 mb-4 sm:mb-6">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#0f172a] leading-tight truncate">
                        {instructor.firstname} {instructor.lastname}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Instructor Profile</p>
                </div>

                {/* Desktop Buttons (Visible on md+) */}
                <div className="hidden md:flex items-center gap-2.5 shrink-0">
                    {instructor.phone && (
                        <a 
                            href={`https://wa.me/${instructor.phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            <button className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all rounded-xl text-xs sm:text-sm font-semibold shadow-sm">
                                <FaWhatsapp size={15} />
                                <span>WhatsApp</span>
                            </button>
                        </a>
                    )}
                    
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all rounded-xl text-xs sm:text-sm font-semibold shadow-sm"
                    >
                        <RiDeleteBin6Fill size={15} />
                        Delete
                    </button>
                    <GradiantButton 
                        onClick={() => navigate('/admin-instructors')}
                        className="px-4 sm:px-5 py-2 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm"
                    >
                        Back to List
                    </GradiantButton>
                </div>

                {/* Mobile / Small Screen View (< md) */}
                <div className="flex md:hidden items-center gap-2 shrink-0">
                    <GradiantButton 
                        onClick={() => navigate('/admin-instructors')}
                        className="px-3 py-1.5 text-white rounded-full text-xs font-semibold shadow-sm"
                    >
                        Back to List
                    </GradiantButton>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-lg border border-gray-200 shadow-xs transition-colors flex items-center justify-center"
                            aria-label="More actions"
                        >
                            <BsThreeDotsVertical size={16} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                                {instructor.phone && (
                                    <a
                                        href={`https://wa.me/${instructor.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                                        <span>WhatsApp</span>
                                    </a>
                                )}
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleDelete();
                                    }}
                                    className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <RiDeleteBin6Fill className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full">
                <InstructorProfileComponent profileData={instructor} isEditMode={false} />
            </div>
        </>
    );
};

export default InstructorDetails;