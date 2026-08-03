import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layouts/SideBar";
import Navbar from "@/components/layouts/NavBar";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserProfileById, deleteUser, restoreUser } from "@/api/user";
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
import { BsChatDotsFill } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";

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
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
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
      const isDeactivated = data.features.length === 0;
      await assignUserRole(id, {
        role: isDeactivated ? "user" : "moderator",
        assignedFeatures: data.features
      });

      if (isDeactivated) {
        toast.success("Moderator given 0 features and reverted to student!");
        navigate('/admin-moderators');
      } else {
        toast.success("Moderator updated successfully!");
        setIsAssignModalOpen(false);
        fetchProfileData(); // Refresh data
      }
    } catch (err) {
      toast.error("Failed to update moderator");
      console.error(err);
    }
  };

  const handleDeactivate = async () => {
    try {
      await assignUserRole(id, {
        role: "user",
        assignedFeatures: []
      });
      toast.success("Moderator deactivated successfully!");
      navigate('/admin-moderators');
    } catch (err) {
      toast.error("Failed to deactivate moderator");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id);
      toast.success("Moderator deleted successfully!");
      fetchProfileData();
    } catch (err) {
      toast.error("Failed to delete moderator");
      console.error(err);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreUser(id);
      toast.success("Moderator restored successfully!");
      fetchProfileData();
    } catch (err) {
      toast.error("Failed to restore moderator");
      console.error(err);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!user) {
    navigate("/login");
  }



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
                      onClick={() => navigate('/admin-moderators')}
                      className="bg-[#A892FF] hover:bg-[#937aff] text-white px-5 py-2 rounded-[4px] text-sm md:mt-0 font-medium shadow-sm"
                    >
                      Back to list
                    </GradiantButton>
                  </div>
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
                    {!profileData?.user?.isDeleted ? (
                      <>
                        <button
                          onClick={() => setIsAssignModalOpen(true)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-[4px] text-sm transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setIsDeactivateModalOpen(true)}
                          className="bg-[#B1B1B1] hover:bg-gray-500 text-white px-4 py-2 rounded-[4px] text-sm transition flex items-center gap-[4px]"
                        >
                          <img src={deactivate} alt="Deactivate" className="w-4 h-4" />
                          Deactivate
                        </button>
                        <button
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="bg-gradient-to-r from-[#FF4E4E] to-[#E52222] hover:opacity-90 text-white px-4 py-2 rounded-[4px] text-sm transition flex items-center justify-center gap-[4px] shadow-sm shadow-red-500/30"
                        >
                          <RiDeleteBin6Fill /> Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsRestoreModalOpen(true)}
                        className="bg-gradient-to-r from-[#FF4E4E] to-[#E52222] hover:opacity-90 text-white px-4 py-2 rounded-[4px] text-sm transition flex items-center justify-center gap-[4px] shadow-sm shadow-red-500/30"
                      >
                        <RiDeleteBin6Fill className="rotate-180" /> Restore
                      </button>
                    )}
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
                        {!profileData?.user?.isDeleted ? (
                          <>
                            <button
                              onClick={() => {
                                setIsAssignModalOpen(true);
                                setOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setIsDeactivateModalOpen(true);
                                setOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2"
                            >
                              <img src={deactivate} alt="Deactivate" className="w-4 h-4 opacity-70" /> Deactivate
                            </button>
                            <button
                              onClick={() => {
                                setIsDeleteModalOpen(true);
                                setOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <RiDeleteBin6Fill className="w-4 h-4" /> Delete
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setIsRestoreModalOpen(true);
                              setOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                          >
                            <RiDeleteBin6Fill className="w-4 h-4 rotate-180" /> Restore
                          </button>
                        )}
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

                {/* Deactivate Confirmation Modal */}
                {isDeactivateModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-sans">
                    <div className="bg-white w-full max-w-[450px] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                      {/* Header */}
                      <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-50 flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#4E6BFF] to-[#8E6BFF] rounded-lg flex items-center justify-center shadow-sm">
                          <img src={deactivate} alt="Deactivate" className="w-5 h-5 brightness-0 invert drop-shadow-sm" />
                        </div>
                        <h2 className="text-[22px] font-bold text-gray-800">Confirm Deactivation</h2>
                      </div>

                      {/* Body */}
                      <div className="px-8 py-6 flex-1 text-gray-600 text-sm">
                        Are you sure you want to deactivate <span className="font-bold">{profileData?.user?.firstname} {profileData?.user?.lastname}</span>?
                        This action will remove all their assigned features and change their role back to a standard student.
                      </div>

                      {/* Footer */}
                      <div className="px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50 flex-shrink-0 bg-white">
                        <button
                          onClick={() => setIsDeactivateModalOpen(false)}
                          className="w-full sm:w-auto px-10 py-3 bg-[#F5F5F5] text-gray-600 rounded-[12px] font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
                        >
                          No, Cancel
                        </button>
                        <button
                          onClick={() => {
                            setIsDeactivateModalOpen(false);
                            handleDeactivate();
                          }}
                          className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-[#4E6BFF] to-[#8E6BFF] text-white rounded-[12px] font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all active:scale-95"
                        >
                          Yes, Deactivate
                      </button>
                    </div>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-sans">
                    <div className="bg-white w-full max-w-[450px] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-50 flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shadow-sm">
                          <RiDeleteBin6Fill className="text-red-600 w-5 h-5" />
                        </div>
                        <h2 className="text-[22px] font-bold text-gray-800">Confirm Deletion</h2>
                      </div>
                      <div className="px-8 py-6 flex-1 text-gray-600 text-sm">
                        Are you sure you want to delete <span className="font-bold">{profileData?.user?.firstname} {profileData?.user?.lastname}</span>?
                        This will soften their profile from general lists.
                      </div>
                      <div className="px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50 flex-shrink-0 bg-white">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto px-10 py-3 bg-[#F5F5F5] text-gray-600 rounded-[12px] font-bold text-sm hover:bg-gray-200 transition-all active:scale-95">
                          No, Cancel
                        </button>
                        <button onClick={() => { setIsDeleteModalOpen(false); handleDelete(); }} className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-[#FF4E4E] to-[#E52222] text-white rounded-[12px] font-bold text-sm shadow-lg shadow-red-500/30 hover:opacity-90 transition-all active:scale-95">
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Restore Confirmation Modal */}
                {isRestoreModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-sans">
                    <div className="bg-white w-full max-w-[450px] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-50 flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                          <RiDeleteBin6Fill className="text-blue-600 w-5 h-5 rotate-180" />
                        </div>
                        <h2 className="text-[22px] font-bold text-gray-800">Confirm Restoration</h2>
                      </div>
                      <div className="px-8 py-6 flex-1 text-gray-600 text-sm">
                        Are you sure you want to restore <span className="font-bold">{profileData?.user?.firstname} {profileData?.user?.lastname}</span>?
                        This will make the user active and visible in the main lists again.
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