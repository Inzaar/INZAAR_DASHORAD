import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
import img from "../../assets/images/course2.png";
import pImage from "../../assets/logos/Abu_Yahya.png";
import GradiantButton from '../ui/buttons/GradiantButton';
import { Lock } from 'lucide-react';

const LectureCard = ({
    title = "Quran Recitation",
    lecture = "01",
    date = "10-Jan-2025",
    image = img,
    profileImage = pImage,
    className,
    isLocked = false,
    onClick
}) => {
    const { t } = useTranslation();
    return (
        <div
            onClick={!isLocked ? onClick : undefined}
            className={cn(
                "w-[273px] h-[161px] rounded-[23px] relative overflow-hidden group shrink-0",
                isLocked ? "cursor-not-allowed opacity-85" : "cursor-pointer",
                className
            )}
        >
            {/* Background Image */}
            <img
                src={image || img}
                alt={title}
                className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-transform duration-300",
                    !isLocked && "group-hover:scale-105"
                )}
            />

            {/* Dark Overlay for readability */}
            <div className={cn("absolute inset-0 transition-colors", isLocked ? "bg-black/60" : "bg-black/40")}></div>

            {/* Content Container */}
            <div className="relative h-full w-full p-4 flex flex-col justify-between">

                {/* Top Section */}
                <div className="flex justify-between items-start">
                    {/* Text Info */}
                    <div className="flex flex-col text-white">
                        <h3 className="font-semibold text-base leading-normal pb-1 mb-1 line-clamp-2">{t(title?.trim(), title)}</h3>
                        <span className="text-[10px] font-medium opacity-90">{t("lecture", "Lecture")}:{lecture}</span>
                        <span className="text-[10px] font-medium opacity-90">{t("date", "Date")}:{date}</span>
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

                {/* Bottom Section - Play or Locked Button */}
                <div className="flex justify-center mt-auto">
                    {isLocked ? (
                        <button
                            type="button"
                            disabled
                            className="px-8 py-1.5 rounded-lg text-xs font-semibold bg-black/60 text-white/80 border border-white/20 flex items-center justify-center gap-1.5 cursor-not-allowed backdrop-blur-md shadow-sm"
                        >
                            <Lock className="w-3.5 h-3.5 text-white/80" />
                            <span>{t("locked", "Locked")}</span>
                        </button>
                    ) : (
                        <GradiantButton className="px-10 py-1 rounded-lg text-sm">{t("play", "Play")}</GradiantButton>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LectureCard;
