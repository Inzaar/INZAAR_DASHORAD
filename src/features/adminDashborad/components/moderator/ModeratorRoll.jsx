import React, { useState, useRef, useEffect, useCallback } from "react";
import Profileimg from "@/assets/images/course.png";
import toast from "react-hot-toast";
import Cropper from 'react-easy-crop';

// Utility to crop image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      blob.name = 'cropped.jpg';
      resolve(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg');
  });
}

function ModeratorRoll({ profileData, type = 'moderator', pendingProfileImage, setPendingProfileImage }) {
  const user = profileData?.user || {};
  const isStudent = type === 'student';
  const assignedBatches = profileData?.assignedBatches || [];
  const fileInputRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(Profileimg);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const resolveImageUrl = (url) => {
    if (!url) return Profileimg;
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.includes('localhost:8000/uploads')) {
      return url.replace('http://localhost:8000', 'https://inzaar.duckdns.org');
    }
    if (url.startsWith('/uploads')) {
      return `https://inzaar.duckdns.org${url}`;
    }
    return url;
  };

  useEffect(() => {
    if (pendingProfileImage) {
      const previewUrl = URL.createObjectURL(pendingProfileImage);
      setCurrentImage(previewUrl);
      return () => URL.revokeObjectURL(previewUrl); // Cleanup
    } else if (user?.profileImageUrl) {
      setCurrentImage(resolveImageUrl(user.profileImageUrl));
    } else {
      setCurrentImage(Profileimg);
    }
  }, [user?.profileImageUrl, pendingProfileImage]);

  // Build batch-course pairs from API
  const batchCoursePairs = assignedBatches
    .filter(b => b && b.courseId && b.courseId.title && !b.isDeleted && !b.courseId?.isDeleted)
    .map(b => ({ courseName: b.courseId.title, batchName: b.name || 'N/A' }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropImageSrc(reader.result);
      setShowCropModal(true);
    });
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      setIsCropping(true);
      const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      setPendingProfileImage(croppedFile);
      setShowCropModal(false);
    } catch (e) {
      toast.error("Failed to crop image");
      console.error(e);
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <div className="w-full lg:w-[50%] h-auto lg:h-[301px] sm:w-full border border-[#ECECEC] rounded-[12px] pr-[10px] pl-[20px] flex lg:flex-row max-[620px]:flex-col bg-white shadow-sm text-gray-900">
      <div className="w-full lg:w-[230px] h-auto lg:h-[301px] pt-[10px] pb-[10px] gap-[8px] flex flex-col items-center shrink-0">
        <h3 className="text-center text-[12px] font-bold text-gray-500 uppercase tracking-wider">PROFILE IMAGE</h3>
        <div className="relative w-full h-[236px]">
          <img
            src={currentImage}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = Profileimg;
            }}
            className="w-full h-full object-cover rounded-[10px] border border-gray-100 transition-all duration-300 shadow-sm"
            alt="ProfilePreview"
          />
        </div>
        <label className="text-blue-600 text-sm font-bold cursor-pointer text-center block mt-[2px] hover:text-blue-700 transition-all active:scale-95">
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
            <h6 className="text-[12px] font-bold text-gray-500 uppercase mb-1 tracking-wider opacity-90">
              {isStudent ? "Full Name" : "Role"}
            </h6>
            <div className="w-full h-[36px] bg-[#F8F9FA] rounded-[6px] text-gray-900 flex items-center px-[10px] text-sm font-medium capitalize border border-gray-200">
              {isStudent ? (user.firstname || user.username || "Muhammad Zain") : (user.role || "Junior Moderator")}
            </div>
          </div>

          {/* Enroll Courses / System Roll */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <h6 className="text-[12px] font-bold text-gray-500 uppercase mb-1 tracking-wider opacity-90">
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
                    <div className="w-full h-[40px] bg-gray-50 rounded-[6px] flex items-center px-[10px] text-gray-500 italic text-sm border border-gray-200">
                      No courses enrolled
                    </div>
                  )}
                </>
              ) : (
                <>
                  {batchCoursePairs.length > 0 ? (
                    batchCoursePairs.map((pair, idx) => (
                      <div key={idx} className="w-full h-[40px] bg-blue-50 text-blue-600 rounded-[6px] flex items-center px-[10px] flex-shrink-0 border border-blue-100 shadow-sm font-bold">
                        {pair.courseName} ( {pair.batchName} )
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-[40px] bg-gray-50 rounded-[6px] flex items-center px-[10px] flex-shrink-0 text-gray-500 italic text-sm border border-gray-200">
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
            .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
            .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          `}} />

          {/* Employment Type (moderator only) */}
          {!isStudent && (
            <div className="mt-auto pb-1">
              <h6 className="text-[12px] font-bold text-gray-500 uppercase mb-1 tracking-wider opacity-90">Employment Type</h6>
              <select
                className="w-full h-[36px] bg-white text-[#1A1A1A] rounded-[6px] text-sm font-bold outline-none border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all focus:ring-2 focus:ring-blue-300"
                defaultValue={user.employmentType || "Full-time"}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          )}

        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Crop Profile Image</h3>
              <button onClick={() => setShowCropModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="relative w-full h-[300px] bg-gray-900">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-4 bg-gray-50 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCropSave}
                  disabled={isCropping}
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isCropping ? "Cropping..." : "Crop & Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModeratorRoll;