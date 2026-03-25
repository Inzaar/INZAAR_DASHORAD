// import ProfileDesign from "@/components/ui/profileDesign/ProfileDesign";
import { MdOutlineLogout } from "react-icons/md";
import Account from "./account";
import GrayButton from "@/components/ui/buttons/GrayButton";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState } from "react";
import Other from "./other";
import ProfileDesign from "./ProfileDesign";
// import profile from "@/assets/images/profile.png"

function Profile() {
    const [activeTab, setActiveTab] = useState("account");

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        console.log(tab)
    };

    return (
        <div className="w-full flex flex-col gap-[24px] rotate-0 opacity-100 bg-gray-100/60 shadow-lg rounded-md relative pb-10">
            <ProfileDesign />
            {/* <div className="bg-red-300 w-full h-[100px] min-[600p]:h-[150px] rounded-t-[10px]">

            </div> */}

            <div className="gap-[22px] flex flex-col min-[800px]:flex-row min-[600px]:px-10">
                {/* div left */}
                <div className="w-[300px]">
                    <div className="w-[100px] h-[100px] min-[600px]:w-[150px] min-[600px]:h-[150px] rounded-full overflow-hidden bg-gray-400 absolute top-[40px] left-[30px]">
                        {/* <img
                            src={profile}
                            alt="profile"
                            className="w-full h-full object-cover scale-x-[-1]"
                        /> */}
                    </div>

                    <div className="w-[260px] flex flex-col gap-[10px] absolute top-[150px] min-[600px]:top-[200px] left-[35px]">
                        {/* <h5>Zain</h5> */}
                        <h4 className="font-bold w-full h-[38px] text-[30px]">Zain</h4>
                        <a href="#" className="w-full h-[24px] text-[16px] underline">zain@gmail.com</a>
                        <h6 className="font-bold text-[16px] leading-[22px] tracking-[-0.7%] text-[#1E293B]">Personal Info</h6>
                        <p className="font-bold text-[14px] leading-[160%] tracking-[0%] text-[#475569]">You can change  your personal information settings here.</p>
                    </div>
                </div>

                {/* div right */}
                <div className="w-full">
                    <div className="w-full h-[200px] min-[800px]:h-[150px] flex items-center justify-end">
                        <div className="hidden min-[600px]:flex w-[140px] h-[50px] mt-10 rounded-md justify-center items-center bg-[#B1B1B1] text-[#FFFFFF] gap-[10px] font-medium">Log Out <MdOutlineLogout /></div>
                    </div>


                    <div className="w-full flex flex-col gap-[12px]">
                        {/* buttons */}
                        <div className="w-[333px] h-[40px] rotate-0 opacity-100 p-1 flex bg-gray-200 rounded">
                            {/* account button */}
                            <div className={`cursor-pointer w-[162px] h-[32px] flex items-center justify-center rounded ${activeTab === "account" ? "bg-white" : "bg-gray-200"}`}>
                                <h6 onClick={() => handleTabClick("account")} className={`font-sans font-medium text-sm leading-[20px] tracking-normal text-center ${activeTab === "account" ? "text-[#18181B]" : "text-[#71717A]"}`}>Account</h6>
                            </div>
                            <div className={`cursor-pointer w-[162px] h-[32px] flex items-center justify-center rounded ${activeTab === "other" ? "bg-white" : "bg-gray-200"}`}>
                                <h6 onClick={() => handleTabClick("other")} className={`font-sans font-medium text-sm leading-[20px] tracking-normal text-center ${activeTab === "other" ? "text-[#18181B]" : "text-[#71717A]"}`}>Other</h6>
                            </div>
                        </div>
                        {activeTab === "account" ? <Account className="w-full" /> : <Other />}
                    </div>

                </div>
            </div>

            <div className="w-[calc(100%-80px)] h-[2px] bg-gray-300 mx-10">
            </div>

            <div className="w-full flex items-center justify-end gap-[15px] pr-10">
                <button className={"w-[100px] h-[40px] rounded bg-[#B1B1B1] text-white"}>Cancel</button>
                <GradiantButton className={"w-[100px] h-[40px] rounded"}>Save</GradiantButton>
            </div>
        </div>
    )
}

export default Profile;