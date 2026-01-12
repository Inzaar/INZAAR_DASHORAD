import React from "react";
import GradiantButton from "../../ui/buttons/GradiantButton";

function StatusRow() {
    return (
        <div className="h-[60px] w-full bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-[12px]">
            <div className="w-[134px]  flex items-center justify-center">Tafseer</div>
            <div className="w-[134px] flex items-center justify-center">#01</div>
            <div className="w-[134px] flex items-center justify-center">Introduction</div>
            <div className="w-[134px] flex items-center justify-center">05-Feb-2025</div>
            <div className="w-[134px] flex items-center justify-center">40%</div>
            <div className="w-[134px] flex items-center justify-center">🔒Locked</div>
            <div className="w-[134px] flex items-center justify-center">N/A</div>
            <div className="w-[134px] flex items-center justify-center">
                <GradiantButton className="p-[8px] rounded-[4px]">Watch Again</GradiantButton>
            </div>
        </div>
    );
}

export default StatusRow;