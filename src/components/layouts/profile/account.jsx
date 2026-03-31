import { useState } from 'react';
import ThumbnailCropper from '@/features/adminDashborad/components/ThumbnailCropper';
import { uploadProfilePic } from '@/api/auth';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { MdUploadFile } from "react-icons/md";

function Account({ setUserPayload, userPayload, userInfo }) {
    const [showCropper, setShowCropper] = useState(false);
    const [cropSrc, setCropSrc] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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

    return (
        <div className="">
            <div className="w-full rounded-[12px] p-[24px] gap-[24px] bg-[#FFFFFF] flex flex-col gap-5">
                <div className="w-full flex flex-col gap-5 opacity-[1px] ">
                    {/* firstname */}
                    <div className="w-full gap-[16px] opacity-[1px] flex flex-col min-[600px]:flex-row">
                        <div className="w-full min-[800px]:w-[50%] h-[76px] gap-[8px] flex flex-col">
                            <label className="font-medium font-[16px] leading-none tracking-normal">First name</label>
                            <input
                                type="text"
                                value={userPayload?.firstname}
                                placeholder="Enter first name"
                                className="w-full h-[52px] rounded-md opacity-100 pt-4 pb-4 px-3 gap-1 border sm:w-full"
                                onChange={(e) => setUserPayload({ ...userPayload, firstname: e.target.value })}
                            />
                        </div>
                        {/* lastname */}
                        <div className="w-full min-[800px]:w-[50%] h-[76px] gap-[8px] flex flex-col">
                            <label className="font-medium font-[16px] leading-none tracking-normal">Last name</label>
                            <input type="text" value={userPayload?.lastname || ''} onChange={(e) => setUserPayload({ ...userPayload, lastname: e.target.value })} placeholder="Enter last name" className="w-full h-[52px] rounded-md opacity-100 pt-4 pb-4 px-3 gap-1 border" />
                        </div>
                    </div>
                    {/* email */}
                    <div className="w-full gap-2 opacity-[1px] flex flex-col">
                        <label className="font-medium font-[16px] leading-none tracking-normal text-base text-[#18181B]">Email*</label>
                        <input type="email" value={userPayload?.email || ''} onChange={(e) => setUserPayload({ ...userPayload, email: e.target.value })} placeholder="Enter email address" className="w-full h-[52px] rounded-md rotate-0 opacity-100 pt-4 pb-4 px-3 gap-1 border border-[#E4E4E7]" />
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
                                    value={userPayload?.phone || ''}
                                    onChange={(e) => setUserPayload({ ...userPayload, phone: e.target.value })}
                                    placeholder="Phone number"
                                    className="outline-none w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full gap-[8px] opacity-[1px] flex flex-col">
                        <label className="font-medium font-[16px] leading-none tracking-normal text-base text-[#18181B]">City town</label>
                        <input type="text" value={userPayload?.city || ''} onChange={(e) => setUserPayload({ ...userPayload, city: e.target.value })} placeholder="Enter your city" className="w-full h-[52px] rounded-md rotate-0 opacity-100 pt-4 pb-4 px-3 gap-1 border border-[#E4E4E7]" />
                    </div>

                </div>
                {/* Upload Box */}
                <div className="w-full gap-[8px] opacity-[1px] flex flex-col min-[1218px]:flex-row justify-between items-center min-[1218px]:items-start">

                    <div className="w-[99px] h-[108px] gap-[12px] opacity-[1px] flex flex-col gap-5 items-center">
                        <label htmlFor="" className="text-[14px] leading-[20px] tracking-[-0.6%]">Change Profile</label>
                        <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-200 border border-gray-100 flex items-center justify-center">
                            {isUploading ? (
                                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                            ) : userPayload?.profileImageUrl ? (
                                <img
                                    src={userPayload.profileImageUrl}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : userInfo?.profileImageUrl ? (
                                <img
                                    src={userInfo.profileImageUrl}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">No img</span>
                            )}
                        </div>
                    </div>

                    <label className={`w-full min-[1218px]:w-[80%] h-[170px] gap-[10px] border-2 border-dashed rounded-[40px] p-6 text-center cursor-pointer transition ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}`}>
                        <input type="file" className="hidden" accept="image/jpg,image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={isUploading} />
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