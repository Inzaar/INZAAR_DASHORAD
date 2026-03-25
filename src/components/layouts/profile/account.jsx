// import profile from "../../../assets/images/profile.png";
import { MdUploadFile } from "react-icons/md";
function Account() {
    return (
        <div className="">
            <div className="w-full rounded-[12px] p-[24px] gap-[24px] bg-[#FFFFFF] flex flex-col gap-5">
                <div className="w-full flex flex-col gap-5 opacity-[1px] ">
                    {/* firstname */}
                    <div className="w-full gap-[16px] opacity-[1px] flex flex-col min-[600px]:flex-row">
                        <div className="w-full min-[800px]:w-[50%] h-[76px] gap-[8px] flex flex-col">
                            <label className="font-medium font-[16px] leading-none tracking-normal">First name</label>
                            <input type="text" placeholder="Enter first name" className="w-full h-[52px] rounded-md opacity-100 pt-4 pb-4 px-3 gap-1 border sm:w-full" />
                        </div>
                        {/* lastname */}
                        <div className="w-full min-[800px]:w-[50%] h-[76px] gap-[8px] flex flex-col">
                            <label className="font-medium font-[16px] leading-none tracking-normal">Last name</label>
                            <input type="text" placeholder="Enter last name" className="w-full h-[52px] rounded-md opacity-100 pt-4 pb-4 px-3 gap-1 border" />
                        </div>
                    </div>
                    {/* email */}
                    <div className="w-full gap-2 opacity-[1px] flex flex-col">
                        <label className="font-medium font-[16px] leading-none tracking-normal text-base text-[#18181B]">Email*</label>
                        <input type="email" placeholder="Enter email address" className="w-full h-[52px] rounded-md rotate-0 opacity-100 pt-4 pb-4 px-3 gap-1 border border-[#E4E4E7]" />
                    </div>
                    {/* password */}
                    <div className="w-full gap-[16px] opacity-[1px] flex flex-col min-[1218px]:flex-row ">
                        <div className="w-full min-[1218px]:w-[50%] h-[76px] opacity-[1px] gap-[8px] flex flex-col">
                            <label className="font-medium font-[16px] leading-none tracking-normal">Password*</label>
                            <input type="password" className=" h-[52px] rotate-0 opacity-100 gap-2 rounded pt-4 pb-4 px-3 gap-1 border" />
                        </div>

                        {/* whatsapp number */}
                        <div className="w-full min-[1218px]:w-[50%] h-[78px] opacity-[1px] gap-[8px]">
                            <label className="font-medium font-[16px] leading-none tracking-normal">WhatsApp number*</label>
                            <div className="flex align-center h-[54px] rotate-0 opacity-100 gap-2 rounded pt-4 pb-4 px-3 gap-1 border">
                                <select className=" outline-none">
                                    <option>🇺🇸  +1</option>
                                    <option>🇵🇰 +92</option>
                                    <option>🇮🇳 +91</option>
                                </select>
                                <input
                                    type="tel"
                                    placeholder="Phone number"
                                    className="outline-none w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full gap-[8px] opacity-[1px] flex flex-col">
                        <label className="font-medium font-[16px] leading-none tracking-normal text-base text-[#18181B]">City town</label>
                        <input type="text" placeholder="Enter your city" className="w-full h-[52px] rounded-md rotate-0 opacity-100 pt-4 pb-4 px-3 gap-1 border border-[#E4E4E7]" />
                    </div>

                </div>
                {/* Upload Box */}
                <div className="w-full gap-[8px] opacity-[1px] flex flex-col min-[1218px]:flex-row justify-between items-center min-[1218px]:items-start">

                    <div className="w-[99px] h-[108px] gap-[12px] opacity-[1px] flex flex-col gap-5 items-center">
                        <label htmlFor="" className="text-[14px] leading-[20px] tracking-[-0.6%]">Change Profile</label>
                        <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-400 ">
                            {/* <img
                                src={profile}
                                alt="profile"
                                className="w-full h-full object-cover scale-x-[-1]"
                            /> */}
                        </div>
                    </div>

                    <label className="w-full min-[1218px]:w-[80%] h-[170px] gap-[10px] border-2 border-dashed rounded-[40px] p-6 text-center cursor-pointer hover:border-blue-400 transition">
                        <input type="file" className="hidden" />
                        <div className=" h-[122px] gap-[24px] flex flex-col items-center ">
                            <div className="w-[48px] h-[48px] rounded-[123px] gap-[10px] bg-[#EEF2FF] flex justify-center items-center">
                                <MdUploadFile />
                            </div>
                            <div className=" h-[50px] gap-[8px]">
                                <p className="text-[12px] min-[600px]:text-[16px]">
                                    <span className="font-bold text-[#043655]">
                                        Click here
                                    </span>{" "}
                                    to upload your file or drag.
                                </p>
                                <p className="text-[9px] min-[600px]:text-xs text-gray-500">
                                    Supported Format: SVG, JPG, PNG (10mb each)
                                </p>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    )
}
export default Account;