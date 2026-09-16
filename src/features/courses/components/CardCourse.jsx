import { enrollCourse } from "@/api/course";
import { getBatchesByCourse } from "@/api/batch";
import { getMyCourses } from "@/api/enrollment";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "@/assets/images/course.png"
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

const CardCourse = ({ course, isAdmin = false }) => {
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const image = course.thumbnail ? course.thumbnail : img;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  
  // Batch selection states
  const [showBatchSelectionModal, setShowBatchSelectionModal] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [enrolledBatchIds, setEnrolledBatchIds] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  const handleEnrollClick = async () => {
    if (user?.role === 'guest') {
      setShowGuestModal(true);
      return;
    }

    if (isAdmin) {
      navigate(`/admin-course-view/${course.id}`);
      return;
    }

    if (!user?.phone || user?.phone.trim() === '') {
      setShowWhatsappModal(true);
      return;
    }

    setIsLoadingBatches(true);
    try {
      const [batches, myCoursesRes] = await Promise.all([
        getBatchesByCourse(course.id),
        getMyCourses()
      ]);
      
      // Filter out completed batches
      const activeBatches = batches.filter(b => new Date(b.endDate) > new Date());
      
      if (activeBatches.length === 0) {
        toast.error("No upcoming or running batches available for this course.");
        return;
      }
      
      // Determine which batches the user is already enrolled in
      const myCourses = myCoursesRes?.data || [];
      const enrolledInThisCourse = myCourses.filter(c => c.courseId === course.id);
      const enrolledIds = enrolledInThisCourse.map(c => c.batchId).filter(Boolean);
      
      setEnrolledBatchIds(enrolledIds);
      setAvailableBatches(activeBatches);
      setShowBatchSelectionModal(true);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      toast.error("Failed to check course availability.");
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const proceedWithEnrollment = async (batchId) => {
    if (enrolledBatchIds.includes(batchId)) {
      toast("You have already enrolled in it and it will be coming soon", { icon: "⏳" });
      return;
    }
    
    setShowBatchSelectionModal(false);
    setIsEnrolling(true);
    try {
      const res = await enrollCourse(course.id, batchId);
      if (res.data.success === true) {
        // Find if the selected batch is upcoming
        const selectedBatch = availableBatches.find(b => b._id === batchId);
        const isUpcoming = selectedBatch && new Date(selectedBatch.startDate) > new Date();
        
        if (isUpcoming) {
          toast.success("Successfully enrolled. Course batch is coming soon!");
        } else {
          toast.success(t("successfully_enrolled", "You are successfully enrolled"));
          navigate("/course-view?id=" + course.id);
        }
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      const msg = error.response?.data?.message;
      
      if (msg === "You are already enrolled in this course") {
        setShouldNavigate(true);
      } else {
        setShouldNavigate(false);
      }

      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        setIsAlreadyEnrolled(true);
        setErrorMessage(msg ? t(msg, msg) : t("already_enrolled_msg", "You are already enrolled in this course"));
      } else {
        setIsAlreadyEnrolled(true);
        setErrorMessage(msg ? t(msg, msg) : t("something_went_wrong_retry", "Something went wrong. Please try again."));
      }
    } finally {
      setIsEnrolling(false);
    }
  }

  return (
    <>
      <div className="w-full max-w-[340px] flex flex-col gap-3 group animate-in fade-in duration-500">
        {/* Image Section */}
        <div className="w-full aspect-[16/10] rounded-[15px] overflow-hidden relative shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
          <img
            src={image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <img src={course.icon} alt="instructor" className="w-5 h-5 object-contain" />
          </div>
          {course.isNew && (
            <span className="absolute top-3 left-3 bg-[#FF4F4F] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] shadow-sm">
              {t("new", "New")}
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-2 px-1">
          <div className="flex justify-between items-start gap-3">
            <h3 className="font-bold text-[16px] leading-[1.3] text-gray-900 line-clamp-2 min-h-[42px]">{t(course.title?.trim(), course.title)}</h3>
            <span className="text-[11px] text-gray-400 whitespace-nowrap pt-1 font-medium">{course.date}</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <p className="text-[12px] text-gray-500 font-medium tracking-tight">{t(course.time, course.time)}</p>
            <p className="text-[12.5px] text-gray-600 line-clamp-2 leading-[1.5] font-normal min-h-[38px]">
              {t(course.description?.trim(), course.description)}
            </p>
          </div>
        </div>

        <div className="mt-1">
          <GradiantButton
            className="px-6 py-2.5 h-auto text-[14px] font-semibold rounded-lg shadow-none hover:opacity-90 active:scale-95 transition-all min-w-[140px]"
            onClick={handleEnrollClick}
            disabled={isEnrolling || isLoadingBatches}
          >
            {isAdmin ? t("view_details", "View Details") : t("enroll_now", "Enroll now")}
          </GradiantButton>
        </div>
      </div>

      {isEnrolling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <h3 className="text-lg font-bold text-gray-900">{t("enrolling", "Enrolling...")}</h3>
          </div>
        </div>
      )}

      {isAlreadyEnrolled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAlreadyEnrolled(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-4 pt-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t("notice", "Notice")}</h3>
                <p className="text-sm text-gray-500">{errorMessage}</p>
              </div>
              <GradiantButton
                onClick={() => {
                  setIsAlreadyEnrolled(false);
                  if (shouldNavigate) {
                    navigate("/course-view?id=" + course.id);
                  }
                }}
                className="w-full py-2 rounded-md"
              >
                {t("continue", "Continue")}
              </GradiantButton>
            </div>
          </div>
        </div>
      )}

      {/* Guest Enrollment Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm p-8 relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowGuestModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-5 pt-2">
              <div className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#B666E7] mb-2 border-4 border-[#F3E8FF]">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Account Required</h3>
                <p className="text-[14px] leading-relaxed text-gray-500 font-medium">
                  You are currently browsing as a guest. Please create an account or sign in to enroll in this course.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowGuestModal(false);
                  logout();
                  navigate('/login');
                }}
                className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white font-bold text-[14px] shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all"
              >
                Sign In / Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Error Modal */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm p-8 relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowWhatsappModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-5 pt-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("notice", "Notice")}</h3>
                <p className="text-[14px] leading-relaxed text-gray-500 font-medium">
                  {t("add_whatsapp_number_to_enroll", "Please add your WhatsApp number in your profile to enroll in this course.")}
                </p>
              </div>
              <GradiantButton
                onClick={() => {
                  setShowWhatsappModal(false);
                  navigate('/profile');
                }}
                className="mt-2 w-full py-2.5 rounded-xl text-[14px]"
              >
                {t("go_to_profile", "Go to Profile")}
              </GradiantButton>
            </div>
          </div>
        </div>
      )}

      {/* Batch Selection Modal */}
      {showBatchSelectionModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowBatchSelectionModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-5 pt-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Batch</h3>
                <p className="text-[14px] leading-relaxed text-gray-500 font-medium">
                  Please select which batch you would like to enroll in for {course.title}.
                </p>
              </div>
              
              <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {availableBatches.map(batch => {
                  const now = new Date();
                  const isUpcoming = new Date(batch.startDate) > now;
                  const isEnrolled = enrolledBatchIds.includes(batch._id);
                  
                  const enrollmentStart = batch.enrollmentStartDate ? new Date(batch.enrollmentStartDate) : null;
                  const enrollmentEnd = batch.enrollmentEndDate ? new Date(batch.enrollmentEndDate) : null;
                  
                  const isEnrollmentUpcoming = enrollmentStart && now < enrollmentStart;
                  const isEnrollmentClosed = enrollmentEnd && now > enrollmentEnd;
                  const isEnrollmentOpen = !isEnrollmentUpcoming && !isEnrollmentClosed;
                  
                  const isDisabled = isEnrolled || isEnrollmentUpcoming || isEnrollmentClosed;

                  return (
                    <div 
                      key={batch._id} 
                      className={`border rounded-xl p-4 flex flex-col gap-2 transition-colors ${
                        isDisabled 
                          ? 'border-gray-300 bg-gray-100 opacity-80 cursor-not-allowed' 
                          : 'border-gray-200 hover:border-[#3758EE] bg-gray-50 hover:bg-white cursor-pointer'
                      }`}
                      onClick={() => {
                        if (isEnrolled) {
                          toast("You are already enrolled in this batch.", { icon: "⏳" });
                        } else if (isEnrollmentUpcoming) {
                          toast(`Enrollment starts on ${enrollmentStart.toLocaleDateString()}`, { icon: "⏳" });
                        } else if (isEnrollmentClosed) {
                          toast(`Enrollment closed on ${enrollmentEnd.toLocaleDateString()}`, { icon: "🔒" });
                        } else {
                          proceedWithEnrollment(batch._id);
                        }
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900">
                          {isEnrolled 
                            ? (batch.name ? `${batch.name} (Enrolled)` : 'Already Enrolled') 
                            : (batch.name || (isUpcoming ? 'Upcoming Batch' : 'Running Batch'))}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isEnrolled ? 'bg-gray-200 text-gray-700' :
                          (isEnrollmentClosed ? 'bg-red-100 text-red-600' :
                           isEnrollmentUpcoming ? 'bg-orange-100 text-orange-600' :
                           'bg-green-100 text-green-600')
                        }`}>
                          {isEnrolled ? 'Enrolled' : 
                           (isEnrollmentClosed ? 'Enrollment Closed' : 
                            isEnrollmentUpcoming ? 'Enrollment Starts Soon' : 
                            'Enrollment Open')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 border-t border-gray-100 pt-2 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Course Schedule</span>
                          <span className="text-[13px]">Starts: <span className="font-semibold text-gray-800">{new Date(batch.startDate).toLocaleDateString()}</span></span>
                          <span className="text-[13px]">Ends: <span className="font-semibold text-gray-800">{new Date(batch.endDate).toLocaleDateString()}</span></span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Enrollment Window</span>
                          <span className="text-[13px]">Starts: <span className="font-semibold text-gray-800">{enrollmentStart ? enrollmentStart.toLocaleDateString() : 'N/A'}</span></span>
                          <span className="text-[13px]">Ends: <span className="font-semibold text-gray-800">{enrollmentEnd ? enrollmentEnd.toLocaleDateString() : 'N/A'}</span></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardCourse;