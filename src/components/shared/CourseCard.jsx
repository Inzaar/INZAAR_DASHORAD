import React from 'react';
import { cn } from "@/lib/utils";
import { Link, useNavigate } from 'react-router-dom';
import img from '@/assets/images/course.png';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const CourseCard = ({
    title = "Course Title",
    image = img,
    completed = 0,
    total = 0,
    className,
    id,
    batchStartDate
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

    const handleClick = (e) => {
        if (batchStartDate && new Date(batchStartDate) > new Date()) {
            e.preventDefault();
            toast("Coming soon! This course batch hasn't started yet.", { icon: "⏳" });
        } else {
            navigate(`/course-view?id=${id}`);
        }
    };

    return (
        <div onClick={handleClick} className={cn(
            "w-full max-w-[301px] h-[250px] bg-white rounded-[10px] border-[0.8px] border-[#E1E1E1] p-[10px] flex flex-col gap-[10px] cursor-pointer",
            className
        )}>
            {/* Image Section */}
            <div className="w-full min-h-[140px] flex-1 rounded-[6px] overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-2">
                <h3 className="font-bold text-md text-black leading-normal pb-1">
                    {t(title?.trim(), title)}
                </h3>

                {/* Progress Section */}
                <div className="flex flex-col gap-1.5 mt-1">
                    <div className="text-right">
                        <span className="text-[#3758EE] font-medium text-sm">{completed}</span>
                        <span className="text-gray-400 text-sm">/{total} {t('lectures', 'Lectures')}</span>
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
        </div>
    );
};

export default CourseCard;
