import React from "react";
import Profileimg from "@/assets/images/course.png";
// import moderatorroll from "../../../../assets/icons/moderatorroll.jpg";
function ModeratorRoll({ profileData, type = 'moderator' }) {
  const user = profileData?.user || {};
  const isStudent = type === 'student';

  return (
    <div className="w-full lg:w-[50%] h-auto lg:h-[301px] border rounded-[8px] p-4 lg:p-0 lg:py-2 lg:px-4 flex flex-col lg:flex-row gap-4 bg-white overflow-hidden">
      
      {/* Left Column: Image */}
      <div className="w-full sm:w-[230px] mx-auto lg:w-[180px] xl:w-[230px] h-auto lg:h-full py-[10px] flex flex-col items-center justify-between shrink-0">
        <h3 className="text-center text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-1">PROFILE IMAGE</h3>
        <div className="w-full flex-1 flex flex-col justify-center py-2">
            <img src={Profileimg} className="w-full h-[200px] lg:h-[180px] xl:h-[210px] object-cover rounded-[10px] border border-gray-100" />
        </div>
        <label className="text-blue-600 text-[13px] font-semibold cursor-pointer text-center block mt-1 hover:underline transition-all whitespace-nowrap">
          Choose Profile Image
          <input type="file" className="hidden" />
        </label>
      </div>

      {/* Right Column: Data */}
      <div className="flex-1 h-auto lg:h-full rounded-[8px] lg:py-2 flex flex-col gap-3 min-w-0">
        <div className="w-full min-w-0">
          <h6 className="text-[12px] font-medium text-gray-400 uppercase mb-1 tracking-wider">
            {isStudent ? "Full Name" : "Role"}
          </h6>
          <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-3 text-sm font-medium truncate">
            {isStudent ? (user.firstname || user.username || "Muhammad Zain") : (user.role || "Junior Moderator")}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <h6 className="text-[12px] font-medium text-gray-400 uppercase mb-1 tracking-wider">
            {isStudent ? "Enroll Courses" : "System Roll"}
          </h6>
          <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar pb-1">
            {isStudent ? (
              <>
                <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-3 flex-shrink-0 min-w-0">
                  <a href="#" className="text-[#3758EE] text-[13px] font-medium underline underline-offset-4 decoration-1 decoration-blue-200 hover:decoration-blue-500 transition-all truncate w-full">
                    Akhrat Kay Dalail ( Batch - 10 )
                  </a>
                </div>
                <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-3 flex-shrink-0 min-w-0">
                  <a href="#" className="text-[#3758EE] text-[13px] font-medium underline underline-offset-4 decoration-1 decoration-blue-200 hover:decoration-blue-500 transition-all truncate w-full">
                    Akhrat Kay Dalail ( Batch - 10 )
                  </a>
                </div>
                <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-3 flex-shrink-0 min-w-0">
                  <a href="#" className="text-[#3758EE] text-[13px] font-medium underline underline-offset-4 decoration-1 decoration-blue-200 hover:decoration-blue-500 transition-all truncate w-full">
                    Akhrat Kay Dalail ( Batch - 10 )
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] flex-shrink-0 min-w-0">
                  <a href="#" className="text-[#265CEB] text-sm underline decoration-[#265CEB] truncate w-full">Manage Batch-10</a>
                </div>
                <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] flex-shrink-0 min-w-0">
                  <a href="#" className="text-[#265CEB] text-sm underline decoration-[#265CEB] truncate w-full">Manage Batch-14</a>
                </div>
                <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] flex-shrink-0 min-w-0">
                  <a href="#" className="text-[#265CEB] text-sm underline decoration-[#265CEB] truncate w-full">Manage Batch-12</a>
                </div>
              </>
            )}
          </div>
        </div>

        {!isStudent && (
          <div className="mt-auto shrink-0">
            <h6 className="text-[12px] font-medium text-gray-400 uppercase mb-1 tracking-wider">Employment Type</h6>
            <select className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] text-sm font-medium outline-none border-none">
              <option>Full-time</option>
              <option>Part-time</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModeratorRoll;