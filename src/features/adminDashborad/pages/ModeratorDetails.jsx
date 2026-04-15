import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layouts/SideBar";
import Navbar from "@/components/layouts/NavBar";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserProfileById } from "@/api/user";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { RiDeleteBin6Fill } from "react-icons/ri";
import deactivate from "@/assets/images/deactivate.png";
import SessionActivity from "@/components/shared/SessionActivity";
import ModeratorProfileComponent from "../components/moderator/ModeratorProfileComponent";
import { BsThreeDotsVertical } from "react-icons/bs";
import ModeratorBatchesComponent from "../components/moderator/ModeratorBatchesComponent";
import ModeratorRecordComponent from "../components/moderator/ModeratorRecordComponent";
import AssignModeratorModal from "../components/student/AssignModeratorModal";
import { assignUserRole } from "@/api/user";
import toast from "react-hot-toast";
import { Check } from "lucide-react";

const ModeratorDetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(state?.moderator ? { user: state.moderator } : null);
  const [loading, setLoading] = useState(!state?.moderator);
  const [open, setOpen] = useState(false);
  const [profileButton, setProfileButton] = useState('Profile');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  // ✅ outside click close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const res = await getUserProfileById(id);
        if (res?.data) {
          // res.data is expected to be { user, assignedBatches, stats, etc. }
          setProfileData(res.data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProfileData();
    }
  }, [id]);

  const handleprofilebutton = (e) => {
    setProfileButton(e.target.value);
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getUserProfileById(id);
      if (res?.data) {
        setProfileData(res.data);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignModalSave = async (data) => {
    try {
      await assignUserRole(id, {
        role: "moderator",
        assignedFeatures: data.features
      });
      toast.success("Moderator updated successfully!");
      setIsAssignModalOpen(false);
      fetchProfileData(); // Refresh data
    } catch (err) {
      toast.error("Failed to update moderator");
      console.error(err);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!user) {
    navigate("/login");
  }



  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="relative w-full max-w-[1920px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
        <Navbar onMenuClick={toggleSidebar} />

        <div className="flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative">
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
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          />
          {/* responsive */}
          <main
            className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <div className="py-4 pr-2">
              <div className="bg-white shadow rounded-lg p-4">
                <div className="hidden md:flex justify-between items-center mb-4">
                  <h1 className=" text-xl font-semibold text-gray-700">
                    Profile
                  </h1>
                  <GradiantButton
                    onClick={() => navigate('/admin-moderators')}
                    className=" bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-[4px] text-sm md:mt-0"
                  >
                    Back to list
                  </GradiantButton>
                </div>

                <div className="flex flex-row justify-between items-center w-full gap-2 mt-4 sm:mt-0">
                  <div className="flex bg-gray-100 p-1 rounded-md flex-wrap items-center w-fit justify-start">
                    <button
                      onClick={() => setProfileButton('Profile')}
                      className={`px-2 min-[400px]:px-3 sm:px-6 py-1.5 sm:py-2 text-[11px] min-[400px]:text-[13px] sm:text-[14px] font-medium rounded-md transition-all duration-200 ${profileButton === 'Profile'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => setProfileButton('batchs')}
                      className={`px-2 min-[400px]:px-3 sm:px-6 py-1.5 sm:py-2 text-[11px] min-[400px]:text-[13px] sm:text-[14px] font-medium rounded-md transition-all duration-200 ${profileButton === 'batchs'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Batches
                    </button>
                    <button
                      onClick={() => setProfileButton('records')}
                      className={`px-2 min-[400px]:px-3 sm:px-6 py-1.5 sm:py-2 text-[11px] min-[400px]:text-[13px] sm:text-[14px] font-medium rounded-md transition-all duration-200 ${profileButton === 'records'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Records
                    </button>
                  </div>

                  {/* responsive actions */}
                  <div className="hidden xl:flex flex-wrap items-center gap-3 ml-auto">
                    <span className="text-sm text-gray-600">
                      Joining: {profileData?.user?.createdAt ? new Date(profileData.user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-[4px] text-sm transition"
                    >
                      Edit
                    </button>
                    <button className="bg-[#B1B1B1] text-white px-4 py-2 rounded-[4px] text-sm cursor-not-allowed flex items-center gap-[4px]">
                      <img src={deactivate} alt="Deactivate" className="w-4 h-4" />
                      Deactivate
                    </button>
                    <button className="bg-[#ED3A3A] text-white px-4 py-2 rounded-[4px] text-sm transition flex items-center justify-center gap-[4px]">
                      <RiDeleteBin6Fill /> Delete
                    </button>
                  </div>

                  {/* responsive 3 dot icon */}
                  <div ref={dropdownRef} className="relative xl:hidden ml-auto">
                    <button
                      onClick={() => setOpen(!open)}
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <BsThreeDotsVertical size={20} />
                    </button>

                    {open && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                        {/* Action Buttons */}
                        <button
                          onClick={() => {
                            setIsAssignModalOpen(true);
                            setOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2">
                          <img src={deactivate} alt="Deactivate" className="w-4 h-4 opacity-70" /> Deactivate
                        </button>
                        <button className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                          <RiDeleteBin6Fill className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {profileButton === "Profile" ? (
                  <ModeratorProfileComponent
                    profileData={profileData}
                    onEditClick={() => setIsAssignModalOpen(true)}
                  />
                ) : profileButton === "batchs" ? (
                  <ModeratorBatchesComponent
                    profileData={profileData}
                    onEditClick={() => setIsAssignModalOpen(true)}
                  />
                ) : profileButton === "records" ? (
                  <ModeratorRecordComponent
                    profileData={profileData}
                    onEditClick={() => setIsAssignModalOpen(true)}
                  />
                ) : null}

                <AssignModeratorModal
                  isOpen={isAssignModalOpen}
                  onClose={() => setIsAssignModalOpen(false)}
                  onSave={handleAssignModalSave}
                  assignedFeatures={profileData?.user?.assignedFeatures || []}
                  initialRole={profileData?.user?.role || ''}
                />
              </div>
            </div>
          </main>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `,
          }}
        />
      </div>
    </div>
  );
};

export default ModeratorDetails;