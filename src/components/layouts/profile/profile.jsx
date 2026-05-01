// import ProfileDesign from "@/components/ui/profileDesign/ProfileDesign";
import { MdOutlineLogout } from "react-icons/md";
import toast from 'react-hot-toast';
import Account from "./account";
import GrayButton from "@/components/ui/buttons/GrayButton";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState } from "react";
import Other from "./other";
import ProfileDesign from "./ProfileDesign";
import { updateProfile, logout as apiLogout } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutModal from "@/components/shared/LogoutModal";
// import profile from "@/assets/images/profile.png"

function Profile({ userInfo, setUserPayload, userPayload }) {
    const [activeTab, setActiveTab] = useState("account");
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { logout: contextLogout } = useAuth();
    const navigate = useNavigate();


    const handleTabClick = (tab) => {
        setActiveTab(tab);
        console.log(tab)
    };

    const handleSave = async () => {
        try {
            // The backend sends the hashed password in 'user', which we must strip out before updating
            const payloadToSend = { ...userPayload };
            delete payloadToSend.password;

            const res = await updateProfile(payloadToSend);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile", error);
            toast.error(error?.response?.data?.message || "Failed to update profile");
        }
    };

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            contextLogout();
            navigate('/login');
        }
    };

    return (
        <div className="w-full flex flex-col gap-[24px] rotate-0 opacity-100 bg-gray-100/60 shadow-lg rounded-md relative pb-10">
            <ProfileDesign />
            {/* <div className="bg-red-300 w-full h-[100px] min-[600p]:h-[150px] rounded-t-[10px]">

            </div> */}

            <div className="gap-[22px] flex flex-col min-[800px]:flex-row min-[600px]:px-10">
                {/* div left */}
                <div className="w-[300px]">
                    <div className="w-[100px] h-[100px] min-[600px]:w-[150px] min-[600px]:h-[150px] rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md absolute top-[40px] left-2 min-[500px]:left-[30px] flex items-center justify-center">
                        {userPayload?.profileImageUrl || userInfo?.profileImageUrl ? (
                            <img
                                src={userPayload?.profileImageUrl || userInfo?.profileImageUrl}
                                alt="profile"
                                className="w-full h-full object-cover bg-white"
                            />
                        ) : (
                            <span className="text-gray-400 text-sm font-medium">No Image</span>
                        )}
                    </div>

                    <div className="w-[260px] flex flex-col gap-[10px] absolute top-[150px] min-[600px]:top-[200px] min-[500px]:left-[35px]">
                        {/* <h5>Zain</h5> */}
                        <h4 className="font-bold w-full h-[38px] text-[30px]">{userInfo?.firstname || "[YOUR_NAME]"}</h4>
                        <a href="#" className="w-full h-[24px] text-[16px] underline">{userInfo?.email || "[EMAIL_ADDRESS]"}</a>
                        <h6 className="font-bold text-[16px] leading-[22px] tracking-[-0.7%] text-[#1E293B]">Personal Info</h6>
                        <p className="font-bold text-[14px] leading-[160%] tracking-[0%] text-[#475569]">You can change  your personal information settings here.</p>
                    </div>
                </div>

                <div className="w-full">
                    <div className="hidden min-[500px]:flex w-full h-[120px] sm:h-[150px] md:h-[200px] items-center justify-end px-6 sm:px-0">
                        <div
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="flex w-[130px] sm:w-[140px] h-[45px] sm:h-[50px] mt-6 sm:mt-10 rounded-xl justify-center items-center bg-[#f1f5f9] border border-gray-100 text-[#64748b] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all cursor-pointer font-bold text-[14px] shadow-sm gap-2"
                        >
                            Log Out <MdOutlineLogout size={18} />
                        </div>
                    </div>


                    <div className="w-full flex flex-col gap-[12px]">
                        {/* buttons */}
                        <div className="w-[333px] h-[40px] rotate-0 opacity-100 p-1 flex bg-gray-200 rounded mt-50 min-[500px]:mt-20 md:mt-0">
                            {/* account button */}
                            <div className={`cursor-pointer w-[162px] h-[32px] flex items-center justify-center rounded ${activeTab === "account" ? "bg-white" : "bg-gray-200"}`}>
                                <h6 onClick={() => handleTabClick("account")} className={`font-sans font-medium text-sm leading-[20px] tracking-normal text-center ${activeTab === "account" ? "text-[#18181B]" : "text-[#71717A]"}`}>Account</h6>
                            </div>
                            <div className={`cursor-pointer w-[162px] h-[32px] flex items-center justify-center rounded ${activeTab === "other" ? "bg-white" : "bg-gray-200"}`}>
                                <h6 onClick={() => handleTabClick("other")} className={`font-sans font-medium text-sm leading-[20px] tracking-normal text-center ${activeTab === "other" ? "text-[#18181B]" : "text-[#71717A]"}`}>Other</h6>
                            </div>
                        </div>
                        {activeTab === "account" ? <Account className="w-full" setUserPayload={setUserPayload} userPayload={userPayload} userInfo={userInfo} /> : <Other setUserPayload={setUserPayload} userPayload={userPayload} userInfo={userInfo} />}
                    </div>

                </div>
            </div>

            <div className="w-[calc(100%-80px)] h-[2px] bg-gray-300 mx-10">
            </div>

            <div className="w-full flex items-center justify-end gap-[15px] pr-10">
                <button className={"w-[100px] h-[40px] rounded bg-[#B1B1B1] text-white"}>Cancel</button>
                <div onClick={handleSave}>
                    <GradiantButton className={"w-[100px] h-[40px] rounded"}>Save</GradiantButton>
                </div>
            </div>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    )
}

export default Profile;