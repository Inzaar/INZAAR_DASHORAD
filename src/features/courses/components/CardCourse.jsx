import { enrollCourse } from "@/api/course";
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

  const handleEnroll = async () => {
    if (user?.role === 'guest') {
      setShowGuestModal(true);
      return;
    }

    if (isAdmin) {
      // Navigate to admin course details page (placeholder for now)
      console.log("Navigating to admin course details for:", course.id);
      navigate(`/admin-course-view/${course.id}`);
      return;
    }

    if (!user?.phone || user?.phone.trim() === '') {
      setShowWhatsappModal(true);
      return;
    }

    console.log("courseid", course.id);
    setIsEnrolling(true);
    try {
      const res = await enrollCourse(course.id,);
      console.log(res);
      if (res.data.success === true) {
        toast.success(t("successfully_enrolled", "You are successfully enrolled"));
        navigate("/course-view?id=" + course.id);
      }
    } catch (error) {
      console.log("Enrollment error:", error);
      const msg = error.response?.data?.message;
      
      // Only navigate to course view if they are actually enrolled
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
            onClick={course.isEnrolled ? () => navigate("/course-view?id=" + course.id) : handleEnroll}
            disabled={isEnrolling}
          >
            {isAdmin ? t("view_details", "View Details") : (course.isEnrolled ? t("already_enroll", "Already enroll") : t("enroll_now", "Enroll now"))}
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
    </>
  );
};

export default CardCourse;