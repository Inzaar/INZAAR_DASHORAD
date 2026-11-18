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
  const [enrolledLocally, setEnrolledLocally] = useState(false);
  const isEnrolled = Boolean(course?.isEnrolled || enrolledLocally);
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
  const [enrolledBatchMap, setEnrolledBatchMap] = useState({});
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  const handleEnrollClick = async () => {
    if (isLoadingBatches || isEnrolling) return;

    if (user?.role === 'guest') {
      setShowGuestModal(true);
      return;
    }

    if (isAdmin) {
      navigate(`/admin-course-view/${course.id || course._id}`);
      return;
    }

    const courseId = course.id || course._id;

    if (!isEnrolled && (!user?.phone || user?.phone.trim() === '')) {
      setShowWhatsappModal(true);
      return;
    }

    setIsLoadingBatches(true);
    try {
      const [batches, myCoursesRes] = await Promise.all([
        getBatchesByCourse(courseId),
        getMyCourses()
      ]);
      
      // Determine which batches the user is already enrolled in
      const myCourses = myCoursesRes?.data || [];
      const enrolledInThisCourse = myCourses.filter(c => String(c.courseId) === String(courseId));
      const enrolledIds = enrolledInThisCourse.map(c => String(c.batchId)).filter(Boolean);
      
      const batchMap = {};
      enrolledInThisCourse.forEach(c => {
        if (c.batchId) {
          batchMap[String(c.batchId)] = c.enrollmentId;
        }
      });

      const allBatches = Array.isArray(batches) ? batches : [];
      // Filter out completed batches (unless student is enrolled in that batch)
      const activeBatches = allBatches.filter(b => 
        new Date(b.endDate) > new Date() || enrolledIds.includes(String(b._id))
      );

      // If user is enrolled but enrolledIds is empty (e.g. legacy enrollment without batchId)
      if (isEnrolled && enrolledIds.length === 0 && activeBatches.length > 0) {
        const fallbackEnrollmentId = enrolledInThisCourse[0]?.enrollmentId || course?.enrollmentId;
        enrolledIds.push(String(activeBatches[0]._id));
        batchMap[String(activeBatches[0]._id)] = fallbackEnrollmentId;
      }
      
      setEnrolledBatchMap(batchMap);
      setEnrolledBatchIds(enrolledIds);

      if (activeBatches.length === 0) {
        if (isEnrolled) {
          if (course?.enrollmentId) {
            navigate(`/course-view?id=${courseId}&enrollmentId=${course.enrollmentId}`);
          } else {
            navigate(`/course-view?id=${courseId}`);
          }
          return;
        }
        toast.error("No upcoming or running batches available for this course.");
        return;
      }
      
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
    if (isLoadingBatches || isEnrolling) return;

    if (enrolledBatchIds.some(id => String(id) === String(batchId))) {
      toast("You have already enrolled in it and it will be coming soon", { icon: "⏳" });
      return;
    }
    
    setShowBatchSelectionModal(false);
    setIsEnrolling(true);
    try {
      const courseId = course.id || course._id;
      const res = await enrollCourse(courseId, batchId);
      if (res.data.success === true) {
        setEnrolledLocally(true);
        // Find if the selected batch is upcoming
        const selectedBatch = availableBatches.find(b => String(b._id) === String(batchId));
        const isUpcoming = selectedBatch && new Date(selectedBatch.startDate) > new Date();
        
        if (isUpcoming) {
          toast.success("Successfully enrolled. Course batch is coming soon!");
        } else {
          toast.success(t("successfully_enrolled", "You are successfully enrolled"));
          const newEnrollmentId = res.data?.data?._id || res.data?.data?.id;
          navigate(newEnrollmentId ? `/course-view?id=${courseId}&enrollmentId=${newEnrollmentId}` : `/course-view?id=${courseId}`);
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
              {course.description || t("course_desc_unavailable", "Course description unavailable")}
            </p>
          </div>
        </div>

        <div className="mt-1">
          <GradiantButton
            className={`px-6 py-2.5 h-auto text-[14px] font-semibold rounded-lg shadow-none hover:opacity-90 active:scale-95 transition-all min-w-[140px] ${(isEnrolling || isLoadingBatches) ? 'opacity-80 pointer-events-none cursor-wait' : ''}`}
            onClick={handleEnrollClick}
            disabled={isEnrolling || isLoadingBatches}
          >
            {isLoadingBatches ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t("checking", "Checking...")}</span>
              </span>
            ) : isEnrolling ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t("enrolling", "Enrolling...")}</span>
              </span>
            ) : (
              isAdmin ? t("view_details", "View Details") : isEnrolled ? t("already_enrolled", "Already Enrolled") : t("enroll_now", "Enroll now")
            )}
          </GradiantButton>
        </div>
      </div>

      {(isEnrolling || isLoadingBatches) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-wait">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-7 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 border-4 border-purple-100 border-t-[#3758EE] border-r-[#B666E7] rounded-full animate-spin"></div>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-gray-900">
                {isEnrolling ? t("enrolling_in_course", "Enrolling in Course...") : t("checking_availability", "Checking Batches...")}
              </h3>
              <p className="text-xs text-gray-500">
                {isEnrolling 
                  ? t("enrolling_wait_msg", "Please wait while we complete your enrollment. Do not refresh or tap again.") 
                  : t("checking_batches_msg", "Finding available batches for this course...")}
              </p>
            </div>
          </div>
        </div>
      )}

      {isAlreadyEnrolled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 sm:p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAlreadyEnrolled(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{t("notice", "Notice")}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{errorMessage}</p>
              </div>
              <GradiantButton
                onClick={() => {
                  setIsAlreadyEnrolled(false);
                  if (shouldNavigate) {
                    navigate("/course-view?id=" + course.id);
                  }
                }}
                className="w-full py-2 rounded-xl text-xs sm:text-sm"
              >
                {t("continue", "Continue")}
              </GradiantButton>
            </div>
          </div>
        </div>
      )}

      {/* Guest Enrollment Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl sm:rounded-[1.5rem] shadow-2xl w-full max-w-sm p-5 sm:p-7 md:p-8 relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowGuestModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-4 sm:gap-5 pt-1 sm:pt-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#B666E7] mb-1 sm:mb-2 border-4 border-[#F3E8FF]">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Account Required</h3>
                <p className="text-xs sm:text-[14px] leading-relaxed text-gray-500 font-medium">
                  You are currently browsing as a guest. Please create an account or sign in to enroll in this course.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowGuestModal(false);
                  logout('/app/login');
                }}
                className="mt-1 sm:mt-2 w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white font-bold text-xs sm:text-[14px] shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all"
              >
                Sign In / Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Error Modal */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl sm:rounded-[1.5rem] shadow-2xl w-full max-w-sm p-5 sm:p-7 md:p-8 relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowWhatsappModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-4 sm:gap-5 pt-1 sm:pt-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">{t("notice", "Notice")}</h3>
                <p className="text-xs sm:text-[14px] leading-relaxed text-gray-500 font-medium">
                  {t("add_whatsapp_number_to_enroll", "Please add your WhatsApp number in your profile to enroll in this course.")}
                </p>
              </div>
              <GradiantButton
                onClick={() => {
                  setShowWhatsappModal(false);
                  navigate('/profile');
                }}
                className="mt-1 sm:mt-2 w-full py-2.5 rounded-xl text-xs sm:text-[14px]"
              >
                {t("go_to_profile", "Go to Profile")}
              </GradiantButton>
            </div>
          </div>
        </div>
      )}

      {/* Batch Selection Modal */}
      {showBatchSelectionModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl sm:rounded-[1.5rem] shadow-2xl w-full max-w-lg p-4 sm:p-6 md:p-8 relative animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col">
            <button
              onClick={() => setShowBatchSelectionModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-gray-100 z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-3 sm:gap-5 pt-1 sm:pt-2 min-h-0 flex-1">
              <div className="pr-6 sm:pr-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{t("select_a_batch", "Select a Batch")}</h3>
                <p className="text-xs sm:text-[14px] leading-relaxed text-gray-500 font-medium line-clamp-2 sm:line-clamp-none">
                  {t("select_batch_desc", "Please select which batch you would like to enroll in for")} <span className="font-semibold text-gray-800">{course.title}</span>.
                </p>
              </div>
              
              <div className="flex flex-col gap-2.5 sm:gap-3 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar flex-1 min-h-0">
                {availableBatches.map(batch => {
                  const now = new Date();
                  const isUpcoming = new Date(batch.startDate) > now;
                  const isBatchEnrolled = enrolledBatchIds.some(id => String(id) === String(batch._id));
                  
                  const enrollmentStart = batch.enrollmentStartDate ? new Date(batch.enrollmentStartDate) : null;
                  const enrollmentEnd = batch.enrollmentEndDate ? new Date(batch.enrollmentEndDate) : null;
                  
                  const isEnrollmentUpcoming = enrollmentStart && now < enrollmentStart;
                  const isEnrollmentClosed = enrollmentEnd && now > enrollmentEnd;
                  const isEnrollmentOpen = !isEnrollmentUpcoming && !isEnrollmentClosed;
                  
                  const isDisabled = !isBatchEnrolled && (isEnrollmentUpcoming || isEnrollmentClosed);

                  return (
                    <div 
                      key={batch._id} 
                      className={`border rounded-xl p-3 sm:p-4 flex flex-col gap-2 transition-colors ${
                        isDisabled || isEnrolling || isLoadingBatches
                          ? 'border-gray-300 bg-gray-100 opacity-80 cursor-not-allowed pointer-events-none' 
                          : 'border-gray-200 hover:border-[#3758EE] bg-gray-50 hover:bg-white cursor-pointer active:scale-[0.99]'
                      }`}
                      onClick={() => {
                        if (isEnrolling || isLoadingBatches) return;
                        if (isBatchEnrolled) {
                          setShowBatchSelectionModal(false);
                          const courseId = course.id || course._id;
                          const enrollmentId = enrolledBatchMap[String(batch._id)] || course?.enrollmentId;
                          if (enrollmentId) {
                            navigate(`/course-view?id=${courseId}&enrollmentId=${enrollmentId}`);
                          } else {
                            navigate(`/course-view?id=${courseId}`);
                          }
                        } else if (isEnrollmentUpcoming) {
                          toast(`Enrollment starts on ${enrollmentStart.toLocaleDateString()}`, { icon: "⏳" });
                        } else if (isEnrollmentClosed) {
                          toast(`Enrollment closed on ${enrollmentEnd.toLocaleDateString()}`, { icon: "🔒" });
                        } else {
                          proceedWithEnrollment(batch._id);
                        }
                      }}
                    >
                      {/* Header with Title and Badge (No overlap!) */}
                      <div className="flex flex-row justify-between items-start gap-2 mb-1">
                        <span className="font-bold text-[13.5px] sm:text-[15px] text-gray-900 leading-snug break-words min-w-0 flex-1">
                          {isBatchEnrolled 
                            ? (batch.name ? `${batch.name} (Enrolled)` : 'Already Enrolled') 
                            : (batch.name || (isUpcoming ? 'Upcoming Batch' : 'Running Batch'))}
                        </span>
                        <span className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0 whitespace-nowrap text-center ${
                          isBatchEnrolled ? 'bg-gray-200 text-gray-700' :
                          (isEnrollmentClosed ? 'bg-red-100 text-red-600' :
                           isEnrollmentUpcoming ? 'bg-orange-100 text-orange-600' :
                           'bg-green-100 text-green-600')
                        }`}>
                          {isBatchEnrolled ? 'Enrolled' : 
                           (isEnrollmentClosed ? 'Enrollment Closed' : 
                            isEnrollmentUpcoming ? 'Enrollment Starts Soon' : 
                            'Enrollment Open')}
                        </span>
                      </div>

                      {/* Schedule details */}
                      <div className="text-xs sm:text-sm text-gray-600 grid grid-cols-2 gap-2 sm:gap-3 border-t border-gray-100 pt-2 mt-0.5">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Course Schedule</span>
                          <span className="text-[11px] min-[360px]:text-[12px] sm:text-[13px] leading-tight text-gray-600 truncate">
                            Starts: <span className="font-semibold text-gray-800">{new Date(batch.startDate).toLocaleDateString()}</span>
                          </span>
                          <span className="text-[11px] min-[360px]:text-[12px] sm:text-[13px] leading-tight text-gray-600 truncate mt-0.5">
                            Ends: <span className="font-semibold text-gray-800">{new Date(batch.endDate).toLocaleDateString()}</span>
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Enrollment Window</span>
                          <span className="text-[11px] min-[360px]:text-[12px] sm:text-[13px] leading-tight text-gray-600 truncate">
                            Starts: <span className="font-semibold text-gray-800">{enrollmentStart ? enrollmentStart.toLocaleDateString() : 'N/A'}</span>
                          </span>
                          <span className="text-[11px] min-[360px]:text-[12px] sm:text-[13px] leading-tight text-gray-600 truncate mt-0.5">
                            Ends: <span className="font-semibold text-gray-800">{enrollmentEnd ? enrollmentEnd.toLocaleDateString() : 'N/A'}</span>
                          </span>
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