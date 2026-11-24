import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaIdCard, FaEdit, FaLock, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { uploadImage } from "@/api/course";
import { updateInstructor } from "@/api/instructor";
import axiosInstance from "@/api/axiosInstance";
import PhoneInput from "@/components/ui/inputs/PhoneInput";
import EducationalQualificationInput from "@/components/shared/EducationalQualificationInput";

function InstructorProfile({ profileData, type = 'instructor', pendingProfileImage, setPendingProfileImage, onEditClick }) {
  const isStudent = type === 'student';
  const user = profileData?.user || profileData || {};
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState(user.phone || '');
  const [educationQualification, setEducationQualification] = useState(user.educationQualification || '');
  const [cnicFrontPreview, setCnicFrontPreview] = useState(user.cnicFrontImage || null);
  const [cnicBackPreview, setCnicBackPreview] = useState(user.cnicBackImage || null);

  useEffect(() => {
    setPhone(user.phone || '');
  }, [user.phone]);

  useEffect(() => {
    setEducationQualification(user.educationQualification || '');
  }, [user.educationQualification]);




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
        lastname: form.get("lastname"),
        email: form.get("email"),
        phone: phone,
        gender: form.get("gender"),
        cnic: form.get("cnic"),
        permanentAddress: form.get("permanentAddress"),
        nationality: form.get("nationality"),
        city: form.get("city"),
        educationQualification: form.get("educationQualification") !== null ? form.get("educationQualification") : educationQualification,
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

      // 1. Handle Pending Profile Image (from InstructorRoll component)
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

      const updatedRes = await updateInstructor(user._id, payload);

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


      <form key={user._id ? `profile-form-${user._id}` : 'form'} onSubmit={handleSave} className="w-full rounded-xl border border-[#ECECEC] p-3.5 sm:p-6 bg-white shadow-sm">
        <div className="w-full mx-auto">

          {/* Header */}
          <div className="w-full flex justify-between items-center mb-3 sm:mb-5">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Profile Details</h3>
          </div>

          {/* Grid Form */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

            {/* First Name / Full Name */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-medium text-xs sm:text-sm text-gray-700">{isStudent ? "Full Name" : "First name"}</label>
              <input
                type="text"
                name="firstname"
                placeholder="Enter first name"
                defaultValue={user.firstname || user.username || ""}
                className="w-full h-[42px] sm:h-[46px] rounded-lg px-3 border border-[#E4E4E7] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>

            {/* Last Name (for non-students) */}
            {!isStudent && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="font-medium text-xs sm:text-sm text-gray-700">Last name</label>
                <input
                  type="text"
                  name="lastname"
                  placeholder="Enter last name"
                  defaultValue={user.lastname || ""}
                  className="w-full h-[42px] sm:h-[46px] rounded-lg px-3 border border-[#E4E4E7] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm outline-none transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-medium text-xs sm:text-sm text-gray-700">Email</label>
              <input
                type="text"
                name="email"
                placeholder="Enter email"
                defaultValue={user.email || ""}
                className="w-full h-[42px] sm:h-[46px] rounded-lg px-3 border border-[#E4E4E7] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>

            {/* Number */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-medium text-xs sm:text-sm text-gray-700">Number</label>
              <PhoneInput
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                label={null}
                containerClassName="w-full relative"
              />
            </div>

            {/* CNIC */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-medium text-xs sm:text-sm text-gray-700">CNIC / Passport</label>
              <input
                type="text"
                name="cnic"
                placeholder="23456-2389-1"
                defaultValue={user.cnic || ""}
                className="w-full h-[42px] sm:h-[46px] rounded-lg px-3 border border-[#E4E4E7] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>

            {/* Nationality */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-medium text-xs sm:text-sm text-gray-700">Nationality</label>
              <input
                type="text"
                name="nationality"
                placeholder="Enter Your Nationality"
                defaultValue={user.nationality || ""}
                className="w-full h-[42px] sm:h-[46px] rounded-lg px-3 border border-[#E4E4E7] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-medium text-xs sm:text-sm text-gray-700">Gender</label>
              <select
                name="gender"
                className="w-full h-[42px] sm:h-[46px] rounded-lg px-3 border border-[#E4E4E7] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm outline-none bg-white transition-all"
                defaultValue={user.gender || "Choose"}
              >
                <option>Choose</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-medium text-xs sm:text-sm text-gray-700">Address</label>
              <input
                type="text"
                name="permanentAddress"
                placeholder="Enter address"
                defaultValue={user.permanentAddress || user.city || ""}
                className="w-full h-[42px] sm:h-[46px] rounded-lg px-3 border border-[#E4E4E7] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>

            {/* Educational Qualification */}
            <div className="w-full md:col-span-2">
              <EducationalQualificationInput
                value={educationQualification}
                onChange={setEducationQualification}
                label="Educational Qualification"
                labelClassName="font-medium text-xs sm:text-sm text-gray-700"
                containerClassName="flex flex-col gap-1.5 w-full"
                selectClassName="w-full h-[42px] sm:h-[46px] rounded-lg px-3 border border-[#E4E4E7] outline-none bg-white text-xs sm:text-sm"
                inputClassName="w-full h-[42px] sm:h-[46px] rounded-lg px-3 border border-[#E4E4E7] outline-none mt-2 text-xs sm:text-sm"
                placeholder="Select Educational Qualification"
                otherPlaceholder="Specify your qualification"
                name="educationQualification"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 sm:mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </>
  );
}

export default InstructorProfile;