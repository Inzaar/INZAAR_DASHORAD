import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layouts/SideBar";
import Navbar from "@/components/layouts/NavBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getEnrolledCoursesByUserId } from "@/api/course";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { RiDeleteBin6Fill } from "react-icons/ri";
import deactivate from "@/assets/images/deactivate.png";
import Profiledetail from "../components/moderator/ModeratorProfile";
import ProfileImage from "../components/moderator/ModeratorRoll";
import SessionActivity from "@/components/shared/SessionActivity";
import ModeratorProfile from "../components/moderator/ModeratorProfile";
import ModeratorRoll from "../components/moderator/ModeratorRoll";

const ModeratorDetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLectureFilter, setSelectedLectureFilter] =
    useState("Select Course");

  const [userCourses, setUserCourses] = useState([]);

  useEffect(() => {
    const fetchUserCourses = async () => {
      const res = await getEnrolledCoursesByUserId();
      console.log(res.data);
      setUserCourses(res.data);
    };
    fetchUserCourses();
  }, []);

  // Extract valid course titles for dropdown
  const lectureOptions = userCourses?.data?.map((c) => c.title) || [];

  // Set default selection when courses load
  useEffect(() => {
    if (lectureOptions.length > 0) {
      setSelectedLectureFilter(lectureOptions[0]);
    }
  }, [userCourses]); // Run when userCourses updates

  // Find the selected course data
  const selectedCourseData = userCourses?.data?.find(
    (course) => course.title === selectedLectureFilter,
  );

  const filteredLectures = selectedCourseData?.lectures || [];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate("/login");
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
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
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <div className="py-4 pr-2">
              <div className="bg-white shadow rounded-lg p-4">
                {/* Top Section */}
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold text-gray-700">
                    Profile
                  </h1>

                  <GradiantButton className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-[4px] text-sm transition">
                    Back to list
                  </GradiantButton>
                </div>

                {/* Bottom Section */}
                <div className="flex justify-between items-center">
                  {/* Tabs */}
                  <div className="flex bg-gray-100 rounded-[4px] overflow-hidden">
                    <button className="px-4 py-2 text-gray-700 text-sm font-medium border-r">
                      Profile
                    </button>

                    <button className="px-4 py-2  bg-white text-gray-600 text-sm hover:bg-gray-200">
                      Batches
                    </button>

                    <button className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-200">
                      Records
                    </button>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Joining: 10/04/2025
                    </span>

                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-[4px] text-sm transition">
                      Edit
                    </button>

                    <button className="bg-[#B1B1B1] text-white px-4 py-2 rounded-[4px] text-sm cursor-not-allowed flex items-center gap-[4px]">
                      <img src={deactivate}></img>
                      Deactivate
                    </button>

                    <button className="bg-[#ED3A3A] text-white px-4 py-2 rounded-[4px] text-sm transition flex items-center justify-center gap-[4px]">
                      <RiDeleteBin6Fill />
                      Delete
                    </button>
                  </div>
                </div>
                {/* check */}
                <div className="mt-[20px] w-full">
                  <div className="flex w-[1120px] h-[301px] gap-[10px]">
                    <ModeratorRoll/>
                    <SessionActivity />
                  </div>
                </div>
                <div className="mt-[12px] w-full">
                  <ModeratorProfile/>
                </div>
              </div>
            </div>
          </main>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `,
          }}
        />
      </div>
    </div>
  );
};

export default ModeratorDetails;
