
function Notification({ message = "Default Notification", time = "Just now" }) {
    return (
        <div>
            <div className="flex items-center p-2 py-4 border-b border-gray-300 hover:bg-gray-100">
                <div className="w-[32px] h-[32px] rounded-full bg-[rgb(215,215,215)] shrink-0"></div>
                <div className="flex justify-between items-start w-full ml-3">
                    <div className="text-[16px] max-[641px]:text-[14px] text-[#5F5F5F] font-['inter'] font-normal leading-tight text-wrap">{message}</div>
                    <div className="w-[90px] text-[12px] max-[641px]:text-[10px] max-[641px]:w-[50px] max-[430px]:ml-0 ml-2 font-['Roboto'] text-[#5F5F5F] text-right shrink-0">{time}</div>
                </div>

            </div>
        </div>
    )
}

export default Notification;