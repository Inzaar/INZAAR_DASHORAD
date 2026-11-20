import { useState } from 'react';
import ThumbnailCropper from '@/features/adminDashborad/components/ThumbnailCropper';
import { uploadProfilePic } from '@/api/auth';
import PhoneInput from '@/components/ui/inputs/PhoneInput';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { MdUploadFile } from "react-icons/md";
import { useTranslation } from "react-i18next";

const AccountSkeleton = () => {
    return (
        <div className="w-full rounded-[12px] p-[24px] bg-[#FFFFFF] flex flex-col gap-5 border border-[#E2E8F0] animate-pulse">
            <div className="w-full flex flex-col gap-5">
                {/* Firstname & Lastname */}
                <div className="w-full gap-[16px] flex flex-col min-[600px]:flex-row">
                    <div className="w-full min-[800px]:w-[50%] gap-[8px] flex flex-col">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                    </div>
                    <div className="w-full min-[800px]:w-[50%] gap-[8px] flex flex-col">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                    </div>
                </div>

                {/* Email */}
                <div className="w-full gap-2 flex flex-col">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                </div>

                {/* Password & WhatsApp */}
                <div className="w-full gap-[16px] flex flex-col min-[1218px]:flex-row">
                    <div className="w-full min-[1218px]:w-[50%] gap-[8px] flex flex-col">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                    </div>
                    <div className="w-full min-[1218px]:w-[50%] gap-[8px] flex flex-col">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                    </div>
                </div>

                {/* City town */}
                <div className="w-full gap-[8px] flex flex-col">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="w-full h-[52px] rounded-md bg-gray-100 border border-[#E4E4E7]"></div>
                </div>
            </div>

            {/* Upload Box */}
            <div className="w-full gap-[8px] flex flex-col min-[1218px]:flex-row justify-between items-center min-[1218px]:items-start mt-2">
                <div className="w-[99px] h-[108px] flex flex-col gap-3 items-center">
                    <div className="h-3.5 bg-gray-200 rounded w-20"></div>
                    <div className="w-[80px] h-[80px] rounded-full bg-gray-200 border border-gray-100"></div>
                </div>

                <div className="w-full min-[1218px]:w-[80%] h-[170px] border-2 border-dashed border-gray-200 rounded-[40px] p-6 flex flex-col items-center justify-center gap-3">
                    <div className="w-[48px] h-[48px] rounded-full bg-[#EEF2FF] flex justify-center items-center">
                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-100 rounded w-60"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function Account({ setUserPayload, userPayload, userInfo, errors, isLoading = false }) {
    if (isLoading) {
        return <AccountSkeleton />;
    }
    const [showCropper, setShowCropper] = useState(false);
    const [cropSrc, setCropSrc] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = ''; // reset input
        setCropSrc(URL.createObjectURL(file));
        setShowCropper(true);
    };

    const handleCropApply = async (blob) => {
        setShowCropper(false);
        setIsUploading(true);
        try {
            const croppedFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
            const { url } = await uploadProfilePic(croppedFile);
            setUserPayload(prev => ({ ...prev, profileImageUrl: url }));
        } catch (err) {
            console.error('Upload failed:', err);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const resolveImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('blob:') || url.startsWith('data:')) return url;
        if (url.includes('localhost:8000/uploads')) {
            return url.replace('http://localhost:8000', 'https://inzaar.duckdns.org');
        }
        if (url.startsWith('/uploads')) {
            return `https://inzaar.duckdns.org${url}`;
        }
        return url;
    };

    return (
        <div className="w-full">
            <div className="w-full rounded-2xl p-4 sm:p-6 bg-white flex flex-col gap-4 sm:gap-5 border border-[#E2E8F0] shadow-sm">
                <div className="w-full flex flex-col gap-4 sm:gap-5">
                    {/* firstname & lastname */}
                    <div className="w-full gap-3 sm:gap-4 flex flex-col min-[600px]:flex-row">
                        <div className="w-full min-[600px]:w-1/2 gap-1.5 sm:gap-2 flex flex-col">
                            <label className="font-semibold text-xs sm:text-sm text-gray-700">{t('first_name', 'First name')}</label>
                            <input
                                type="text"
                                value={userPayload?.firstname || ''}
                                placeholder={t('enter_first_name', 'Enter first name')}
                                className={`w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 text-xs sm:text-sm border transition-colors ${errors?.firstname ? 'border-red-500 bg-red-50' : 'border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'}`}
                                onChange={(e) => setUserPayload({ ...userPayload, firstname: e.target.value })}
                            />
                            {errors?.firstname && <p className="text-red-500 text-xs mt-0.5">{errors.firstname}</p>}
                        </div>
                        {/* lastname */}
                        <div className="w-full min-[600px]:w-1/2 gap-1.5 sm:gap-2 flex flex-col">
                            <label className="font-semibold text-xs sm:text-sm text-gray-700">{t('last_name', 'Last name')}</label>
                            <input 
                                type="text" 
                                value={userPayload?.lastname || ''} 
                                onChange={(e) => setUserPayload({ ...userPayload, lastname: e.target.value })} 
                                placeholder={t('enter_last_name', 'Enter last name')} 
                                className={`w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 text-xs sm:text-sm border transition-colors ${errors?.lastname ? 'border-red-500 bg-red-50' : 'border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'}`} 
                            />
                            {errors?.lastname && <p className="text-red-500 text-xs mt-0.5">{errors.lastname}</p>}
                        </div>
                    </div>

                    {/* email */}
                    <div className="w-full gap-1.5 sm:gap-2 flex flex-col">
                        <label className="font-semibold text-xs sm:text-sm text-gray-700">{t('email_required', 'Email*')}</label>
                        <input 
                            type="email" 
                            value={userPayload?.email || ''} 
                            onChange={(e) => setUserPayload({ ...userPayload, email: e.target.value })} 
                            placeholder={t('enter_email', 'Enter email address')} 
                            className={`w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 text-xs sm:text-sm border transition-colors ${errors?.email ? 'border-red-500 bg-red-50' : 'border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'}`} 
                        />
                        {errors?.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                    </div>

                    {/* password & whatsapp number */}
                    <div className="w-full gap-3 sm:gap-4 flex flex-col min-[1218px]:flex-row">
                        <div className="w-full min-[1218px]:w-1/2 gap-1.5 sm:gap-2 flex flex-col">
                            <label className="font-semibold text-xs sm:text-sm text-gray-700">{t('password_required', 'Password*')}</label>
                            <div className="relative w-full">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={(userPayload?.password && userPayload.password.length > 40) ? '' : (userPayload?.password || '')}
                                    onChange={(e) => setUserPayload({ ...userPayload, password: e.target.value })}
                                    placeholder={t('leave_blank_to_keep', 'Leave blank to keep unchanged')}
                                    className={`w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 pr-10 text-xs sm:text-sm border transition-colors ${errors?.password ? 'border-red-500 bg-red-50' : 'border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'}`} 
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors?.password && <p className="text-red-500 text-xs mt-0.5">{errors.password}</p>}
                        </div>

                        {/* whatsapp number */}
                        <div className="w-full min-[1218px]:w-1/2 gap-1.5 sm:gap-2 flex flex-col">
                            <label className="font-semibold text-xs sm:text-sm text-gray-700">{t('whatsapp_number', 'WhatsApp number')}</label>
                            <PhoneInput
                                name="phone"
                                value={userPayload?.phone || ''}
                                onChange={(e) => setUserPayload({ ...userPayload, phone: e.target.value })}
                                label={null}
                                containerClassName="w-full relative"
                            />
                        </div>
                    </div>

                    {/* city town */}
                    <div className="w-full gap-1.5 sm:gap-2 flex flex-col">
                        <label className="font-semibold text-xs sm:text-sm text-gray-700">{t('city_town', 'City town')}</label>
                        <input 
                            type="text" 
                            value={userPayload?.city || ''} 
                            onChange={(e) => setUserPayload({ ...userPayload, city: e.target.value })} 
                            placeholder={t('enter_city', 'Enter your city')} 
                            className="w-full h-[46px] sm:h-[52px] rounded-lg px-3.5 sm:px-4 text-xs sm:text-sm border border-[#E4E4E7] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors" 
                        />
                    </div>
                </div>

                {/* Upload Box */}
                <div className="w-full gap-4 sm:gap-6 flex flex-col min-[1218px]:flex-row justify-between items-center min-[1218px]:items-start pt-2">
                    <div className="flex flex-col gap-2 items-center shrink-0">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">{t('change_profile', 'Change Profile')}</label>
                        <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shadow-inner">
                            {isUploading ? (
                                <Loader2 className="animate-spin text-blue-500 w-6 h-6 sm:w-8 sm:h-8" />
                            ) : (userPayload?.profileImageUrl || userInfo?.profileImageUrl) ? (
                                <img
                                    src={resolveImageUrl(userPayload?.profileImageUrl || userInfo?.profileImageUrl)}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">{t('no_img', 'No img')}</span>
                            )}
                        </div>
                    </div>

                    <label className={`w-full min-[1218px]:w-[80%] min-h-[130px] sm:h-[150px] border-2 border-dashed border-gray-200 hover:border-purple-400 rounded-2xl sm:rounded-[30px] p-4 sm:p-6 text-center cursor-pointer transition flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input type="file" className="hidden" accept="image/jpg,image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={isUploading} />
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#EEF2FF] text-[#3758EE] flex justify-center items-center text-lg sm:text-xl">
                                <MdUploadFile />
                            </div>
                            <div className="text-center">
                                <p className="text-xs sm:text-sm leading-normal">
                                    <span className="font-bold text-[#043655]">
                                        {t('click_here', 'Click here')}
                                    </span>{" "}
                                    {t('upload_drag_desc', 'to upload your file or drag.')}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                    {t('supported_formats', 'Supported Format: SVG, JPG, PNG (10mb each)')}
                                </p>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Thumbnail Crop Modal */}
            {showCropper && cropSrc && (
                <ThumbnailCropper
                    imageSrc={cropSrc}
                    onApply={handleCropApply}
                    onCancel={() => setShowCropper(false)}
                    defaultAspect={1}
                />
            )}
        </div>
    )
}
export default Account;