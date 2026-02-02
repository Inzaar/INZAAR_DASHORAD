import React from "react";

function Other() {
    return (
        <div className="w-[772px] h-[556px] p-[24px] gap-[24px] rounded-[12px] b-[1px] bg-[#FFFFFF]  border border-[#E2E8F0]">
            <div className="w-[724px] h-[508px] rotate-0 opacity-100 gap-[16px]">
                <div className="w-[724px] h-[76px] gap-4 rotate-0 flex">
                    {/* gender field */}
                    <div className="w-[354px] gap-2  flex flex-col">
                        <label>Gender* </label>
                        <div>
                            <select
                                className=" w-[354px] h-[52px] rounded-md px-3 border border-[#E4E4E7] "
                                name="Gender"
                                id="Gender"
                            >
                                <option value="Choose">Choose</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                    {/* Date of birth*/}
                    <div>
                        <div className="w-[354px] gap-2 flex flex-col">
                            <label>Date Of Birth* </label>

                            <input
                                type="text"
                                placeholder="Enter Your Age"
                                className="h-[52px] rounded-md px-3 border border-[#E4E4E7]"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-[724px] gap-4 rotate-0 flex">
                    {/* Educational qualification */}
                    <div className=" gap-2 flex flex-col mt-6">
                        <label>Educational Qualification* </label>

                        <input
                            type="text"
                            placeholder="Enter Your Educational Qualification"
                            className="w-[354px] h-[52px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 "
                        />
                    </div>
                    {/* national */}
                    <div className=" gap-2 flex flex-col mt-6">
                        <label>Nationality* </label>

                        <input
                            type="text"
                            placeholder="Enter Your Nationality"
                            className="w-[354px] h-[52px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 "
                        />
                    </div>
                </div>
                <div className="w-full gap-4 rotate-0 flex">
                    {/* permanent address */}
                    <div className=" gap-2 flex flex-col mt-6 flex-1">
                        <label>Permanent Address* </label>

                        <input
                            type="text"
                            placeholder="Enter Your Permanent Address"
                            className="w-full h-[52px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 "
                        />
                    </div>
                </div>
                <div className="w-full gap-4 rotate-0 flex">
                    {/*Religious course */}
                    <div className=" gap-2 flex flex-col mt-6 flex-1">
                        <label>
                            Already Attended a Religious Course, give details if any:{" "}
                        </label>

                        <input
                            type="text"
                            placeholder="Enter Details"
                            className="w-full h-[82px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 pt-16px pr-3 pb-46px pl-3 gap-4  "
                        />
                    </div>
                </div>
                <div className="w-full gap-4 rotate-0 flex">
                    {/*inzar courses*/}
                    <div className=" gap-2 flex flex-col mt-6 flex-1">
                        <label>How Did You Come To Know About Inzaar/Course: </label>

                        <input
                            type="text"
                            placeholder="Enter Feedback"
                            className="w-full h-[82px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 pt-16px pr-3 pb-46px pl-3 gap-4  "
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Other;