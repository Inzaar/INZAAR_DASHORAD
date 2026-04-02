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

      <div className="w-full lg:w-full h-auto lg:h-[301px] rounded-[8px] pt-[11px] pr-[4px] pb-[11px] pl-[14px] overflow-y-auto">
        <div className="w-full flex flex-col gap-[6px]">
          {/* Role */}
          <h6 className="text-[12px]">Role:</h6>
          <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px] capitalize">
            {user.role || "Junior Moderator"}
          </div>

          {/* System Roll / Assigned Features */}
          <div className="w-full flex flex-col gap-[6px] mt-1">
            <h6 className="text-[12px]">System Roll:</h6>
            {user.assignedFeatures && user.assignedFeatures.length > 0 ? (
              user.assignedFeatures.map((feature, idx) => (
                <div key={idx} className="w-full min-h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px]">
                  <span className="text-[#265CEB] truncate">{feature}</span>
                </div>
              ))
            ) : (
              <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px] text-gray-400 italic text-sm">
                No active features
              </div>
            )}
          </div>

          {/* Managing Courses — from assignedBatches (scrollable) */}
          <div className="w-full flex flex-col gap-[4px] mt-1">
            <h6 className="text-[12px]">Managing Courses:</h6>
            <div className="w-full max-h-[120px] overflow-y-auto flex flex-col gap-[4px] pr-1">
              {batchCoursePairs.length > 0 ? (
                batchCoursePairs.map((pair, idx) => (
                  <div key={idx} className="w-full min-h-[32px] bg-[#EFF2FF] rounded-[6px] text-[#1A1A1A] flex items-center justify-between px-[10px] shrink-0">
                    <span className="text-[#265CEB] font-medium text-sm truncate">📘 {pair.courseName}</span>
                    <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded ml-2 whitespace-nowrap">{pair.batchName}</span>
                  </div>
                ))
              ) : (
                <div className="w-full h-[32px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] text-gray-400 italic text-sm">
                  No courses assigned
                </div>
              )}
            </div>
          </div>

          {/* Employment Type */}
          <div className="w-full mt-1">
            <h6 className="text-[12px]">Employment Type</h6>
            <select className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A]" defaultValue={user.employmentType || "Full-time"}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
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