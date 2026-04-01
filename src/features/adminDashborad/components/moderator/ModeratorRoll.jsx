import React from "react";
import Profileimg from "@/assets/images/course.png";
// import moderatorroll from "../../../../assets/icons/moderatorroll.jpg";
function ModeratorRoll({ profileData, type = 'moderator' }) {
  const user = profileData?.user || {};
  const isStudent = type === 'student';

  return (
    <div className="w-full lg:w-[50%] h-auto lg:h-[301px] sm:w-full border rounded-[8px] pr-[10px] pl-[20px] flex lg:flex-row max-[620px]:flex-col bg-white">
      <div className="w-full lg:w-[230px] h-auto lg:h-[301px] pt-[10px] pb-[10px] gap-[8px] flex flex-col items-center">
        <h3 className="text-center text-[12px] font-medium text-gray-500 uppercase tracking-wider">PROFILE IMAGE</h3>
        <img src={Profileimg} className="w-full h-[236px] object-cover rounded-[10px] border border-gray-100" />
        <label className="text-blue-600 text-sm font-semibold cursor-pointer text-center block mt-[2px] hover:underline transition-all">
          Choose Profile Image
          <input type="file" className="hidden" />
        </label>
      </div>

      <div className="flex-1 h-auto lg:h-[301px] rounded-[8px] pt-4 pr-[4px] pb-[11px] pl-[14px]">
        <div className="w-full h-full flex flex-col gap-3">
          <div>
            <h6 className="text-[12px] font-medium text-gray-400 uppercase mb-1 tracking-wider">
              {isStudent ? "Full Name" : "Role"}
            </h6>
            <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px] text-sm font-medium">
              {isStudent ? (user.firstname || user.username || "Muhammad Zain") : (user.role || "Junior Moderator")}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <h6 className="text-[12px] font-medium text-gray-400 uppercase mb-1 tracking-wider">
              {isStudent ? "Enroll Courses" : "System Roll"}
            </h6>
            <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[150px]">
              {isStudent ? (
                <>
                  <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px] flex-shrink-0">
                    <a href="#" className="text-[#3758EE] text-[13px] font-medium underline underline-offset-4 decoration-1 decoration-blue-200 hover:decoration-blue-500 transition-all">
                      Akhrat Kay Dalail ( Batch - 10 )
                    </a>
                  </div>
                  <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px] flex-shrink-0">
                    <a href="#" className="text-[#3758EE] text-[13px] font-medium underline underline-offset-4 decoration-1 decoration-blue-200 hover:decoration-blue-500 transition-all">
                      Akhrat Kay Dalail ( Batch - 10 )
                    </a>
                  </div>
                  <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px] flex-shrink-0">
                    <a href="#" className="text-[#3758EE] text-[13px] font-medium underline underline-offset-4 decoration-1 decoration-blue-200 hover:decoration-blue-500 transition-all">
                      Akhrat Kay Dalail ( Batch - 10 )
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] flex-shrink-0">
                    <a href="#" className="text-[#265CEB] text-sm underline decoration-[#265CEB]">Manage Batch-10</a>
                  </div>
                  <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] flex-shrink-0">
                    <a href="#" className="text-[#265CEB] text-sm underline decoration-[#265CEB]">Manage Batch-14</a>
                  </div>
                  <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] flex-shrink-0">
                    <a href="#" className="text-[#265CEB] text-sm underline decoration-[#265CEB]">Manage Batch-12</a>
                  </div>
                </>
              )}
            </div>
          </div>

          {!isStudent && (
            <div className="mt-auto">
              <h6 className="text-[12px] font-medium text-gray-400 uppercase mb-1 tracking-wider">Employment Type</h6>
              <select className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] text-sm font-medium outline-none border-none">
                <option>Full-time</option>
                <option>Part-time</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModeratorRoll;