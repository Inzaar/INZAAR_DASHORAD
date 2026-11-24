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
            <div className="mt-2 sm:mt-4 w-full">
                <div className="flex flex-col xl:flex-row w-full gap-3 sm:gap-4">
                    <InstructorRoll
                        profileData={profileData}
                        type={type}
                        pendingProfileImage={pendingProfileImage}
                        setPendingProfileImage={setPendingProfileImage}
                    />
                    <div className="w-full xl:w-[50%] min-h-[160px] xl:h-[301px] bg-white border border-[#ECECEC] rounded-[12px] p-3.5 sm:p-5 shadow-sm flex flex-col">
                        <h3 className="text-xs sm:text-sm text-gray-800 font-bold mb-3 sm:mb-4 tracking-wide shrink-0">Assigned Courses</h3>
                        <div className="flex-1 flex flex-col min-h-0 gap-2 sm:gap-3 overflow-y-auto custom-scrollbar-thin pr-1">
                            {profileData?.assignedCourses?.length > 0 ? (
                                profileData.assignedCourses.map((course, idx) => (
                                    <div key={idx} className="w-full min-h-[42px] sm:min-h-[48px] bg-indigo-50/50 rounded-[8px] border border-indigo-100 flex items-center px-3 sm:px-4 shadow-xs hover:bg-indigo-50 transition-all cursor-default">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2.5 sm:mr-3 shrink-0"></div>
                                        <span className="font-semibold text-indigo-900 text-xs sm:text-sm truncate">{course.title || course.courseName || course}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-6 sm:py-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 border border-gray-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <span className="italic text-xs sm:text-sm">No courses currently assigned</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 sm:mt-4 w-full">
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
