import SessionActivity from "@/components/shared/SessionActivity";
import ModeratorRoll from "./ModeratorRoll";
import ModeratorProfile from "./ModeratorProfile";


function ModeratorProfileComponent () {
    return (
        <div>
            <div className="mt-[20px] w-full">
                              <div className="flex w-[1120px] h-[301px] gap-[10px]">
                                <ModeratorRoll/>
                                <SessionActivity />
                              </div>
                            </div>
                            <div className="mt-[12px] w-full">
                              <ModeratorProfile/>
                            </div>
        </div>
    )
}
export default ModeratorProfileComponent;