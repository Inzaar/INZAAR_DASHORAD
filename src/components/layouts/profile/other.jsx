import React from "react";

function Other({ setUserPayload, userPayload, userInfo }) {
    return (
        <div className="w-full p-[24px] gap-[24px] rounded-[12px] b-[1px] bg-[#FFFFFF]  border border-[#E2E8F0]">
            <div className="w-full rotate-0 opacity-100 flex flex-col gap-[5px] ">

                <div className="w-full gap-4 flex">
                    {/* gender field */}
                    <div className="w-[50%] gap-2  flex flex-col">
                        <label>Gender* </label>
                        <div>
                            <select
                                className=" w-full h-[52px] rounded-md px-3 border border-[#E4E4E7] "
                                name="Gender"
                                id="Gender"
                                value={userPayload?.gender || "Choose"}
                                onChange={(e) => setUserPayload({ ...userPayload, gender: e.target.value })}
                            >
                                <option value="Choose">Choose</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                    {/* Date of birth*/}
                    <div className="w-[50%]">
                        <div className="w-full gap-2 flex flex-col">
                            <label>Date Of Birth* </label>

                            <input
                                type="date"
                                placeholder="Enter Your DOB"
                                value={userPayload?.dob ? new Date(userPayload.dob).toISOString().split('T')[0] : ''}
                                onChange={(e) => setUserPayload({ ...userPayload, dob: e.target.value })}
                                className="h-[52px] rounded-md px-3 border border-[#E4E4E7]"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full gap-4 flex">
                    {/* Educational qualification */}
                    <div className=" gap-2 flex flex-col mt-6 w-[50%]">
                        <label>Educational Qualification* </label>

                        <input
                            type="text"
                            placeholder="Enter Your Educational Qualification"
                            value={userPayload?.educationQualification || ''}
                            onChange={(e) => setUserPayload({ ...userPayload, educationQualification: e.target.value })}
                            className="w-full h-[52px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 "
                        />
                    </div>
                    {/* national */}
                    <div className="w-[50%] gap-2 flex flex-col mt-6">
                        <label>Nationality* </label>

                        <input
                            type="text"
                            placeholder="Enter Your Nationality"
                            value={userPayload?.nationality || ''}
                            onChange={(e) => setUserPayload({ ...userPayload, nationality: e.target.value })}
                            className="w-full h-[52px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 "
                        />
                    </div>
                </div>

                <div className="w-full gap-4 flex">
                    {/* permanent address */}
                    <div className=" gap-2 flex flex-col mt-6 flex-1">
                        <label>Permanent Address* </label>

                        <input
                            type="text"
                            placeholder="Enter Your Permanent Address"
                            value={userPayload?.permanentAddress || ''}
                            onChange={(e) => setUserPayload({ ...userPayload, permanentAddress: e.target.value })}
                            className="w-full h-[52px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 "
                        />
                    </div>
                </div>

                <div className="w-full gap-4 flex">
                    {/*Religious course */}
                    <div className=" gap-2 flex flex-col flex-1">
                        <label>
                            Already Attended a Religious Course, give details if any:{" "}
                        </label>

                        <textarea
                            type="text"
                            placeholder="Enter Details"
                            value={userPayload?.attendedReligiousCourseDetails || ''}
                            onChange={(e) => setUserPayload({ ...userPayload, attendedReligiousCourseDetails: e.target.value })}
                            className="w-full h-[82px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 pt-16px pr-3 pb-46px pl-3 gap-4  "
                        />
                    </div>
                </div>

                <div className="w-full gap-4 flex">
                    {/*inzar courses*/}
                    <div className=" gap-2 flex flex-col flex-1">
                        <label>How Did You Come To Know About Inzaar/Course: </label>

                        <textarea
                            type="text"
                            placeholder="Enter Feedback"
                            value={userPayload?.referralSource || ''}
                            onChange={(e) => setUserPayload({ ...userPayload, referralSource: e.target.value })}
                            className="w-full h-[82px] rounded-md px-3 gap-1 border border-[#E4E4E7] opacity-100 rotate-0 pt-16px pr-3 pb-46px pl-3 gap-4  "
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Other;