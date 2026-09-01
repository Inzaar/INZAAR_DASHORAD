// import ProfileDesign from "@/components/ui/profileDesign/ProfileDesign";
import { createPortal } from 'react-dom';
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
import { useTranslation } from "react-i18next";
// import profile from "@/assets/images/profile.png"

function Profile({ userInfo, setUserPayload, userPayload }) {
    const [activeTab, setActiveTab] = useState("account");
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { user, logout: contextLogout, checkAuth } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();


    const calculateProfileCompletion = (user) => {
        if (!user) return 0;
        const fields = [
            'firstname',
            'lastname',
            'email',
            'phone',
            'city',
            'gender',
            'dob',
            'educationQualification',
            'nationality',
            'permanentAddress',
            'attendedReligiousCourseDetails',
            'profileImageUrl'
        ];
        let filledCount = 0;
        fields.forEach(field => {
            const val = user[field];
            if (val !== undefined && val !== null && String(val).trim() !== '' && val !== 'Choose') {
                filledCount++;
            }
        });
        return Math.round((filledCount / fields.length) * 100);
    };

    const completionPercentage = calculateProfileCompletion(userPayload || userInfo);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        console.log(tab)
    };

    const handleSave = async () => {
        if (user?.role === 'guest') {
            setShowGuestModal(true);
            return;
        }

        const newErrors = {};

        // Validation for required fields
        if (!userPayload.email || userPayload.email.trim() === '') {
            newErrors.email = "Email is required.";
        }
        if (!userPayload.firstname || userPayload.firstname.trim() === '') {
            newErrors.firstname = "First name is required.";
        }
        if (!userPayload.lastname || userPayload.lastname.trim() === '') {
            newErrors.lastname = "Last name is required.";
        }

        if (userPayload.password && userPayload.password.trim() !== '') {
            if (userPayload.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters long.';
            }
            else if (!/[A-Z]/.test(userPayload.password)) {
                newErrors.password = 'Password must contain at least one uppercase letter.';
            }
            else if (!/[!@#$%^&*(),.?":{}|<>]/.test(userPayload.password)) {
                newErrors.password = 'Password must contain at least one special symbol.';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fix the errors in the form.");
            return;
        }

        setErrors({});

        const payloadToSend = { ...userPayload };
        if (!payloadToSend.password || payloadToSend.password.trim() === '') {
            delete payloadToSend.password;
            await submitProfileUpdate(payloadToSend);
        } else {
            setShowPasswordModal(true);
        }
    };

    const submitProfileUpdate = async (payload) => {
        try {
            await updateProfile(payload);
            if (checkAuth) await checkAuth();
            toast.success("Profile updated successfully!");
            
            if (payload.password) {
                setUserPayload(prev => ({...prev, password: ''}));
                setOldPassword("");
                setShowPasswordModal(false);
            }
        } catch (error) {
            console.error("Error updating profile", error);
            toast.error(error?.response?.data?.message || "Failed to update profile");
        }
    };

    const handlePasswordConfirm = () => {
        if (!oldPassword.trim()) {
            toast.error("Please enter your current password");
            return;
        }
        const payloadToSend = { ...userPayload, oldPassword };
        submitProfileUpdate(payloadToSend);
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

            <div className="gap-[22px] flex flex-col min-[800px]:flex-row px-1 min-[600px]:px-10">
                {/* div left */}
                <div className="w-[300px]">
                    {/* Profile Picture with Circular Progress Ring */}
                    <div
                        className="w-[100px] h-[100px] min-[600px]:w-[150px] min-[600px]:h-[150px] rounded-full p-[6px] min-[600px]:p-[8px] shadow-xl border border-white absolute top-[40px] ltr:left-2 ltr:min-[500px]:left-[30px] rtl:right-2 rtl:min-[500px]:right-[30px] flex items-center justify-center transition-all"
                        style={{
                            background: `conic-gradient(#3758EE ${completionPercentage}%, #E2E8F0 ${completionPercentage}% 100%)`
                        }}
                    >
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 border-2 border-white flex items-center justify-center">
                            {(userPayload?.profileImageUrl && userPayload.profileImageUrl.trim() !== '') || (userInfo?.profileImageUrl && userInfo.profileImageUrl.trim() !== '') ? (
                                <img
                                    src={userPayload?.profileImageUrl || userInfo?.profileImageUrl}
                                    alt="profile"
                                    className="w-full h-full object-cover bg-white"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm font-medium">{t('no_image', 'No Image')}</span>
                            )}
                        </div>
                    </div>

                    <div className="w-[260px] flex flex-col gap-[10px] absolute top-[150px] min-[600px]:top-[200px] ltr:left-2 ltr:min-[500px]:left-[35px] rtl:right-2 rtl:min-[500px]:right-[35px] ltr:text-left rtl:text-right">
                        {/* <h5>Zain</h5> */}
                        <div className="flex items-center gap-2.5 flex-wrap pt-1 pb-1">
                            <h4 className="font-bold text-[28px] min-[600px]:text-[30px] leading-normal">{userInfo?.firstname || "[YOUR_NAME]"}</h4>
                            <span className="bg-[#3758EE]/10 text-[#3758EE] text-xs min-[600px]:text-sm font-extrabold px-2.5 py-0.5 rounded-full border border-[#3758EE]/20 shadow-sm shrink-0">
                                {completionPercentage}%
                            </span>
                        </div>
                        <a href="#" className="w-full h-[24px] text-[16px] underline truncate">{userInfo?.email || "[EMAIL_ADDRESS]"}</a>
                        <h6 className="font-bold text-[16px] leading-[22px] tracking-[-0.7%] text-[#1E293B] leading-[1.8] pt-1">{t('personal_info', 'Personal Info')}</h6>
                        <p className="font-bold text-[14px] leading-[160%] tracking-[0%] text-[#475569] leading-[1.8]">{t('personal_info_desc', 'You can change your personal information settings here.')}</p>
                    </div>
                </div>

                <div className="w-full">
                    <div className="hidden min-[500px]:flex w-full h-[120px] sm:h-[150px] md:h-[200px] items-center justify-end px-6 sm:px-0">
                        <div
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="flex w-[130px] sm:w-[140px] h-[45px] sm:h-[50px] mt-6 sm:mt-10 rounded-xl justify-center items-center bg-gray-200 border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer font-bold text-[14px] shadow-sm gap-2"
                        >
                            {t('logout', 'Log Out')} <MdOutlineLogout size={18} />
                        </div>
                    </div>


                    <div className="w-full flex flex-col gap-[12px]">
                        {/* buttons */}
                        <div className="max-w-[333px] w-full h-[40px] rotate-0 opacity-100 p-1 flex bg-gray-200 rounded mt-50 min-[500px]:mt-20 md:mt-0 leading-[1.8]">
                            {/* account button */}
                            <div className={`cursor-pointer w-[162px] h-[32px] flex items-center justify-center rounded ${activeTab === "account" ? "bg-white" : "bg-gray-200"}`}>
                                <h6 onClick={() => handleTabClick("account")} className={`font-sans font-medium text-sm leading-[20px] tracking-normal text-center ${activeTab === "account" ? "text-[#18181B]" : "text-[#71717A]"}`}>{t('account', 'Account')}</h6>
                            </div>
                            <div className={`cursor-pointer w-[162px] h-[32px] flex items-center justify-center rounded ${activeTab === "other" ? "bg-white" : "bg-gray-200"}`}>
                                <h6 onClick={() => handleTabClick("other")} className={`font-sans font-medium text-sm leading-[20px] tracking-normal text-center ${activeTab === "other" ? "text-[#18181B]" : "text-[#71717A]"}`}>{t('other', 'Other')}</h6>
                            </div>
                        </div>
                        {activeTab === "account" ? <Account className="w-full" setUserPayload={setUserPayload} userPayload={userPayload} userInfo={userInfo} errors={errors} /> : <Other setUserPayload={setUserPayload} userPayload={userPayload} userInfo={userInfo} errors={errors} />}
                    </div>

                </div>
            </div>

            <div className="w-[calc(100%-80px)] h-[2px] bg-gray-300 mx-10">
            </div>

            <div className="w-full flex items-center justify-end gap-[15px] pr-10">
                <button className={"w-[100px] h-[40px] rounded bg-[#B1B1B1] text-white"}>{t('cancel', 'Cancel')}</button>
                <div onClick={handleSave}>
                    <GradiantButton className={"w-[100px] h-[40px] rounded"}>{t('save', 'Save')}</GradiantButton>
                </div>
            </div>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
            />

            {/* Guest Profile Save Modal */}
            {showGuestModal && createPortal(
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-150 ease-out animate-in fade-in fill-mode-both" onClick={() => setShowGuestModal(false)} />
                    <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm p-8 relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowGuestModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <div className="flex flex-col items-center text-center gap-5 pt-2">
                            <div className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#B666E7] mb-2 border-4 border-[#F3E8FF]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Account Required</h3>
                                <p className="text-[14px] leading-relaxed text-gray-500 font-medium">
                                    You are currently browsing as a guest. Please create an account or sign in to complete your profile.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowGuestModal(false);
                                    contextLogout();
                                    navigate('/login');
                                }}
                                className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white font-bold text-[14px] shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all"
                            >
                                Sign In / Create Account
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Old Password Confirmation Modal */}
            {showPasswordModal && createPortal(
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-150 ease-out animate-in fade-in fill-mode-both" onClick={() => setShowPasswordModal(false)} />
                    <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm p-8 relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <div className="flex flex-col items-center text-center gap-4 pt-2">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#3758EE] mb-2 border-4 border-blue-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </div>
                            <div className="w-full">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Password Change</h3>
                                <p className="text-[14px] leading-relaxed text-gray-500 font-medium mb-4">
                                    Please enter your current password to confirm the changes.
                                </p>
                                <input 
                                    type="password" 
                                    value={oldPassword} 
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Current Password" 
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3758EE] focus:border-transparent transition-all"
                                />
                            </div>
                            <button
                                onClick={handlePasswordConfirm}
                                className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white font-bold text-[14px] shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all"
                            >
                                Confirm & Update
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="w-full py-3.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-[14px] hover:bg-gray-200 active:scale-95 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

export default Profile;