import React from 'react';
import { AlertCircle, Users, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { getAllBatches, getBatchesByCourse, moveStudents } from '@/api/batch';

// ── Toast component ──────────────────────────────────────────────────────────
const Toast = ({ type, message }) => (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 min-w-[300px] border ${
        type === 'success'
            ? 'bg-green-50 text-green-700 border-green-100'
            : 'bg-red-50 text-red-700 border-red-100'
    }`}>
        {type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
        <span className="flex-1 text-center">{message}</span>
    </div>
);

// ── Slider component ──────────────────────────────────────────────────────────
const StudentSlider = ({ max, value, onChange }) => {
    // Capacity check is ignored here on the frontend as per requirements
    const effectiveMax = max;
    const fillPct = effectiveMax > 0 ? (value / effectiveMax) * 100 : 0;
    const color = '#5D5FEF'; 

    return (
        <div className="select-none py-2">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-gray-500 text-[10px] font-bold">
                    Students {String(value).padStart(2, '0')} / {String(effectiveMax).padStart(2, '0')}
                </p>
            </div>

            <div className="relative h-6 flex items-center">
                <div className="absolute w-full h-1.5 bg-gray-100 rounded-full" />
                <div
                    className="absolute h-1.5 rounded-full transition-all duration-150"
                    style={{ width: `${fillPct}%`, backgroundColor: color }}
                />
                <input
                    type="range"
                    min={0}
                    max={effectiveMax}
                    step={1}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value, 10))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                    className="absolute w-4 h-4 rounded-full border-2 bg-white shadow-md transition-all duration-150 -translate-x-1/2 pointer-events-none"
                    style={{ left: `${fillPct}%`, borderColor: color }}
                />
            </div>
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────
const AdjustStudentsTab = ({ batchData, onClose }) => {
    const [others, setOthers]               = React.useState([]);
    const [loading, setLoading]             = React.useState(true);
    const [isMoving, setIsMoving]           = React.useState(false);
    const [sliderValues, setSliderValues]   = React.useState({});   
    const [toast, setToast]                 = React.useState(null); 

    const sourceBatchId  = batchData?._id || batchData?.id;
    const courseId       = batchData?.courseId?._id || batchData?.courseId;
    const courseName     = batchData?.courseName || batchData?.courseId?.title || 'this course';
    
    const sourceStudents = (() => {
        if (batchData?.enrolledCount !== undefined) return batchData.enrolledCount;
        const raw = batchData?.studentsCount || '0/0';
        const n = parseInt(String(raw).split('/')[0]?.trim(), 10);
        return isNaN(n) ? 0 : n;
    })();

    React.useEffect(() => {
        const fetchBatches = async () => {
            if (!courseId) {
                setLoading(false);
                return;
            }
            try {
                const apiData = await getBatchesByCourse(courseId) || [];
                
                // Filter out the source batch and mismatching genders
                const sourceGender = batchData?.genderType || 'Unassigned';
                const siblings = apiData.filter(b => {
                    if (String(b._id) === String(sourceBatchId)) return false;
                    
                    const targetGender = b.genderType || 'Unassigned';
                    if (targetGender !== 'Unassigned' && sourceGender !== 'Unassigned' && targetGender !== sourceGender) {
                        return false;
                    }
                    return true;
                });

                // Map siblings to match the expected structure
                const formattedSiblings = siblings.map(b => ({
                    ...b,
                    enrolledCount: b.enrolledCount ?? 0, // Fallback if missing
                    availableSpace: b.limit ? (b.limit - (b.enrolledCount ?? 0)) : (50 - (b.enrolledCount ?? 0)),
                    moderatorName: b.assignedModerator?.fullName || b.assignedModerator?.name || null
                }));

                setOthers(formattedSiblings);
                
                const initials = {};
                formattedSiblings.forEach(b => { initials[b._id] = 0; });
                setSliderValues(initials);
            } catch (err) {
                console.error("Fetch batches error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, [courseId, sourceBatchId]);

    const handleSliderChange = (batchId, val) => {
        const reset = {};
        others.forEach(b => { reset[b._id] = 0; });
        setSliderValues({ ...reset, [batchId]: val });
    };

    const handleMoveSubmit = async () => {
        const targetId = Object.keys(sliderValues).find(id => sliderValues[id] > 0);
        if (!targetId || isMoving) return;

        const count = sliderValues[targetId];
        console.log("Submitting Move:", { sourceBatchId, targetId, count });
        setIsMoving(true);
        try {
            await moveStudents(sourceBatchId, targetId, count);
            setToast({ type: 'success', message: `Successfully moved ${count} students!` });
            setTimeout(() => { setToast(null); onClose(); }, 2000);
        } catch (err) {
            // Robust error extraction for different API response formats
            const errorMsg = err?.message || err?.error || (typeof err === 'string' ? err : 'Failed to move students');
            setToast({ type: 'error', message: errorMsg });
            setTimeout(() => setToast(null), 4000);
        } finally {
            setIsMoving(false);
        }
    };

    const hasSelection = Object.values(sliderValues).some(v => v > 0);

    const renderBatchCard = (batch, isSource = false) => {
        const enrolled = (batch.enrolledCount ?? parseInt(String(batch.studentsCount || '0').split('/')[0])) || 0;
        const limit = batch.limit || 50;
        const available = Math.max(0, limit - enrolled);
        const sliderVal = sliderValues[batch._id] || 0;

        return (
            <div
                key={batch._id || batch.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                    isSource 
                        ? 'bg-[#F0F4FF] border-[#5D5FEF]/40 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSource ? 'bg-[#5D5FEF] text-white' : 'bg-[#FEEFEE] text-[#F87171]'}`}>
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-900 text-[14px] leading-none mb-1">
                                {batch.name || batch.batchId || 'Unnamed Batch'} 
                                {(batch.genderType === 'Male' || batch.genderType === 'Female') ? ` (${batch.genderType})` : ''}
                                {isSource ? ' (Current)' : ''}
                            </h5>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">ID: {batch.batchId || String(batch._id || batch.id).substring(0, 8)}</p>
                        </div>
                    </div>
                    {isSource ? (
                        <span className="px-2.5 py-1 bg-[#FEF3C7] text-[#D97706] rounded font-black text-[9px] uppercase tracking-tighter border border-[#FDE68A]">Source</span>
                    ) : available <= 0 ? (
                        <span className="px-2.5 py-1 bg-[#FEEFEE] text-[#EF4444] rounded font-black text-[9px] uppercase tracking-tighter border border-[#FECACA]">Full</span>
                    ) : null}
                </div>

                {!isSource && (
                    <div className="mb-5 px-1">
                        <StudentSlider 
                            max={sourceStudents} 
                            value={sliderVal} 
                            onChange={(v) => handleSliderChange(batch._id, v)} 
                        />
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 bg-gray-50/50 p-2.5 rounded-lg border border-gray-50">
                    <div>
                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Students</p>
                        <p className={`font-extrabold text-[13px] flex items-center gap-1 ${enrolled > limit ? 'text-red-500' : 'text-gray-800'}`}>
                            {enrolled} / {limit}
                            {enrolled > limit && <AlertCircle className="w-3 h-3 text-red-500" title="Capacity exceeded" />}
                        </p>
                    </div>
                    <div className="text-center border-x border-gray-100">
                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">Moderator</p>
                        <p className="text-gray-800 font-extrabold text-[12px] truncate px-1">{batch.moderatorName || batch.assignedModerator?.name || 'Not Assigned'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">{isSource ? 'Status' : 'Space'}</p>
                        <p className={`font-extrabold text-[13px] ${isSource ? 'text-[#5D5FEF]' : (available === 0 ? 'text-red-500' : 'text-green-600')}`}>
                            {isSource ? (batch.status || (batch.assignedModerator ? 'Active' : 'Pending')) : (available <= 0 ? 'Full' : `${available} Left`)}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col xl:min-h-0 h-full relative overflow-hidden pb-8">
            {toast && <Toast type={toast.type} message={toast.message} />}

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-6 no-scrollbar">
                <div className="mb-4">
                    <h3 className="text-[#334155] text-[15px] font-bold">Adjust Students Across Batches</h3>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                        You can merge or redistribute students into existing batches instead of creating a new one.
                    </p>
                </div>

                <div className="bg-[#FFF8F1] border border-[#FFEDD5] p-3.5 rounded-xl flex items-center gap-3 mb-6">
                    <AlertCircle className="w-5 h-5 text-[#F97316] flex-shrink-0" />
                    <p className="text-[#9A3412] text-[11px] font-medium leading-relaxed">
                        Batch <span className="font-bold">{batchData?.name || batchData?.batchId || 'this batch'}</span> has only {sourceStudents} students. You may merge it with another batch to optimize capacity.
                    </p>
                </div>

                <div className="mb-4">
                    <h4 className="text-gray-500 text-[11px] font-bold uppercase tracking-wide">
                        All Batches for {courseName}
                    </h4>
                </div>

                <div className="space-y-4">
                    {/* ALWAYS show the source batch first */}
                    {batchData && renderBatchCard(batchData, true)}

                    {loading ? (
                        <div className="py-10 flex flex-col items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[#5D5FEF] animate-spin mb-2" />
                            <p className="text-gray-400 text-[10px] font-bold uppercase">Syncing Sibling Batches...</p>
                        </div>
                    ) : others.length === 0 ? (
                        <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                             <p className="text-gray-400 text-[10px] font-bold uppercase">No target batches available for redistribution.</p>
                        </div>
                    ) : (
                        others.map((batch) => renderBatchCard(batch, false))
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100 shrink-0">
                <button
                    onClick={onClose}
                    className="flex-1 py-4 border-2 border-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
                >
                    Cancel
                </button>
                <button
                    onClick={handleMoveSubmit}
                    disabled={!hasSelection || isMoving}
                    className={`flex-1 py-4 font-black text-sm rounded-2xl transition-all shadow-xl relative overflow-hidden active:scale-95
                        ${hasSelection && !isMoving 
                            ? 'bg-[#5D5FEF] text-white shadow-[#5D5FEF]/20 hover:bg-[#4C4ED6]' 
                            : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'}`}
                >
                    {isMoving ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Moving...</span>
                        </div>
                    ) : 'Move Students'}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default AdjustStudentsTab;
