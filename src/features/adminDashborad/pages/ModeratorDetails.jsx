import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layouts/SideBar";
import Navbar from "@/components/layouts/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserProfileById, deleteUser, deactivateUser } from "@/api/user";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { RiDeleteBin6Fill } from "react-icons/ri";
import deactivateImg from "@/assets/images/deactivate.png";
import ModeratorProfileComponent from "../components/moderator/ModeratorProfileComponent";
import { BsThreeDotsVertical } from "react-icons/bs";
import ModeratorBatchesComponent from "../components/moderator/ModeratorBatchesComponent";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import toast from "react-hot-toast";

const ModeratorDetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileButton, setProfileButton] = useState('Profile');
  const dropdownRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: "", loading: false });

  // Tab config
  const tabs = [
    { label: "Profile", value: "Profile" },
    { label: "Batches", value: "batchs" },
    { label: "Records", value: "records" },
  ];

  // Outside click close
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
          setProfileData({ user: res.data });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfileData();
  }, [id]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // ─── Action Handlers ───────────────────────────────
  const handleEdit = () => {
    setProfileButton("Profile");
    toast.success("You can now edit the profile fields below and click Save.");
  };

  const openDeactivateDialog = () => {
    const currentStatus = profileData?.user?.isActive;
    setConfirmDialog({
      isOpen: true,
      type: "deactivate",
      loading: false,
      title: currentStatus ? "Deactivate Moderator" : "Activate Moderator",
      message: currentStatus
        ? `Are you sure you want to deactivate ${profileData?.user?.firstname || "this moderator"}? They will lose access to all assigned batches and features.`
        : `Are you sure you want to reactivate ${profileData?.user?.firstname || "this moderator"}? They will regain access to their assigned batches.`,
      dialogType: currentStatus ? "warning" : "info",
      confirmText: currentStatus ? "Yes, Deactivate" : "Yes, Activate",
    });
  };

  const openDeleteDialog = () => {
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      loading: false,
      title: "Delete Moderator",
      message: `This will permanently remove ${profileData?.user?.firstname || "this moderator"} and all associated data. This action cannot be undone.`,
      dialogType: "danger",
      confirmText: "Yes, Delete",
    });
  };

  const closeDialog = () => setConfirmDialog({ isOpen: false, type: "", loading: false });

  const handleConfirmAction = async () => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));

    if (confirmDialog.type === "deactivate") {
      const currentStatus = profileData?.user?.isActive;
      const toastId = toast.loading(`${currentStatus ? "Deactivating" : "Activating"} moderator...`);
      try {
        await deactivateUser(id, !currentStatus);
        const res = await getUserProfileById(id);
        if (res?.data) setProfileData({ user: res.data });
        toast.success(`Moderator ${currentStatus ? "deactivated" : "activated"} successfully!`, { id: toastId });
      } catch (error) {
        console.error("Deactivate error:", error);
        toast.error(error?.response?.data?.message || "Action failed", { id: toastId });
      }
    }

    if (confirmDialog.type === "delete") {
      const toastId = toast.loading("Deleting moderator...");
      try {
        await deleteUser(id);
        toast.success("Moderator deleted successfully!", { id: toastId });
        closeDialog();
        navigate("/admin-moderators");
        return;
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(error?.response?.data?.message || "Failed to delete moderator", { id: toastId });
      }
    }

    closeDialog();
  };

  if (!user) {
    navigate("/login");
  }

  const isActive = profileData?.user?.isActive;

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

          <main
            className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <div className="py-4 pr-2">
              <div className="bg-white shadow rounded-lg p-4">
                <div className=" flex sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h1 className=" text-xl font-semibold text-gray-700">
                    Profile
                  </h1>
                  <GradiantButton className=" bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-[4px] text-sm mt-2 sm:mt-0">
                    Back to list
                  </GradiantButton>
                </div>

                <div className="flex sm:flex-row justify-between items-start sm:items-center">
                  {/* Tab buttons with active styling */}
                  <div className="flex items-center flex-wrap bg-gray-100 rounded-[4px] overflow-hidden mb-4 sm:mb-0">
                    {tabs.map((tab) => (
                      <button
                        key={tab.value}
                        className={`px-4 py-2 text-sm font-medium transition-all duration-200
                          max-[430px]:px-2 max-[430px]:py-1 max-[293px]:px-1 max-[293px]:py-1 max-[430px]:text-xs
                          ${profileButton === tab.value
                            ? "bg-white text-gray-800 shadow-sm"
                            : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                          }`}
                        onClick={() => setProfileButton(tab.value)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Desktop action buttons */}
                  <div className="hidden min-[1060px]:flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Joining: {profileData?.user?.createdAt ? new Date(profileData.user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <button
                      onClick={handleEdit}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-[4px] text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={openDeactivateDialog}
                      className={`px-4 py-2 rounded-[4px] text-sm transition flex items-center gap-[4px] ${isActive
                        ? "bg-[#B1B1B1] hover:bg-[#999] text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                    >
                      <img src={deactivateImg} alt="" className="w-4 h-4" />
                      {isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={openDeleteDialog}
                      className="bg-[#ED3A3A] hover:bg-red-600 text-white px-4 py-2 rounded-[4px] text-sm transition flex items-center justify-center gap-[4px]"
                    >
                      <RiDeleteBin6Fill /> Delete
                    </button>
                  </div>

                  {/* Mobile dropdown */}
                  <div ref={dropdownRef} className="relative min-[1060px]:hidden ml-2">
                    <button
                      onClick={() => setOpen(!open)}
                      className="p-2 rounded-md hover:bg-gray-200"
                    >
                      <BsThreeDotsVertical size={20} />
                    </button>

                    {open && (
                      <div className="absolute right-0 w-44 bg-white border rounded shadow-lg z-50">
                        <button
                          onClick={() => { handleEdit(); setOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { openDeactivateDialog(); setOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => { openDeleteDialog(); setOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <RiDeleteBin6Fill /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {profileButton === "Profile" ? (
                  <ModeratorProfileComponent profileData={profileData} />
                ) : profileButton === "batchs" ? (
                  <ModeratorBatchesComponent profileData={profileData} />
                ) : profileButton === "records" ? (
                  <div>records</div>
                ) : null}
              </div>
            </div>
          </main>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={closeDialog}
          onConfirm={handleConfirmAction}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.dialogType}
          confirmText={confirmDialog.confirmText}
          loading={confirmDialog.loading}
        />

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