function Notification({ message = "Default Notification", time = "Just now", onClick, className = "", isUnread = false }) {
    return (
        <div onClick={onClick} className={`${className} group cursor-pointer w-full`}>
            <div className={`flex justify-between items-start p-3.5 md:p-4 border-b border-gray-100 transition-all duration-300 ${isUnread ? 'bg-blue-50/30 border-l-4 border-l-blue-600' : 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                <div className="flex-1 flex items-start gap-3 min-w-0">
                    {isUnread && (
                        <span className="mt-1 px-1.5 py-0.5 bg-blue-600 text-white text-[8px] md:text-[9px] font-black rounded uppercase tracking-wider shadow-sm shrink-0">
                            New
                        </span>
                    )}
                    <div className={`text-[14px] md:text-[16px] font-['inter'] leading-snug flex-1 break-words ${isUnread ? 'font-black text-slate-900' : 'font-medium text-slate-500'}`}>
                        {message}
                    </div>
                </div>
                <div className={`shrink-0 ml-4 text-[10px] md:text-[12px] font-['Roboto'] mt-1 ${isUnread ? 'font-bold text-blue-600' : 'font-medium text-slate-400'}`}>
                    {time}
                </div>
            </div>
        </div>
    )
}

export default Notification;