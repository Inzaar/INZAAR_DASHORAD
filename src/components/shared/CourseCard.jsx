import React from 'react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

const CourseCard = ({
    title = "Course Title",
    image = img,
    completed = 0,
    total = 0,
    className,
    id
}) => {
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

    return (
        <Link to={`/course-view?id=${id}`} className={cn(
            "w-[301px] h-[250px] bg-white rounded-[10px] border-[0.8px] border-[#E1E1E1] p-[10px] flex flex-col gap-[10px]",
            className
        )}>
            {/* Image Section */}
            <div className="w-full min-h-[140px] rounded-[6px] overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-2">
                <h3 className="font-bold text-md text-black leading-tight">
                    {title}
                </h3>

                {/* Progress Section */}
                <div className="flex flex-col gap-1.5 mt-1">
                    <div className="text-right">
                        <span className="text-[#3758EE] font-medium text-sm">{completed}</span>
                        <span className="text-gray-400 text-sm">/{total} Lectures</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#A892FF] rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
