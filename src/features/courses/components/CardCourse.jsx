import { enrollCourse } from "@/api/course";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "@/assets/images/course.png"

const CardCourse = ({ course, isAdmin = false }) => {
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const image = course.thumbnail ? course.thumbnail : img;
  const navigate = useNavigate();

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
      const res = await enrollCourse(course.id, );
      console.log(res);
      if (res.data.success === true) {
        navigate("/course-view?id=" + course.id);
      }
    } catch (error) {
      console.log("Enrollment error:", error);
      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        setIsAlreadyEnrolled(true);
        setErrorMessage(error.response.data.message || "You are already enrolled in this course");
      } else {
        setIsAlreadyEnrolled(true);
        setErrorMessage(error.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsEnrolling(false);
    }
  }

  return (
    <>
      <Card className={`w-full max-w-[380px] h-auto min-h-[305px] flex flex-col items-start rounded-[10px] justify-between gap-2 p-2 bg-white`}>
        <div className="w-full h-[161px] rounded-[10px] relative">
          <img
            src={image}
            alt={course.title}
            className="w-full h-[161px] rounded-[10px] object-cover"
          />
          {course.isNew && (
            <span className="absolute top-2 left-2 bg-[#FF4F4F] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
              New
            </span>
          )}
          <img src={course.icon} alt="profile-icon" className='absolute bottom-3 right-4 w-[15px] h-[17px]' />
        </div>
        <div className='w-full h-[98px] flex flex-col items-start justify-between gap-1'>
          <h3 className='font-bold text-[14px]'>{course.title}</h3>
          <p className='font-medium text-[10px]'>{course.time}</p>
          <p className='text-[12px] font-normal line-clamp-2 text-ellipsis overflow-hidden'>{course.description}</p>
        </div>
        <GradiantButton
          className="w-[auto] px-4 h-[26px] text-[14px] font-[400] rounded-[3px]"
          onClick={handleEnroll}
          disabled={isEnrolling}
        >
          {isAdmin ? "View Details" : "Enroll Now"}
        </GradiantButton>
      </Card>

      {isEnrolling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <h3 className="text-lg font-bold text-gray-900">Enrolling...</h3>
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
                <h3 className="text-lg font-bold text-gray-900 mb-1">Notice</h3>
                <p className="text-sm text-gray-500">{errorMessage}</p>
              </div>
              <GradiantButton
                onClick={() => setIsAlreadyEnrolled(false)}
                className="w-full py-2 rounded-md"
              >
                Close
              </GradiantButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardCourse;