import React from "react";
import InstructorRoll from "./InstructorRoll";
import InstructorProfile from "./InstructorProfile";

// function InstructorProfileComponent () {
//     return (
//         <div>
//             <div className="mt-[20px] w-full">
//                               <div className="flex w-[1120px] h-[301px] gap-[10px]">
//                                 <InstructorRoll/>
//                                 <SessionActivity />
//                               </div>
//                             </div>
//                             <div className="mt-[12px] w-full">
//                               <InstructorProfile/>
//                             </div>
//         </div>
//     )
// }
// export default InstructorProfileComponent;
function InstructorProfileComponent({ profileData, setProfileData, type = 'instructor', onEditClick }) {
    const [pendingProfileImage, setPendingProfileImage] = React.useState(null);

    return (
        <div className="w-full">
            <div className="mt-[20px] w-full">
                <div className="flex flex-col lg:flex-row w-full gap-[10px]">
                    <InstructorRoll
                        profileData={profileData}
                        type={type}
                        pendingProfileImage={pendingProfileImage}
                        setPendingProfileImage={setPendingProfileImage}
                    />
                    <div className="w-full lg:w-[50%] h-auto lg:h-[301px] bg-white border border-[#ECECEC] rounded-[12px] p-[20px] shadow-sm flex flex-col">
                        <h3 className="text-[14px] text-gray-800 font-bold mb-4 tracking-wide shrink-0">Assigned Courses</h3>
                        <div className="flex-1 flex flex-col min-h-0 gap-3 overflow-y-auto custom-scrollbar-thin pr-1">
                            {profileData?.assignedCourses?.length > 0 ? (
                                profileData.assignedCourses.map((course, idx) => (
                                    <div key={idx} className="w-full min-h-[48px] bg-indigo-50/50 rounded-[8px] border border-indigo-100 flex items-center px-4 shadow-sm hover:shadow hover:bg-indigo-50 transition-all cursor-default">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></div>
                                        <span className="font-semibold text-indigo-900 text-sm">{course.title || course.courseName || course}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 border border-gray-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <span className="italic text-sm">No courses currently assigned</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-[12px] w-full">
                <InstructorProfile
                    profileData={profileData}
                    type={type}
                    pendingProfileImage={pendingProfileImage}
                    setPendingProfileImage={setPendingProfileImage}
                    onEditClick={onEditClick}
                />
            </div>
        </div>
    )
}

export default InstructorProfileComponent;
