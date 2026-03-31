import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState } from "react";
import { FaIdCard } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

function ModeratorProfile({ profileData }) {
  const user = profileData?.user || {};

  return (
    <div className="w-full rounded-[10px] border border-[#ECECEC] p-[14px]">
      <div className="w-full mx-auto">

        {/* Header */}
        <div className="w-full flex justify-between items-center">
          <h3 className="text-[18px] font-medium">Profile Details</h3>

          <div className="flex gap-[12px] items-center">
            <button className="w-[140px] h-[40px] bg-[#A7A7A7] rounded-[4px] text-white text-[13px] lg:text-sm lg:w-[177px] hidden min-[640px]:block">
              Change Password
            </button>

            {/* Edit button for screens larger than 700px */}
            <GradiantButton className="hidden sm:flex w-[90px] h-[40px] rounded-[4px] text-sm">
              Edit
            </GradiantButton>

            {/* Gradient icon for smaller screens */}
            <GradiantButton className="flex sm:hidden w-[40px] h-[40px] justify-center items-center rounded-[8px] ">
              <FaEdit className="text-white w-4" />
            </GradiantButton>
          </div>
        </div>

        {/* Flex Form */}
        <div className="w-full mt-[20px] flex flex-wrap gap-[20px]">

          {/* First Name */}
          <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-1 lg:order-1">
            <label className="font-medium text-[14px]">First name</label>
            <input
              type="text"
              placeholder="Enter first name"
              defaultValue={user.firstname || user.username || ""}
              className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-5 lg:order-2">
            <label className="font-medium text-[14px]">Email</label>
            <input
              type="text"
              placeholder="Enter email"
              defaultValue={user.email || ""}
              className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
            />
          </div>

          {/* Number */}
          <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-2 lg:order-3">
            <label className="font-medium text-[14px]">Number</label>
            <div className="flex items-center h-[48px] px-3 gap-2 rounded-md border border-[#E4E4E7]">
              <select className="outline-none bg-transparent">
                <option>🇺🇸 +1</option>
                <option>🇵🇰 +92</option>
                <option>🇮🇳 +91</option>
              </select>
              <input
                type="tel"
                placeholder="Phone number"
                defaultValue={user.phone || ""}
                className="outline-none w-full"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-6 lg:order-4">
            <label className="font-medium text-[14px]">Gender</label>
            <select className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none" defaultValue={user.gender || "Choose"}>
              <option>Choose</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          {/* CNIC */}
          <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-3 lg:order-5">
            <label className="font-medium text-[14px]">CNIC</label>
            <input
              type="text"
              placeholder="23456-2389-1"
              className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-7 lg:order-6">
            <label className="font-medium text-[14px]">Address</label>
            <input
              type="text"
              defaultValue={user.permanentAddress || user.city || ""}
              className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
            />
          </div>

          {/* Nationality */}
          <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-4 lg:order-7">
            <label className="font-medium text-[14px]">Nationality</label>
            <input
              type="text"
              placeholder="Enter Your Nationality"
              defaultValue={user.nationality || ""}
              className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
            />
          </div>

          {/* Higher Education */}
          <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-8 lg:order-8">
            <label className="font-medium text-[14px]">
              Higher Education
            </label>
            <input
              type="text"
              placeholder="Enter Your Education"
              defaultValue={user.educationQualification || ""}
              className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
            />
          </div>

          {/* Front CNIC */}
          <div className="w-full lg:w-[48%] order-9 lg:order-9">
            <p className="mb-2 text-[14px] font-medium">Front CNIC</p>
            <div className="w-full h-[125px] rounded-[10px] border border-[#E4E4E7] flex justify-center items-center">
              <div className="flex flex-col items-center gap-2">
                <FaIdCard className="w-[46px] h-[30px] text-[#A7A7A7]" />
                <p className="text-[10px] text-[#666666]">
                  Upload Front CNIC
                </p>
                <label className="bg-[#265CEB] rounded-[4px] text-white w-[60px] h-[24px] text-[10px] flex items-center justify-center cursor-pointer">
                  Browse
                  <input type="file" className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Back CNIC */}
          <div className="w-full lg:w-[48%] order-10 lg:order-10">
            <p className="mb-2 text-[14px] font-medium">Back CNIC</p>
            <div className="w-full h-[125px] rounded-[10px] border border-[#E4E4E7] flex justify-center items-center">
              <div className="flex flex-col items-center gap-2">
                <FaIdCard className="w-[46px] h-[30px] text-[#A7A7A7]" />
                <p className="text-[10px] text-[#666666]">
                  Upload Back CNIC
                </p>
                <label className="bg-[#265CEB] rounded-[4px] text-white w-[60px] h-[24px] text-[10px] flex items-center justify-center cursor-pointer">
                  Browse
                  <input type="file" className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-[10px]">
        <GradiantButton className="w-[90px] h-[40px] rounded-[4px] text-sm">
          Save
        </GradiantButton>
      </div>
    </div>
  );
}

export default ModeratorProfile;