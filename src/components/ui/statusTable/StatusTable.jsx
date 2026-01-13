import React from "react";
import StatusRow from "./StatusRow";
function StatusTable() {
    return (
        <div className="mt-8 bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm mb-10 overflow-x-auto no-scrollbar">
            <h3 className="font-bold text-gray-900 mb-6">Current status</h3>
            <div className="min-w-[1080px]">
                <div className="h-[60px] w-full bg-white flex items-center justify-between font-bold border-b border-gray-100 mb-4">
                    <div className="w-[134px]  flex items-center justify-center">
                        Courses
                    </div>
                    <div className="w-[134px] flex items-center justify-center">
                        Lecture
                    </div>
                    <div className="w-[134px] flex items-center justify-center">Title</div>
                    <div className="w-[134px] flex items-center justify-center">Date</div>
                    <div className="w-[134px] flex items-center justify-center">
                        Progress
                    </div>
                    <div className="w-[134px] flex items-center justify-center">
                        Next Lecture
                    </div>
                    <div className="w-[134px] flex items-center justify-center">
                        Comments
                    </div>
                    <div className="w-[134px] flex items-center justify-center">Action</div>
                </div>
                <div className="flex flex-col gap-4">
                    <StatusRow />
                    <StatusRow />
                    <StatusRow />
                    <StatusRow />
                </div>
            </div>

        </div>
    );
}

export default StatusTable;