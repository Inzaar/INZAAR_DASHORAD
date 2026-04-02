import React, { useState, useRef, useEffect } from "react";
import Profileimg from "@/assets/images/course.png";
import toast from "react-hot-toast";

function ModeratorRoll({ profileData, type = 'moderator', pendingProfileImage, setPendingProfileImage }) {
  const user = profileData?.user || {};
  const isStudent = type === 'student';
  const assignedBatches = user.assignedBatches || [];
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
    <div className="w-full lg:w-[50%] h-auto lg:h-[301px] sm:w-full border rounded-[8px] pr-[10px] pl-[20px] flex lg:flex-row max-[620px]:flex-col bg-white shadow-sm">
      <div className="w-full lg:w-[230px] h-auto lg:h-[301px] pt-[10px] pb-[10px] gap-[8px] flex flex-col items-center shrink-0">
        <h3 className="text-center text-[12px] font-medium text-gray-500 uppercase tracking-wider">PROFILE IMAGE</h3>
        <div className="relative w-full h-[236px]">
          <img 
            src={currentImage} 
            className="w-full h-full object-cover rounded-[10px] border border-gray-100 transition-all duration-300 shadow-sm" 
            alt="ProfilePreview"
          />
        </div>
        <label className="text-blue-600 text-sm font-semibold cursor-pointer text-center block mt-[2px] hover:underline transition-all active:scale-95">
          Choose Profile Image
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
          <div>
            <h6 className="text-[12px] font-medium text-gray-400 uppercase mb-1 tracking-wider">
              {isStudent ? "Full Name" : "Role"}
            </h6>
            <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px] text-sm font-medium capitalize border border-gray-50 shadow-inner">
              {isStudent ? (user.firstname || user.username || "Muhammad Zain") : (user.role || "Junior Moderator")}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <h6 className="text-[12px] font-medium text-gray-400 uppercase mb-1 tracking-wider">
              {isStudent ? "Enroll Courses" : "System Roll"}
            </h6>
            {/* Scrollable list — only ~2 items visible, rest scroll */}
            <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[80px] pr-1">
              {isStudent ? (
                <>
                  <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] flex items-center px-[10px] flex-shrink-0 border border-gray-50 shadow-sm">
                    <a href="#" className="text-[#3758EE] text-[13px] font-medium underline underline-offset-4 decoration-1 decoration-blue-200 hover:decoration-blue-500 transition-all">
                      Akhrat Kay Dalail ( Batch - 10 )
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {batchCoursePairs.length > 0 ? (
                    batchCoursePairs.map((pair, idx) => (
                      <div key={idx} className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] flex-shrink-0 border border-gray-50 shadow-sm">
                        <a href="#" className="text-[#265CEB] text-sm underline decoration-[#265CEB] truncate font-medium">
                          {pair.courseName} ( {pair.batchName} )
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] flex items-center px-[10px] flex-shrink-0 text-gray-400 italic text-sm border border-gray-50 shadow-inner">
                      No batches assigned
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {!isStudent && (
            <div className="mt-auto pb-1">
              <h6 className="text-[12px] font-medium text-gray-400 uppercase mb-1 tracking-wider">Employment Type</h6>
              <select
                className="w-full h-[36px] bg-[#F6F6F6] rounded-[6px] text-[#1A1A1A] text-sm font-medium outline-none border border-gray-50 shadow-sm cursor-pointer hover:border-gray-200 transition-all focus:ring-1 focus:ring-blue-100"
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