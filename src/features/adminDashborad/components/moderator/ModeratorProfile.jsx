import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState, useEffect } from "react";
import { FaIdCard, FaEdit, FaLock, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { uploadImage } from "@/api/course";
import { updateUser } from "@/api/user";
import axiosInstance from "@/api/axiosInstance";
import PhoneInput from "@/components/ui/inputs/PhoneInput";

function ModeratorProfile({ profileData, type = 'moderator', pendingProfileImage, setPendingProfileImage, onEditClick }) {
  const isStudent = type === 'student';
  const user = profileData?.user || {};
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState(user.phone || '');
  const [cnicFrontPreview, setCnicFrontPreview] = useState(user.cnicFrontImage || null);
  const [cnicBackPreview, setCnicBackPreview] = useState(user.cnicBackImage || null);

  useEffect(() => {
    setPhone(user.phone || '');
  }, [user.phone]);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    if (user.cnicFrontImage) setCnicFrontPreview(user.cnicFrontImage);
    if (user.cnicBackImage) setCnicBackPreview(user.cnicBackImage);
  }, [user.cnicFrontImage, user.cnicBackImage]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (passwordData.password.length < 6) {
      return toast.error("Password must be at least 6 characters long!");
    }
    if (!/[A-Z]/.test(passwordData.password)) {
      return toast.error("Password must contain at least one uppercase letter!");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.password)) {
      return toast.error("Password must contain at least one special symbol!");
    }

    setIsChangingPass(true);
    const toastId = toast.loading("Updating password...");

    try {
      await updateUser(user._id, { password: passwordData.password });
      toast.success("Password changed successfully!", { id: toastId });
      setShowPasswordModal(false);
      setPasswordData({ password: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error?.message || "Failed to change password", { id: toastId });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user._id) return toast.error("User ID not found!");

    setIsSaving(true);
    const toastId = toast.loading("Saving profile details...");

    try {
      const form = new FormData(e.target);

      const email = form.get("email");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setIsSaving(false);
        toast.dismiss(toastId);
        return toast.error("Please enter a valid email address.");
      }

      const rawPayload = {
        firstname: form.get("firstname"),
        email: form.get("email"),
        phone: phone,
        gender: form.get("gender"),
        cnic: form.get("cnic"),
        permanentAddress: form.get("permanentAddress"),
        nationality: form.get("nationality"),
        city: form.get("city"),
        educationQualification: form.get("educationQualification"),
        attendedReligiousCourseDetails: form.get("attendedReligiousCourseDetails"),
        dob: form.get("dob"),
        profileImageUrl: pendingProfileImage ? null : user.profileImageUrl || ""
      };

      // Only send fields that actually exist (are not null) so we don't accidentally blank out backend data
      const payload = {};
      Object.keys(rawPayload).forEach(key => {
        if (rawPayload[key] !== null) {
          payload[key] = rawPayload[key];
        }
      });

      // 1. Handle Pending Profile Image (from ModeratorRoll component)
      if (pendingProfileImage) {
        const profileFormData = new FormData();
        profileFormData.append("image", pendingProfileImage);

        const uploadRes = await axiosInstance.post("/upload/profile-pic", profileFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadRes.data?.data?.url) {
          payload.profileImageUrl = uploadRes.data.data.url;
        }
      }

      // 2. Handle Front CNIC
      const frontFile = form.get("cnicFrontImageFile");
      if (frontFile && frontFile.size > 0) {
        const uploadedFront = await uploadImage(frontFile);
        payload.cnicFrontImage = uploadedFront.url;
      }

      // 3. Handle Back CNIC
      const backFile = form.get("cnicBackImageFile");
      if (backFile && backFile.size > 0) {
        const uploadedBack = await uploadImage(backFile);
        payload.cnicBackImage = uploadedBack.url;
      }

      // Keep existing if no new uploaded
      if (!payload.cnicFrontImage && user.cnicFrontImage) payload.cnicFrontImage = user.cnicFrontImage;
      if (!payload.cnicBackImage && user.cnicBackImage) payload.cnicBackImage = user.cnicBackImage;

      const updatedRes = await updateUser(user._id, payload);

      if (updatedRes?.data && profileData) {
        profileData.user = updatedRes.data;
      } else if (payload.profileImageUrl && user) {
        user.profileImageUrl = payload.profileImageUrl;
      }

      // Clear pending image state on success
      if (setPendingProfileImage) setPendingProfileImage(null);

      toast.success("Profile updated successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to update profile", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                  <FaLock className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Change Password</h3>
                  <p className="text-blue-100 text-xs">Update account security</p>
                </div>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
              {/* Moderator Info Display */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {user.firstname?.charAt(0) || user.username?.charAt(0) || 'M'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.firstname || user.username || "Moderator"}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="ml-auto px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded">
                  {type}
                </div>
              </div>

              <div className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={passwordData.password}
                      onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full h-12 rounded-xl border border-gray-200 pl-4 pr-12 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isChangingPass ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <form key={user._id ? `profile-form-${user._id}` : 'form'} onSubmit={handleSave} className="w-full rounded-[10px] border border-[#ECECEC] p-[14px]">
        <div className="w-full mx-auto">

          {/* Header */}
          <div className="w-full flex justify-between items-center mb-6">
            <h3 className="text-[18px] font-medium">Profile Details</h3>

            <div className="flex gap-[12px] items-center">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="w-[140px] h-[40px] bg-[#A7A7A7] hover:bg-gray-500 transition-all rounded-[4px] text-white text-[13px] lg:text-sm lg:w-[177px] hidden min-[640px]:block font-medium"
              >
                Change Password
              </button>

              {/* Mobile Change Password Button */}
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="flex min-[640px]:hidden w-[40px] h-[40px] justify-center items-center rounded-[8px] bg-[#A7A7A7] hover:bg-gray-500 transition-all text-white"
              >
                <FaLock className="w-4" />
              </button>

              {/* Edit button for screens larger than 700px */}
              <GradiantButton
                type="button"
                onClick={onEditClick}
                className="hidden sm:flex w-[90px] h-[40px] rounded-[4px] text-sm"
              >
                Edit
              </GradiantButton>

              {/* Gradient icon for smaller screens */}
              <GradiantButton
                type="button"
                onClick={onEditClick}
                className="flex sm:hidden w-[40px] h-[40px] justify-center items-center rounded-[8px] bg-white text-blue-600"
              >
                <FaEdit className="w-4" />
              </GradiantButton>
            </div>
          </div>

          {/* Flex Form */}
          <div className="w-full mt-[20px] flex flex-wrap gap-[20px]">

            {/* First Name / Full Name */}
            <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-1 lg:order-1">
              <label className="font-medium text-[14px]">{isStudent ? "Full Name" : "First name"}</label>
              <input
                type="text"
                name="firstname"
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
                name="email"
                placeholder="Enter email"
                defaultValue={user.email || ""}
                className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Number */}
            <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-2 lg:order-3">
              <label className="font-medium text-[14px]">Number</label>
              <PhoneInput
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                label={null}
                containerClassName="w-full relative"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-6 lg:order-4">
              <label className="font-medium text-[14px]">Gender</label>
              <select name="gender" className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none" defaultValue={user.gender || "Choose"}>
                <option>Choose</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            {/* CNIC */}
            <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-3 lg:order-5">
              <label className="font-medium text-[14px]">CNIC / Passport</label>
              <input
                type="text"
                name="cnic"
                placeholder="23456-2389-1"
                defaultValue={user.cnic || ""}
                className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-7 lg:order-6">
              <label className="font-medium text-[14px]">Address</label>
              <input
                type="text"
                name="permanentAddress"
                defaultValue={user.permanentAddress || user.city || ""}
                className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Nationality */}
            <div className="flex flex-col gap-[8px] w-full lg:w-[48%] order-4 lg:order-7">
              <label className="font-medium text-[14px]">Nationality</label>
              <input
                type="text"
                name="nationality"
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
                name="educationQualification"
                placeholder="Enter Your Education"
                defaultValue={user.educationQualification || ""}
                className="w-full h-[48px] rounded-md px-3 border border-[#E4E4E7] outline-none"
              />
            </div>

            {/* Front CNIC */}
            {/* 
            <div className="w-full lg:w-[48%] order-9 lg:order-9">
              <p className="mb-2 text-[14px] font-medium">Front CNIC</p>
              <div className="w-full aspect-[1.58/1] rounded-[10px] border border-[#E4E4E7] flex justify-center items-center overflow-hidden relative group">
                {cnicFrontPreview ? (
                  <>
                    <img src={cnicFrontPreview} alt="Front CNIC Preview" className="w-full h-full object-cover" />
                    <a href={cnicFrontPreview} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 hover:bg-black/80 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                      View File
                    </a>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FaIdCard className="w-[46px] h-[30px] text-[#A7A7A7]" />
                    <p className="text-[10px] text-[#666666]">
                      Upload Front CNIC
                    </p>
                  </div>
                )}
                <label className="absolute bottom-3 bg-[#265CEB] rounded-[6px] text-white w-[80px] h-[30px] text-[12px] flex items-center justify-center cursor-pointer opacity-90 hover:opacity-100 z-10 font-medium">
                  Browse
                  <input
                    type="file"
                    name="cnicFrontImageFile"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCnicFrontPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </div>
            */}

            {/* Back CNIC */}
            {/* 
            <div className="w-full lg:w-[48%] order-10 lg:order-10">
              <p className="mb-2 text-[14px] font-medium">Back CNIC</p>
              <div className="w-full aspect-[1.58/1] rounded-[10px] border border-[#E4E4E7] flex justify-center items-center overflow-hidden relative group">
                {cnicBackPreview ? (
                  <>
                    <img src={cnicBackPreview} alt="Back CNIC Preview" className="w-full h-full object-cover" />
                    <a href={cnicBackPreview} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 hover:bg-black/80 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                      View File
                    </a>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FaIdCard className="w-[46px] h-[30px] text-[#A7A7A7]" />
                    <p className="text-[10px] text-[#666666]">
                      Upload Back CNIC
                    </p>
                  </div>
                )}
                <label className="absolute bottom-3 bg-[#265CEB] rounded-[6px] text-white w-[80px] h-[30px] text-[12px] flex items-center justify-center cursor-pointer opacity-90 hover:opacity-100 z-10 font-medium">
                  Browse
                  <input
                    type="file"
                    name="cnicBackImageFile"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCnicBackPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </div>
            */}
          </div>
        </div>
        <div className="flex justify-end mt-[10px]">
          <button type="submit" disabled={isSaving} className="w-[90px] h-[40px] rounded-[4px] text-sm text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            {isSaving ? "Saving" : "Save"}
          </button>
        </div>
      </form>
    </>
  );
}

export default ModeratorProfile;