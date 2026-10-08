import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layouts/SideBar";
import Navbar from "@/components/layouts/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import { getInstructorById, deleteInstructor } from "@/api/instructor";
import { getAllCourses } from "@/api/course";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { RiDeleteBin6Fill } from "react-icons/ri";
import InstructorProfileComponent from "../components/instructor/InstructorProfileComponent";
import toast from "react-hot-toast";

const InstructorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] h-screen overflow-hidden gap-4">
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
                        fixed left-0 top-0 shadow-2xl h-[calc(100vh-2rem)] mt-4
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        `}
                    />

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] overflow-hidden rounded-2xl">
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
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
                <p>Loading...</p>
            </div>
        );
    }

    if (!instructor) {
        return renderLayout(
            <div className="flex-1 flex justify-center items-center">
                <p>Instructor not found.</p>
                <GradiantButton onClick={() => navigate('/admin-instructors')} className="ml-4 px-4 py-2 text-white rounded-lg">Back</GradiantButton>
            </div>
        );
    }

    return renderLayout(
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-bold text-[#0f172a] mb-1">
                        {instructor.firstname} {instructor.lastname}
                    </h1>
                    <p className="text-[14px] text-gray-500 font-medium">Instructor Profile</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* WhatsApp Button */}
                    {instructor.phone && (
                        <a 
                            href={`https://wa.me/${instructor.phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 transition-colors rounded-xl text-[14px] font-bold">
                                WhatsApp
                            </button>
                        </a>
                    )}
                    
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-xl text-[14px] font-bold shadow-sm"
                    >
                        <RiDeleteBin6Fill size={18} />
                        Delete
                    </button>
                    <GradiantButton 
                        onClick={() => navigate('/admin-instructors')}
                        className="px-6 py-2.5 text-white rounded-xl text-[14px] font-bold shadow-sm"
                    >
                        Back to List
                    </GradiantButton>
                </div>
            </div>

            <div className="w-full">
                <InstructorProfileComponent profileData={instructor} isEditMode={false} />
            </div>
        </>
    );
};

export default InstructorDetails;