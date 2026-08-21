import GradiantButton from '@/components/ui/buttons/GradiantButton';
import course2 from '../../../../assets/images/course2.png'
import { IoPersonOutline } from "react-icons/io5";
import { PiStudentBold } from "react-icons/pi";
import { RiShieldUserLine } from "react-icons/ri";

function AssignBatches({
    image,
    title,
    students,
    moderators,
    performance,
    batch,
    startDate,
    endDate,
    onViewDetails
}) {
    return (
        <div className=" w-full flex flex-col rounded-2xl shadow-md bg-white p-3">
            {/* Image */}
            <div className="relative">
                <img
                    src={image || course2}
                    alt={title}
                    className="w-full h-[146px] object-cover rounded-xl"
                />

                {/* Top Overlay */}
                <div className="w-[95%] flex justify-between absolute top-2 left-3">
                    <span className="bg-white/90 text-gray-800 font-bold text-[11px] px-2 py-1 rounded flex items-center gap-1">
                        <PiStudentBold size={14} className="text-blue-600" />
                        {students}
                    </span>
                    <span className="bg-white/90 text-gray-800 font-bold text-[11px] px-2 py-1 rounded flex items-center gap-1">
                        <RiShieldUserLine size={14} className="text-purple-600" />
                        {moderators}
                    </span>
                </div>
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
            <GradiantButton onClick={onViewDetails} className="w-[87px] h-[29px] text-[12px] text-white rounded-[4px] self-center text-center mt-[5px] ">
                View Details
            </GradiantButton>

        </div>
    );
}
export default AssignBatches