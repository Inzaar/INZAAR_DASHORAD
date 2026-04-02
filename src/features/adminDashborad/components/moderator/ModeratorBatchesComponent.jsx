import SessionActivity from "@/components/shared/SessionActivity";
import ModeratorRoll from "./ModeratorRoll";
import AssignBatches from "./AssignBatches";
import course2 from "@/assets/images/course2.png";
import GradiantButton from "@/components/ui/buttons/GradiantButton";
import { useState } from "react";
import Modal from "@/components/shared/Modal";
import BatchList from "./BatchList";

function ModeratorBatchesComponent() {
    const [showBatchModal, setShowBatchModal] = useState(false);

    return (
        <div >
            {/* Top Section: Roll + Session */}
            <div className="mt-[20px] w-full">
                <div className="sm:flex-row lg:flex  gap-[16px]">
                    <ModeratorRoll />
                    <SessionActivity />

                </div>
            </div>

            {/* Batches Cards Section */}
            <div className="mt-[12px] w-full ">
                <div className="w-full h-[488px] rounded-[10px] flex items-center justify-center ">
                    <div className="w-full h-[440px]  ">
                        {/* heading */}
                        <div className="w-full h-[40px] flex justify-between items-center pt-[24px] pr-[14px] pb-[24px] pl-[14px] top-[544px] left-[300px] ">
                            <h3 className="">Assigned Batches</h3>
                            <GradiantButton
                                onClick={() => setShowBatchModal(true)}
                                className="w-[159px] h-[40px] font-bold text-[14px] rounded-[4px]"
                            >
                                Assign new batch
                            </GradiantButton>

                        </div>
                        {/* card */}
                        <div className='w-full mt-[20px] flex gap-5 items-center   overflow-x-auto lg:overflow-visible'>
                            {/* <div className="flex gap-5 bg-yellow-300"> */}

                            <AssignBatches image={course2}
                                title="Stress Management Course"
                                students="55"
                                moderators="02"
                                performance="88%"
                                batch="S-25-01"
                                startDate="01/01/2025"
                                endDate="01/03/2025"
                            />

                            <AssignBatches
                                image={course2}
                                title="Stress Management Course"
                                students="40"
                                moderators="05"
                                performance="92%"
                                batch="S-25-02"
                                startDate="02/01/2025"
                                endDate="02/03/2025"
                            />

                            <AssignBatches
                                image={course2}
                                title="Stress Management Course"
                                students="70"
                                moderators="03"
                                performance="80%"
                                batch="S-25-03"
                                startDate="03/01/2025"
                                endDate="03/03/2025"
                            />

                            {/* </div> */}

                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-2 mt-8">
                    <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        Previous
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">1</button>
                    <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#6366F1] rounded-lg shadow-sm">2</button>
                    <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">3</button>
                    <span className="text-gray-400">...</span>
                    <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                        Next
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
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