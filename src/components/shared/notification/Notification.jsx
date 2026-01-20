
function Notification() {
    return (
        <div>
            <div className="flex items-center p-2 border-b border-gray-300">
                <div className="w-[32px] h-[32px] rounded-full bg-[rgb(215,215,215)] shrink-0"></div>
                <div className="flex justify-between items-start w-full ml-3">
                    <div className="text-[16px] max-[641px]:text-[14px] text-[#5F5F5F] font-['inter'] font-normal leading-tight text-wrap">New Claim Submitted – John Mitchell has submitted a new warranty claim for his Toyota Camry on June 13, 2025.</div>
                    <div className="w-[90px] text-[12px] max-[641px]:text-[10px] max-[641px]:w-[50px] max-[430px]:ml-0 ml-2 font-['Roboto'] text-[#5F5F5F] text-right shrink-0">2 hours ago</div>
                </div>

            </div>
        </div>
    )
}

export default Notification;