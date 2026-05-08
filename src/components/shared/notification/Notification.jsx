function Notification({ message = "Default Notification", time = "Just now", onClick, className = "", isUnread = false }) {
    return (
        <div onClick={onClick} className={`${className} group cursor-pointer w-full`}>
            <div className="flex justify-between items-center p-4 py-6 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                <div className={`flex-1 text-[16px] md:text-[18px] font-['inter'] leading-tight ${isUnread ? 'font-black text-black' : 'font-normal text-gray-400'}`}>
                    {message}
                </div>
                <div className={`shrink-0 ml-6 text-[12px] md:text-[14px] font-['Roboto'] ${isUnread ? 'font-bold text-black' : 'font-normal text-gray-400'}`}>
                    {time}
                </div>
            </div>
        </div>
    )
}

export default Notification;