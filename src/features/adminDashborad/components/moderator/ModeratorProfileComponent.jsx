import SessionActivity from "@/components/shared/SessionActivity";
import ModeratorRoll from "./ModeratorRoll";
import ModeratorProfile from "./ModeratorProfile";


// function ModeratorProfileComponent () {
//     return (
//         <div>
//             <div className="mt-[20px] w-full">
//                               <div className="flex w-[1120px] h-[301px] gap-[10px]">
//                                 <ModeratorRoll/>
//                                 <SessionActivity />
//                               </div>
//                             </div>
//                             <div className="mt-[12px] w-full">
//                               <ModeratorProfile/>
//                             </div>
//         </div>
//     )
// }
// export default ModeratorProfileComponent;
function ModeratorProfileComponent({ profileData, type = 'moderator' }) {
    return (
        <div className="w-full">
            <div className="mt-[20px] w-full">
                <div className="flex flex-col lg:flex-row w-full gap-[10px]">
                    <ModeratorRoll profileData={profileData} type={type} />
                    <SessionActivity profileData={profileData} />
                </div>
            </div>

            <div className="mt-[12px] w-full">
                <ModeratorProfile profileData={profileData} type={type} />
            </div>
        </div>
    )
}

export default ModeratorProfileComponent;
