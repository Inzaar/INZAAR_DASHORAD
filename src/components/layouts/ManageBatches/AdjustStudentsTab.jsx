import React from 'react';
import { AlertCircle, Users, User, ArrowRight } from 'lucide-react';

const AdjustStudentsTab = ({ batchData, onClose }) => {
    const [selectedBatchId, setSelectedBatchId] = React.useState(null);
    const [transferCount, setTransferCount] = React.useState(5);
    const cardRefs = React.useRef({});

    // Auto-scroll when selection changes
    React.useEffect(() => {
        if (selectedBatchId && cardRefs.current[selectedBatchId]) {
            cardRefs.current[selectedBatchId].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedBatchId]);

    // Mock data based on the screenshot
    const allBatches = [
        {
            id: "B-103",
            name: "Batch 3 (Current)",
            students: "5 / 10",
            moderator: "Not Assigned",
            status: "Pending",
            isSource: true
        },
        {
            id: "B-101",
            name: "Batch 1",
            students: "10 / 10",
            moderator: "Ali Khan",
            availableSpace: "0",
            isFull: true
        },
        {
            id: "B-102",
            name: "Batch 2",
            students: "10 / 10",
            moderator: "Sara Ahmed",
            availableSpace: "0",
            isFull: true
        }
    ];

    return (
        <div className="flex-1 flex flex-col xl:min-h-0 animate-in slide-in-from-bottom-2 duration-300">
            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto xl:overflow-y-auto pr-2 custom-scrollbar pb-6 xl:min-h-0">
                {/* Header Description */}
                <div className="mb-6">
                    <h3 className="text-gray-900 text-sm font-bold">Adjust Students Across Batches</h3>
                    <p className="text-gray-400 text-[10px] mt-0.5">You can merge or redistribute students into existing batches instead of creating a new one.</p>
                </div>

                {/* Alert Box */}
                <div className="bg-[#FFF8F1] border border-[#FFEDD5] p-3 rounded-lg flex items-start gap-3 mb-6">
                    <AlertCircle className="w-4 h-4 text-[#F97316] mt-0.5 flex-shrink-0" />
                    <p className="text-[#9A3412] text-[10px] font-medium leading-relaxed">
                        Batch Batch 3 has only 5 students. You may merge it with another batch to optimize capacity.
                    </p>
                </div>

                <div className="mb-4">
                    <h4 className="text-gray-900 text-[11px] font-bold">All Batches for Advanced Digital Marketing</h4>
                </div>

                {/* Batch List Area */}
                <div className="space-y-4">
                    {allBatches.map((batch, index) => (
                        <div
                            key={index}
                            ref={el => cardRefs.current[batch.id] = el}
                            onClick={() => !batch.isSource && setSelectedBatchId(batch.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${batch.isSource || selectedBatchId === batch.id
                                ? 'bg-[#F8FAFF] border-[#3758EE] shadow-sm'
                                : 'bg-white border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-4 items-center">
                                    <div className={`p-2.5 rounded-lg text-white shadow-sm flex-shrink-0 ${batch.isSource ? 'bg-[#3758EE]' : 'bg-[#FEE2E2]'
                                        }`}>
                                        <Users className={`w-4 h-4 ${batch.isSource ? 'text-white' : 'text-[#EF4444]'}`} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-[12px]">{batch.name}</h5>
                                        <p className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">ID: {batch.id}</p>
                                    </div>
                                </div>
                                {batch.isSource ? (
                                    <span className="px-2 py-0.5 bg-[#FEF9C3] text-[#854D0E] rounded text-[9px] font-bold">Source</span>
                                ) : selectedBatchId === batch.id ? (
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-2 py-0.5 bg-[#F8FAFF] text-[#3758EE] rounded text-[9px] font-bold">Selected</span>
                                    </div>
                                ) : batch.isFull && (
                                    <span className="px-2 py-1 bg-[#FEE2E2]/50 text-[#EF4444] rounded-md text-[9px] font-bold leading-none">Full</span>
                                )}
                            </div>

                            {/* Selection Details / Slider */}
                            {selectedBatchId === batch.id && !batch.isSource && (
                                <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-gray-400 text-[10px] font-medium">Students to move</p>
                                        <p className="text-[#3758EE] text-[10px] font-bold">05</p>
                                    </div>
                                    <div className="relative h-6 flex items-center group">
                                        <div className="absolute w-full h-1 bg-gray-100 rounded-full" />
                                        <div className="absolute w-[60%] h-1 bg-[#3758EE] rounded-full" />
                                        <div className="absolute left-[60%] w-4 h-4 bg-white border-2 border-[#3758EE] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] -translate-x-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95" />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-2 sm:gap-x-6">
                                <div className="min-w-0">
                                    <p className="text-gray-400 text-[9px] uppercase font-bold tracking-wider mb-1 whitespace-nowrap">Students</p>
                                    <p className="text-gray-700 text-[11px] font-bold">{batch.students}</p>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-gray-400 text-[9px] uppercase font-bold tracking-wider mb-1 whitespace-nowrap">Moderator</p>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-gray-700 text-[11px] font-bold truncate">{batch.moderator}</p>
                                    </div>
                                </div>
                                <div className="min-w-0 col-span-2 md:col-span-1">
                                    <p className="text-gray-400 text-[9px] uppercase font-bold tracking-wider mb-1 whitespace-nowrap">
                                        {batch.isSource ? 'Status' : 'Available Space'}
                                    </p>
                                    <p className={`text-[11px] font-bold ${batch.isSource ? 'text-gray-700' : 'text-gray-700'}`}>
                                        {batch.isSource ? batch.status : batch.availableSpace}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 pt-6 pb-6 border-t border-gray-100 flex-shrink-0">
                <button
                    onClick={onClose}
                    className="w-full sm:flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 order-2 sm:order-1"
                >
                    Cancel
                </button>
                <button
                    onClick={onClose}
                    className={`w-full sm:flex-1 py-3 font-bold text-sm rounded-xl transition-all active:scale-95 order-1 sm:order-2 ${selectedBatchId
                        ? 'bg-[#5D5FEF] text-white hover:bg-[#4B4DDB] shadow-lg shadow-[#5D5FEF]/20'
                        : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                        }`}
                >
                    Move Students
                </button>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #F1F5F9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3758EE;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #2D46C7;
                }
            `}} />
        </div>
    );
};

export default AdjustStudentsTab;
