import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState, useEffect } from "react";
import { FaIdCard } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import { uploadImage } from "@/api/course";
import { updateUser } from "@/api/user";
import axiosInstance from "@/api/axiosInstance";

function ModeratorProfile({ profileData, type = 'moderator', pendingProfileImage, setPendingProfileImage }) {
  const isStudent = type === 'student';
  const user = profileData?.user || {};
  const [isSaving, setIsSaving] = useState(false);
  const [cnicFrontPreview, setCnicFrontPreview] = useState(user.cnicFrontImage || null);
  const [cnicBackPreview, setCnicBackPreview] = useState(user.cnicBackImage || null);

  useEffect(() => {
    if (user.cnicFrontImage) setCnicFrontPreview(user.cnicFrontImage);
    if (user.cnicBackImage) setCnicBackPreview(user.cnicBackImage);
  }, [user.cnicFrontImage, user.cnicBackImage]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user._id) return toast.error("User ID not found!");

    setIsSaving(true);
    const toastId = toast.loading("Saving profile details...");

    try {
      const form = new FormData(e.target);
      const payload = {
        firstname: form.get("firstname"),
        email: form.get("email"),
        phone: form.get("phone"),
        gender: form.get("gender"),
        cnic: form.get("cnic"),
        permanentAddress: form.get("permanentAddress"),
        nationality: form.get("nationality"),
        educationQualification: form.get("educationQualification"),
      };

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

      await updateUser(user._id, payload);

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
    <form key={user._id ? `profile-form-${user._id}` : 'form'} onSubmit={handleSave} className="w-full rounded-[10px] border border-[#ECECEC] p-[14px]">
      <div className="w-full mx-auto">

        {/* Header */}
        <div className="w-full flex justify-between items-center bg-[#3758EE] text-white p-4 rounded-[10px] mb-6 shadow-md">
          <h3 className="text-[18px] font-bold">Profile Details</h3>

          <div className="flex gap-[12px] items-center">
            <button className="w-[140px] h-[40px] bg-[#A7A7A7] rounded-[4px] text-white text-[13px] lg:text-sm lg:w-[177px] hidden min-[640px]:block">
              Change Password
            </button>

            {/* Edit button for screens larger than 700px */}
            <GradiantButton className="hidden sm:flex w-[90px] h-[40px] rounded-[4px] text-sm">
              Edit
            </GradiantButton>

            {/* Gradient icon for smaller screens */}
            <GradiantButton className="flex sm:hidden w-[40px] h-[40px] justify-center items-center rounded-[8px] bg-white text-blue-600">
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
            <div className="flex items-center h-[48px] px-3 gap-2 rounded-md border border-[#E4E4E7]">
              <select className="outline-none bg-transparent">
                <option>🇺🇸 +1</option>
                <option>🇵🇰 +92</option>
                <option>🇮🇳 +91</option>
              </select>
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                defaultValue={user.phone || ""}
                className="outline-none w-full"
              />
            </div>
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
            <label className="font-medium text-[14px]">CNIC</label>
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

          {/* Back CNIC */}
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
        </div>
      </div>
      <div className="flex justify-end mt-[10px]">
        <button type="submit" disabled={isSaving} className="w-[90px] h-[40px] rounded-[4px] text-sm text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
          {isSaving ? "Saving" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default ModeratorProfile;