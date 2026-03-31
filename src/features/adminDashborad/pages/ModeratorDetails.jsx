import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layouts/SideBar";
import Navbar from "@/components/layouts/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserProfileById } from "@/api/user";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { RiDeleteBin6Fill } from "react-icons/ri";
import deactivate from "@/assets/images/deactivate.png";
import SessionActivity from "@/components/shared/SessionActivity";
import ModeratorProfileComponent from "../components/moderator/ModeratorProfileComponent";
import { BsThreeDotsVertical } from "react-icons/bs";
import ModeratorBatchesComponent from "../components/moderator/ModeratorBatchesComponent";

const ModeratorDetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileButton, setProfileButton] = useState('Profile');
const dropdownRef=useRef(null);
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
          // setProfileData(res.data);
          setProfileData({ user: res.data });
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

    // if (id) {
    //   fetchProfileData();
    // }
  }, [id]);

  const handleprofilebutton = (e) => {
    setProfileButton(e.target.value);
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
                <div className=" flex sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h1 className=" text-xl font-semibold text-gray-700">
                    Profile
                  </h1>
                  <GradiantButton className=" bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-[4px] text-sm mt-2 sm:mt-0">
                    Back to list
                  </GradiantButton>
                </div>

                <div className="flex sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center justify-between flex-wrap bg-gray-100 rounded-[4px] overflow-hidden mb-4 sm:mb-0">

                    <button
                      className="px-4 py-2 text-gray-700 text-sm font-medium border-r 
                 max-[430px]:px-2 max-[430px]:py-1 max-[293px]:px-1 max-[293px]:py-1 max-[430px]:text-xs"
                      onClick={handleprofilebutton}
                      value={"Profile"}
                    >
                      Profile
                    </button>

                    <button
                      className="px-4 py-2 bg-white text-gray-600 text-sm hover:bg-gray-200 
                 max-[430px]:px-2 max-[430px]:py-1 max-[293px]:px-1 max-[293px]:py-1 max-[430px]:text-xs"
                      onClick={handleprofilebutton}
                      value={"batchs"}
                    >
                      Batches
                    </button>

                    <button
                      className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-200 
                 max-[430px]:px-2 max-[430px]:py-1 max-[293px]:px-1 max-[293px]:py-1 max-[430px]:text-xs"
                      onClick={handleprofilebutton}
                      value={"records"}
                    >
                      Records
                    </button>

                  </div>
                  {/* responsive */}
                  <div className="hidden max-[900px]:hidden max-[1060px]:hidden md:flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-600 max-[900px]:hidden max-[1060px]:hidden ">
                      Joining: {profileData?.user?.createdAt ? new Date(profileData.user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <button className="max-[900px]:hidden max-[1060px]:hidden  bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-[4px] text-sm transition">
                      Edit
                    </button>
                    <button className="max-[900px]:hidden max-[1060px]:hidden  bg-[#B1B1B1] text-white px-4 py-2 rounded-[4px] text-sm cursor-not-allowed flex items-center gap-[4px]">
                      <img src={deactivate} alt="Deactivate" />
                      Deactivate
                    </button>
                    <button className="max-[900px]:hidden max-[1060px]:hidden bg-[#ED3A3A] text-white px-4 py-2 rounded-[4px] text-sm transition flex items-center justify-center gap-[4px]">
                      <RiDeleteBin6Fill /> Delete
                    </button>
                  </div>

                  <div ref={dropdownRef} className="relative max-[900px]:block max-[1060px]:block hidden ml-2">
                    
                    <button
                      onClick={() => setOpen(!open)}
                      className="p-2 rounded-md hover:bg-gray-200"
                    >
                      <BsThreeDotsVertical size={20} />
                    </button>

                    {open && (
                      <div className="absolute right-0 w-40 bg-white border rounded shadow-lg z-50">
                        <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                          Edit
                        </button>

                        <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                          Deactivate
                        </button>

                        <button className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center gap-2">
                          <RiDeleteBin6Fill /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* responsive 3 dot icon */}

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