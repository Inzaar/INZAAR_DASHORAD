import React from "react";
import Profileimg from "@/assets/images/course.png";
// import moderatorroll from "../../../../assets/icons/moderatorroll.jpg";
function ModeratorRoll() {
  return (
    <div className="w-full lg:w-[50%] h-auto lg:h-[301px] sm:w-full border rounded-[8px] pr-[10px] pl-[20px] flex lg:flex-row  bg-white">
      <div className="w-full lg:w-[230px] h-auto lg:h-[301px] pt-[10px] pb-[10px] gap-[8px] flex flex-col items-center">
        <h3 className="text-center text-[12px]">PROFILE IMAGE</h3>
        <img src={Profileimg} className="w-[230px] h-[236px]  object-cover rounded-[10px]" />
        <label className="text-blue-600 text-sm cursor-pointer text-center block mt-[2px]">
          Choose Profile Image
          <input type="file" className="hidden" />
        </label>
      </div>

      <div className="w-full lg:w-full h-auto lg:h-[301px] rounded-[8px] pt-[11px] pr-[4px] pb-[11px] pl-[14px] ">
        <div className="w-full lg:w-full h-auto lg:h-[279px] ">
          <h6 className="text-[12px]">Roll:</h6>
          <div className="w-full lg:w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px]">
            Junior Moderator
          </div>
          <div className="w-full h-auto lg:h-[141px] flex flex-col gap-[8px] mt-2">
            <h6 className="text-[12px]">System Roll:</h6>
            <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px]">
              <a href="#" className="text-[#265CEB] underline decoration-[#265CEB]">Manage Batch-10</a>
            </div>
            <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px]">
              <a href="#" className="text-[#265CEB] underline decoration-[#265CEB]">Manage Batch-14</a>
            </div>
            <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px]">
              <a href="#" className="text-[#265CEB] underline decoration-[#265CEB]">Manage Batch-12</a>
            </div>
          </div>
          <div className="w-full h-auto lg:h-[57px] mt-2">
            <h6 className="text-[12px]">Employment Type</h6>
            <select className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A]">
              <option>Full-time</option>
              <option>Part-time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModeratorRoll;