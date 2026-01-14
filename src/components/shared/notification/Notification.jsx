
function Notification () {
return(
    <div>
            <div className="w-[1073px] h-[28px] gap-[14px] bg-amber-50 flex">
                <div className="w-[28px] h-[28px] rounded-full bg-[rgb(215,215,215)]"></div>
                <div className="w-[1031px] h-[19px] flex justify-between m-[5px]">
                    <div className="[w-858px] h-[19px] text-[16px] text-[#5F5F5F] font-['inter'] font-normal leading-none m-[1px]">New Claim Submitted – John Mitchell has submitted a new warranty claim for his Toyota Camry on June 13, 2025.</div>
                    <div className="w-[64px] h-[14px] text-[12px] font-['Roboto'] text-[#5F5F5F]">2 hours ago</div>
                </div>
                
            </div>
        </div>
)
}

export default Notification;