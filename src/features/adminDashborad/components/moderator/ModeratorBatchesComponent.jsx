import SessionActivity from "@/components/shared/SessionActivity";
import ModeratorRoll from "./ModeratorRoll";
import AssignBatches from "./AssignBatches";
import course2 from "@/assets/images/course2.png";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState } from "react";
import Modal from "@/components/shared/Modal";
import BatchList from "./BatchList";

function ModeratorBatchesComponent({ profileData }) {
    const [showBatchModal, setShowBatchModal] = useState(false);
    const user = profileData?.user || {};
    const assignedBatches = user.assignedBatches || [];

    return (
        <div >
            {/* Top Section: Roll + Session */}
            <div className="mt-[20px] w-full">
                <div className="sm:flex-row lg:flex  gap-[16px]">
                    <ModeratorRoll profileData={profileData} />
                    <SessionActivity profileData={profileData} />
                </div>
            </div>

            {/* Batches Cards Section */}
            <div className="mt-[12px] w-full ">
                <div className="w-full rounded-[10px]">
                    <div className="w-full">
                        {/* heading */}
                        <div className="w-full h-[40px] flex justify-between items-center pt-[24px] pr-[14px] pb-[24px] pl-[14px]">
                            <h3 className="">Assigned Batches</h3>
                            <GradiantButton
                                onClick={() => setShowBatchModal(true)}
                                className="w-[159px] h-[40px] font-bold text-[14px] rounded-[4px]"
                            >
                                Assign new batch
                            </GradiantButton>
                        </div>

                        {/* cards - scrollable grid */}
                        <div className='w-full mt-[20px] max-h-[480px] overflow-y-auto pr-2 pb-4'>
                            {assignedBatches.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {assignedBatches.map((batch) => (
                                        <AssignBatches
                                            key={batch._id}
                                            image={batch.courseId?.thumbnail || course2}
                                            title={batch.courseId?.title || "Unknown Course"}
                                            students={batch.limit || "N/A"}
                                            moderators="01"
                                            performance="N/A"
                                            batch={batch.name || "N/A"}
                                            startDate={batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "N/A"}
                                            endDate={batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "N/A"}
                                            status={batch.status}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full py-10 text-center text-gray-400 italic">
                                    No batches assigned to this moderator yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Batch Modal */}
            <Modal isOpen={showBatchModal} onClose={() => setShowBatchModal(false)}>
                <BatchList onClose={() => setShowBatchModal(false)} />
            </Modal>
        </div>
    )
}

export default ModeratorBatchesComponent;