import React, { useState, useRef, useEffect } from "react";
import Profileimg from "@/assets/images/course.png";
import toast from "react-hot-toast";

function ModeratorRoll({ profileData, type = 'moderator', pendingProfileImage, setPendingProfileImage }) {
  const user = profileData?.user || {};
  const isStudent = type === 'student';
  const assignedBatches = profileData?.assignedBatches || [];
  const fileInputRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(Profileimg);

  useEffect(() => {
    // Priority: 
    // 1. New pending image file (local preview)
    // 2. Existing profileImageUrl from API
    // 3. Static placeholder
    if (pendingProfileImage) {
      const previewUrl = URL.createObjectURL(pendingProfileImage);
      setCurrentImage(previewUrl);
      return () => URL.revokeObjectURL(previewUrl); // Cleanup
    } else if (user?.profileImageUrl) {
      setCurrentImage(user.profileImageUrl);
    } else {
      setCurrentImage(Profileimg);
    }
  }, [user?.profileImageUrl, pendingProfileImage]);

  // Build batch-course pairs from API
  const batchCoursePairs = assignedBatches
    .filter(b => b.courseId && b.courseId.title)
    .map(b => ({ courseName: b.courseId.title, batchName: b.name || 'N/A' }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }

    // Pass the file to the parent component for later upload on 'Save'
    setPendingProfileImage(file);
  };

  return (
    <div className="w-full lg:w-[50%] h-auto lg:h-[301px] sm:w-full border-none rounded-[12px] pr-[10px] pl-[20px] flex lg:flex-row max-[620px]:flex-col bg-[#3758EE] shadow-xl text-white">
      <div className="w-full lg:w-[230px] h-auto lg:h-[301px] pt-[10px] pb-[10px] gap-[8px] flex flex-col items-center shrink-0">
        <h3 className="text-center text-[12px] font-bold text-blue-100 uppercase tracking-wider">PROFILE IMAGE</h3>
        <div className="relative w-full h-[236px]">
          <img
            src={currentImage}
            className="w-full h-full object-cover rounded-[10px] border border-gray-100 transition-all duration-300 shadow-sm"
            alt="ProfilePreview"
          />
        </div>
        <label className="text-white text-sm font-bold cursor-pointer text-center block mt-[2px] hover:text-blue-100 transition-all active:scale-95">
          Change Profile Image
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
          />
        </label>
      </div>

      <div className="flex-1 h-auto lg:h-[301px] rounded-[8px] pt-4 pr-[4px] pb-[11px] pl-[14px] overflow-hidden">
        <div className="w-full h-full flex flex-col gap-3">

          {/* Full Name / Role */}
          <div>
            <h6 className="text-[12px] font-bold text-blue-100 uppercase mb-1 tracking-wider opacity-90">
              {isStudent ? "Full Name" : "Role"}
            </h6>
            <div className="w-full h-[36px] bg-white/10 backdrop-blur-md rounded-[6px] text-white flex items-center px-[10px] text-sm font-medium capitalize border border-white/10">
              {isStudent ? (user.firstname || user.username || "Muhammad Zain") : (user.role || "Junior Moderator")}
            </div>
          </div>

          {/* Enroll Courses / System Roll */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <h6 className="text-[12px] font-bold text-blue-100 uppercase mb-1 tracking-wider opacity-90">
              {isStudent ? "Enroll Courses" : "System Roll"}
            </h6>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1 max-h-[120px] custom-scrollbar-thin">
              {isStudent ? (
                <>
                  {(profileData?.enrolledBatches || []).length > 0 ? (
                    profileData.enrolledBatches.map((pair, idx) => (
                      <div key={idx} className="w-full h-[40px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] flex-shrink-0 border border-gray-50 shadow-sm">
                        <a href="#" className="text-[#3758EE] text-[13px] font-medium underline underline-offset-4 decoration-1 decoration-blue-200 hover:decoration-blue-500 transition-all truncate block">
                          {pair.courseName} ( {pair.batchName} )
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-[40px] bg-white/10 rounded-[6px] flex items-center px-[10px] text-blue-100 italic text-sm border border-white/10">
                      No courses enrolled
                    </div>
                  )}
                </>
              ) : (
                <>
                  {batchCoursePairs.length > 0 ? (
                    batchCoursePairs.map((pair, idx) => (
                      <div key={idx} className="w-full h-[40px] bg-white text-blue-600 rounded-[6px] flex items-center px-[10px] flex-shrink-0 border border-white/20 shadow-sm font-bold">
                        {pair.courseName} ( {pair.batchName} )
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-[40px] bg-white/10 rounded-[6px] flex items-center px-[10px] flex-shrink-0 text-blue-100 italic text-sm border border-white/10">
                      No batches assigned
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            .custom-scrollbar-thin::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar-thin::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
            .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
            .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
          `}} />

          {/* Employment Type (moderator only) */}
          {!isStudent && (
            <div className="mt-auto pb-1">
              <h6 className="text-[12px] font-bold text-blue-100 uppercase mb-1 tracking-wider opacity-90">Employment Type</h6>
              <select
                className="w-full h-[36px] bg-white text-[#1A1A1A] rounded-[6px] text-sm font-bold outline-none border border-white/20 shadow-sm cursor-pointer hover:bg-blue-50 transition-all focus:ring-2 focus:ring-blue-300"
                defaultValue={user.employmentType || "Full-time"}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ModeratorRoll;