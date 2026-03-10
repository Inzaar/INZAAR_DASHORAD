import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { FaIdCard } from "react-icons/fa";

function ModeratorProfile() {
  return (
    <div className="w-[1120px] h-[687px] rounded-[10px] border border-[#ECECEC] p-[14px]">
      <div className="w-[1092px] h-[639px] mx-auto">
        {/* Header */}
        <div className="w-full h-[40px] flex justify-between items-center">
          <h3 className="text-[18px] font-medium">Profile Details</h3>

          <div className="w-[279px] h-[40px] flex gap-[12px]">
            <button className="w-[177px] h-[40px] bg-[#A7A7A7] rounded-[4px] text-white text-sm">
              Change Password
            </button>
            <GradiantButton className="w-[90px] h-[40px] rounded-[4px] text-sm">
              Edit
            </GradiantButton>
          </div>
        </div>

        <div className="w-full h-[547px] flex mt-[20px] gap-[20px]">
          {/* Left Side */}
          <div className="w-[546px] h-full flex flex-col gap-[18px]">
            {/* First Name */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-medium text-[14px]">First name</label>
              <input
                type="text"
                placeholder="Enter first name"
                className="w-[536px] h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Number */}
            <div className="flex flex-col gap-[8px]">
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
                  className="outline-none w-full"
                />
              </div>
            </div>

            {/* CNIC */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-medium text-[14px]">CNIC</label>
              <input
                type="text"
                placeholder="23456-2389-1"
                className="w-[536px] h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Nationality */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-medium text-[14px]">Nationality</label>
              <input
                type="text"
                placeholder="Enter Your Nationality"
                className="w-[536px] h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Front CNIC */}
            <div>
              <p className="mb-2 text-[14px] font-medium">Front CNIC</p>
              <div className="w-[536px] h-[125px] rounded-[10px] border border-[#E4E4E7] flex justify-center items-center">
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
          </div>

          {/* Right Side */}
          <div className="w-[546px] h-full flex flex-col gap-[18px]">
            {/* Email */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-medium text-[14px]">Email</label>
              <input
                type="text"
                placeholder="Enter email"
                className="w-[536px] h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-medium text-[14px]">Gender</label>
              <select className="w-[536px] h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none">
                <option>Choose</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-medium text-[14px]">Address</label>
              <input
                type="text"
                className="w-[536px] h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Higher Education */}
            <div className="flex flex-col gap-[8px]">
              <label className="font-medium text-[14px]">
                Higher Education
              </label>
              <input
                type="text"
                placeholder="Enter Your Education"
                className="w-[536px] h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Back CNIC */}
            <div>
              <p className="mb-2 text-[14px] font-medium">Back CNIC</p>
              <div className="w-[536px] h-[125px] rounded-[10px] border border-[#E4E4E7] flex justify-center items-center">
                <div className="flex flex-col items-center gap-2">
                  <FaIdCard className="w-[46px] h-[30px] text-[#A7A7A7]" />
                  <p className="text-[10px] text-[#666666]">Upload Back CNIC</p>
                  <label className="bg-[#265CEB] rounded-[4px] text-white w-[60px] h-[24px] text-[10px] flex items-center justify-center cursor-pointer">
                    Browse
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModeratorProfile;
