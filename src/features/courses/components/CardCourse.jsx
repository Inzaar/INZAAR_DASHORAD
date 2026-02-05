import GradiantButton from "@/components/ui/buttons/GradiantButton";
import Card from "@/components/ui/Card";
import { Link } from "react-router-dom";

const CardCourse = ({ course }) => {
  return (
    <Card className={`w-full max-w-[380px] h-auto min-h-[305px] flex flex-col items-start rounded-[10px] justify-between gap-2 p-2 bg-white`}>
      <div className="w-full h-[161px] rounded-[10px] relative">
        <img
          src={course.thumbnail}
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
      <GradiantButton className="w-[81px] h-[26px] text-[14px] font-[400] rounded-[3px]"><Link to={"/course-view"}>Enroll Now</Link></GradiantButton>
    </Card>
  );
};

export default CardCourse;