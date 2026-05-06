import React from 'react';
import { cn } from "@/lib/utils";
import img from "../../assets/images/course2.png"
import pImage from "../../assets/logos/Abu_Yahya.png"
import GradiantButton from '../ui/buttons/GradiantButton';

const LectureCard = ({
    title = "Quran Recitation",
    lecture = "01",
    date = "10-Jan-2025",
    image = img,
    profileImage = pImage,
    className,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "w-[273px] h-[161px] rounded-[23px] relative overflow-hidden group shrink-0 cursor-pointer",
                className
            )}
        >
            {/* Background Image */}
            <img
                src={image || img}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content Container */}
            <div className="relative h-full w-full p-4 flex flex-col justify-between">

                {/* Top Section */}
                <div className="flex justify-between items-start">
                    {/* Text Info */}
                    <div className="flex flex-col text-white">
                        <h3 className="font-semibold text-base leading-tight mb-1">{title}</h3>
                        <span className="text-[10px] font-medium opacity-90">Lecture:{lecture}</span>
                        <span className="text-[10px] font-medium opacity-90">Date:{date}</span>
                    </div>

                    {/* Profile Image */}
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shrink-0">
                        <img
                            src={profileImage || pImage}
                            alt="Instructor"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Bottom Section - Play Button */}
                <div className="flex justify-center mt-auto">
                    <GradiantButton className="px-6 py-2 rounded-lg">Play</GradiantButton>
                </div>
            </div>
        </div>
    );
};

export default LectureCard;
