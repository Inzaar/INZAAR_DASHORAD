import React from 'react';
import { MoreHorizontal, Mail, Phone } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';

import defaultMaleImg from '@/assets/images/dummy-male.svg';
import defaultFemaleImg from '@/assets/images/dummy-female.svg';

const UserCard = ({
    name = "User",
    id,
    image,
    performance = "88%",
    joiningDate = "7/10/2025",
    email = "user@example.com",
    phone = "(229) 555-0109",
    status = "online",
    performanceLabel = "Performance",
    hideJoiningDate = false,
    gender,
    onViewClick
}) => {
    const displayImage = image || (gender?.toLowerCase() === 'female' ? defaultFemaleImg : defaultMaleImg);

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 w-full max-w-[450px] relative font-sans min-w-0">
            {/* Header: Avatar, Name, Menu */}
            <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4 min-w-0">
                <div className="flex flex-col gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                        <img
                            src={displayImage}
                            alt={name}
                            className="w-full h-full rounded-[10px] object-cover border-2 border-white shadow-sm"
                        />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white ${status === 'online' ? 'bg-green-500' : status === 'deleted' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate" title={name}>{name}</h3>
                        {/* <p className="text-sm text-gray-500">{id}</p> */}
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-1">
                    <MoreHorizontal size={18} className="sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-[#EFF2FF] rounded-xl p-3 sm:p-4 mb-3.5 sm:mb-5">
                <div className="flex justify-between items-center gap-2 mb-2.5 sm:mb-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] sm:text-xs font-medium text-blue-500 mb-0.5 truncate">{performanceLabel}</span>
                        <span className="text-xs sm:text-sm font-bold text-blue-700 truncate">{performance}</span>
                    </div>
                    {!hideJoiningDate && (
                        <div className="flex flex-col text-right min-w-0 shrink-0">
                            <span className="text-[11px] sm:text-xs font-medium text-blue-500 mb-0.5">Joining Date</span>
                            <span className="text-xs sm:text-sm font-bold text-blue-700 whitespace-nowrap">{joiningDate}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-medium min-w-0">
                        <Mail size={14} className="shrink-0 sm:w-4 sm:h-4" />
                        <span className="truncate min-w-0" title={email}>{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-medium min-w-0">
                        <Phone size={14} className="shrink-0 sm:w-4 sm:h-4" />
                        <span className="truncate min-w-0" title={phone}>{phone}</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
                <GradiantButton
                    onClick={onViewClick}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#5B4DFF] to-[#8F85FF] text-white font-semibold py-2 px-8 sm:px-10 rounded-lg text-xs sm:text-sm shadow-md sm:shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all"
                >
                    View
                </GradiantButton>
            </div>
        </div>
    );
};

export default UserCard;
