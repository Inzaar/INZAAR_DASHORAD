import React from "react";
import GradiantButton from "../../ui/buttons/GradiantButton";

function StatusRow({ data }) {
    return (
        <div className="h-[60px] w-full bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-[12px]">
            <div className="w-[134px]  flex items-center justify-center">{data.course}</div>
            <div className="w-[134px] flex items-center justify-center">{data.lecture}</div>
            <div className="w-[134px] flex items-center justify-center">{data.title}</div>
            <div className="w-[134px] flex items-center justify-center">{data.date}</div>
            <div className="w-[134px] flex items-center justify-center">{data.progress}</div>
            <div className="w-[134px] flex items-center justify-center">
                {data.status === 'Locked' && '🔒'} {data.status}
            </div>
            <div className="w-[134px] flex items-center justify-center">{data.comments}</div>
            <div className="w-[134px] flex items-center justify-center">
                <GradiantButton className="p-[8px] rounded-[4px]">Watch Again</GradiantButton>
            </div>
        </div>
    );
}

export default StatusRow;