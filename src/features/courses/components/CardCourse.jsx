import { enrollCourse } from "@/api/course";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "@/assets/images/course.png"
import { useTranslation } from "react-i18next";

const CardCourse = ({ course, isAdmin = false }) => {
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const image = course.thumbnail ? course.thumbnail : img;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleEnroll = async () => {
    if (isAdmin) {
      // Navigate to admin course details page (placeholder for now)
      console.log("Navigating to admin course details for:", course.id);
      navigate(`/admin-course-view/${course.id}`);
      return;
    }

    console.log("courseid", course.id);
    setIsEnrolling(true);
    try {
      const res = await enrollCourse(course.id,);
      console.log(res);
      if (res.data.success === true) {
        navigate("/course-view?id=" + course.id);
      }
    } catch (error) {
      console.log("Enrollment error:", error);
      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        setIsAlreadyEnrolled(true);
        setErrorMessage(error.response.data.message ? t(error.response.data.message, error.response.data.message) : t("already_enrolled_msg", "You are already enrolled in this course"));
      } else {
        setIsAlreadyEnrolled(true);
        setErrorMessage(error.response?.data?.message ? t(error.response.data.message, error.response.data.message) : t("something_went_wrong_retry", "Something went wrong. Please try again."));
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

        {/* Button Section */}
        <div className="mt-1">
          <GradiantButton
            className="px-6 py-2.5 h-auto text-[14px] font-semibold rounded-lg shadow-none hover:opacity-90 active:scale-95 transition-all w-fit"
            onClick={handleEnroll}
            disabled={isEnrolling}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t("notice", "Notice")}</h3>
                <p className="text-sm text-gray-500">{errorMessage}</p>
              </div>
              <GradiantButton
                onClick={() => setIsAlreadyEnrolled(false)}
                className="w-full py-2 rounded-md"
              >
                {t("close", "Close")}
              </GradiantButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardCourse;