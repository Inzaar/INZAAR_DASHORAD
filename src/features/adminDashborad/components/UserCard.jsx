import React from 'react';
import { MoreHorizontal, Mail, Phone } from 'lucide-react';
import GradiantButton from '@/components/ui/buttons/GradiantButton';

const UserCard = ({
    name = "Mudassar",
    // id = "635261",
    id= user._id,
    image = "https://randomuser.me/api/portraits/men/32.jpg",
    performance = "88%",
    joiningDate = "7/10/2025",
    email = "Mudassar123@gmail.com",
    phone = "(229) 555-0109",
    status = "online",
    onViewClick
}) => {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full max-w-[450px] relative font-sans">
            {/* Header: Avatar, Name, Menu */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-3">
                    <div className="relative w-14 h-14">
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{name}</h3>
                        {/* <p className="text-sm text-gray-500">{id}</p> */}
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-[#EFF2FF] rounded-xl p-4 mb-5">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-blue-500 mb-0.5">Performance</span>
                        <span className="text-sm font-bold text-blue-700">{performance}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-xs font-medium text-blue-500 mb-0.5">Joining Date</span>
                        <span className="text-sm font-bold text-blue-700">{joiningDate}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                        <Mail size={16} className="shrink-0" />
                        <span className="truncate">{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                        <Phone size={16} className="shrink-0" />
                        <span>{phone}</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
                <GradiantButton
                    onClick={onViewClick}
                    className="bg-gradient-to-r from-[#5B4DFF] to-[#8F85FF] text-white font-semibold py-2 px-10 rounded-lg shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all"
                >
                    View
                </GradiantButton>
            </div>
        </div>
    );
};

export default UserCard;
