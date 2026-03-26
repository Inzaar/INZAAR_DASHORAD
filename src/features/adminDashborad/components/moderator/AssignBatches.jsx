import GradiantButton from '@/components/ui/buttons/GradiantButton';
import course2 from '../../../../assets/images/course2.png'
import { IoPersonOutline } from "react-icons/io5";
function AssignBatches({
    image,
    title,
    students,
    moderators,
    performance,
    batch,
    startDate,
    endDate
}) {
    return (
        <div className=" w-full flex flex-col rounded-2xl shadow-md bg-white p-3">
            {/* Image */}
            <div className="relative">
                <img
                    src={course2}
                    alt="course"
                    className="w-full h-[146px] object-cover rounded-xl"
                />

                {/* Top Overlay */}
                <div className=" text-white w-[95%] h-[27px] flex justify-between absolute top-2 left-3 ">
                    <div className=' w-[45px] h-[27px] flex items-center '>
                        <div className='w-[22px] h-[27px]'>
                            <IoPersonOutline className="text-white" />
                            <p className="text-[5px]">Students</p>
                        </div>
                        {students}
                    </div>
                    <div className=' w-[52px] h-[27px] flex items-center '>
                        <div className='w-[29px] h-[27px]'>
                            <IoPersonOutline className="text-white" />
                            <p className="text-[5px]">Moderator's</p>
                        </div>
                        {moderators}
                    </div>
                </div>
                {/*  */}
            </div>

            {/* Title */}
            <h2 className="font-semibold mt-2">{title}</h2>

            {/* Info Box */}
            <div className="bg-[#F2F2FF] rounded-xl p-3 mt-2 flex justify-between text-sm">

                <div>
                    <p className="text-[#265CEB]">Performance</p>
                    <p className="font-semibold text-[#265CEB]">{performance}</p>

                    <p className="text-[#265CEB] mt-2">Batch</p>
                    <p className='font-semibold text-[#265CEB]'>{batch}</p>
                </div>

                <div className="text-right">
                    <p className="text-[#265CEB]">Starting Date</p>
                    <p className='font-semibold text-[#265CEB]'>{startDate}</p>

                    <p className="text-[#265CEB] mt-2">Ending Date</p>
                    <p className='font-semibold text-[#265CEB]'>{endDate}</p>
                </div>

            </div>

            {/* Button */}
            <GradiantButton className="w-[87px] h-[29px] text-[12px] text-white rounded-[4px] self-center text-center mt-[5px] ">
                View Details
            </GradiantButton>

        </div>
    );
}
export default AssignBatches