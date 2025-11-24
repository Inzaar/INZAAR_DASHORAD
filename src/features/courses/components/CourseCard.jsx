import Card from '../../../components/ui/Card'; // Import the generic wrapper
import GradiantButton from '../../../components/ui/buttons/GradiantButton';
import Button from '../../../components/ui/buttons/GradiantButton'; // Import your generic button

const CourseCard = ({ course }) => {
  return (
    <Card className="w-[260px] h-[305px] flex flex-col items-start justify-between gap-2">
      <div className="w-full h-[161px] rounded-[10px] relative">
        <img
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-[161px] rounded-[10px] object-cover"
      />
      <img src={course.icon} alt="profile-icon" className='absolute bottom-3 right-4 w-[10px] h-[12px]'/>
      </div>
      <div className='w-full h-[98px] flex flex-col items-start justify-between gap-1'>
        <h3 className='font-bold text-[14px]'>{course.title}</h3>
        <p className='font-[500] text-[10px]'>{course.time}</p>
        <p className='text-[12px] font-[400]'>{course.description}</p>
        </div>
        <GradiantButton className="w-[81px] h-[26px] text-[14px] font-[400] rounded-[3px]">Enroll Now</GradiantButton>
    </Card>
  );
};

export default CourseCard;