import React from 'react';
import { AlertCircle, Users, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { getBatchesByCourse, moveStudents } from '@/api/batch';

// ── Toast component (Repositioned to the top) ──────────────────────────────────
const Toast = ({ type, message }) => (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 min-w-[300px] border ${
        type === 'success'
            ? 'bg-green-50 text-green-700 border-green-100'
            : 'bg-red-50 text-red-700 border-red-100'
    }`}>
        {type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
        <span className="flex-1">{message}</span>
    </div>
);

// ── Slider component ──────────────────────────────────────────────────────────
const StudentSlider = ({ max, value, onChange, availableSpace }) => {
    const effectiveMax = Math.min(max, availableSpace);
    const fillPct = effectiveMax > 0 ? (value / effectiveMax) * 100 : 0;
    const color = '#5D5FEF'; 

    return (
        <div className="select-none">
            <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight">
                    Students {String(value).padStart(2, '0')} / {String(effectiveMax).padStart(2, '0')}
                </p>
            </div>

            <div className="relative h-10 flex items-center">
                <div className="absolute w-full h-2.5 bg-gray-100 rounded-full" />
                <div
                    className="absolute h-2.5 rounded-full transition-all duration-150"
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
                    className="absolute w-6 h-6 rounded-full border-[3px] bg-white shadow-xl transition-all duration-150 -translate-x-1/2 pointer-events-none"
                    style={{ left: `${fillPct}%`, borderColor: color }}
                />
            </div>

            <div className="flex justify-between mt-1">
                <span className="text-[9px] text-gray-400 font-bold">0%</span>
                <span className="text-[9px] text-gray-400 font-bold">100%</span>
            </div>

            {value > 0 && (
                <p className="text-[10px] mt-2 font-bold flex items-center gap-1.5" style={{ color }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    {value === effectiveMax && effectiveMax > 0
                        ? 'All students will be moved from current batch'
                        : `${value} students will be moved`}
                </p>
            )}
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────
const AdjustStudentsTab = ({ batchData, onClose }) => {
    const [batches, setBatches]               = React.useState([]);
    const [loading, setLoading]               = React.useState(true);
    const [isMoving, setIsMoving]             = React.useState(false);
    const [fetchError, setFetchError]         = React.useState(null);
    const [sliderValues, setSliderValues]     = React.useState({});   
    const [toast, setToast]                   = React.useState(null); 

    const sourceBatchId  = batchData?._id;
    const courseId       = batchData?.courseId?._id || batchData?.courseId;
    const sourceStudents = batchData?.enrolledCount ?? (() => {
        const raw = batchData?.studentsCount || '';
        const n = parseInt(raw.split('/')[0]?.trim(), 10);
        return isNaN(n) ? 0 : n;
    })();

    React.useEffect(() => {
        const fetchBatches = async () => {
            if (!courseId) return;
            try {
                const data = await getBatchesByCourse(courseId);
                const sourceBatch = (data || []).find(b => b._id === sourceBatchId);
                const siblings = (data || []).filter(b => b._id !== sourceBatchId);
                
                const allBatches = [];
                if (sourceBatch) allBatches.push({ ...sourceBatch, isSource: true });
                allBatches.push(...siblings);
                setBatches(allBatches);
                
                const initial = {};
                siblings.forEach(b => { initial[b._id] = 0; });
                setSliderValues(initial);
            } catch (err) {
                setFetchError(err?.message || 'Failed to load batches');
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, [courseId, sourceBatchId]);

    const handleSliderChange = (batchId, val) => {
        const resetValues = {};
        batches.filter(b => !b.isSource).forEach(b => { resetValues[b._id] = 0; });
        setSliderValues({ ...resetValues, [batchId]: val });
    };

    const handleMoveSubmit = async () => {
        const targetId = Object.keys(sliderValues).find(id => sliderValues[id] > 0);
        if (!targetId || isMoving) return;

        const count = sliderValues[targetId];
        const targetBatch = batches.find(b => b._id === targetId);

        setIsMoving(true);
        try {
            await moveStudents(sourceBatchId, targetId, count);
            setToast({ 
                type: 'success', 
                message: `${count} student${count > 1 ? 's' : ''} moved to ${targetBatch.name} successfully!` 
            });
            
            // Refresh data
            const data = await getBatchesByCourse(courseId);
            const siblings = (data || []).filter(b => b._id !== sourceBatchId);
            const sourceBatch = (data || []).find(b => b._id === sourceBatchId);
            const allBatches = [];
            if (sourceBatch) allBatches.push({ ...sourceBatch, isSource: true });
            allBatches.push(...siblings);
            setBatches(allBatches);

            // Reset sliders
            const initial = {};
            siblings.forEach(b => { initial[b._id] = 0; });
            setSliderValues(initial);

            // Auto close after success? Maybe let the user see the toast first
            setTimeout(() => {
                setToast(null);
                onClose();
            }, 3000);

        } catch (err) {
            setToast({ type: 'error', message: err?.message || 'Failed to merge batches' });
            setTimeout(() => setToast(null), 3500);
        } finally {
            setIsMoving(false);
        }
    };

    const hasPendingMoves = Object.values(sliderValues).some(v => v > 0);

    return (
        <div className="flex-1 flex flex-col xl:min-h-0 relative">
            {toast && <Toast type={toast.type} message={toast.message} />}

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
                <div className="mb-5">
                    <h3 className="text-gray-900 text-[15px] font-bold">Adjust Students Across Batches</h3>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                        You can merge or redistribute students into existing batches instead of creating a new one.
                    </p>
                </div>

                <div className="bg-[#FFF8F1] border border-[#FFEDD5] p-4 rounded-xl flex items-start gap-4 mb-6">
                    <div className="w-8 h-8 bg-[#F97316]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-[#F97316]" />
                    </div>
                    <div>
                        <p className="text-[#9A3412] text-[11px] font-medium leading-relaxed">
                            Batch <span className="font-bold">{batchData?.name || 'This batch'}</span> currently has{' '}
                            <span className="font-bold underlineDecoration decoration-[#F97316]">{sourceStudents}</span> students.
                            Merge with a sibling batch to optimize capacity.
                        </p>
                    </div>
                </div>

                <div className="mb-4">
                    <h4 className="text-gray-500 text-[11px] font-black uppercase tracking-widest">
                        Available Batches
                    </h4>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-10 h-10 text-[#5D5FEF] animate-spin mb-4" />
                        <p className="text-gray-400 font-bold text-xs">Synchronizing batches…</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {batches.map((batch) => {
                            const sliderVal = sliderValues[batch._id] ?? 0;
                            return (
                                <div
                                    key={batch._id}
                                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                        batch.isSource 
                                            ? 'bg-white border-[#5D5FEF] shadow-lg shadow-[#5D5FEF]/5 ring-4 ring-[#5D5FEF]/5' 
                                            : (sliderVal > 0 
                                                ? 'bg-[#F8FAFF] border-[#5D5FEF] shadow-md' 
                                                : 'bg-white border-gray-100 opacity-80 hover:opacity-100')
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex gap-4 items-center">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                                batch.isSource ? 'bg-[#5D5FEF]' : (sliderVal > 0 ? 'bg-[#5D5FEF]' : 'bg-gray-100')
                                            }`}>
                                                <Users className={`w-5 h-5 ${batch.isSource || sliderVal > 0 ? 'text-white' : 'text-gray-400'}`} />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 text-[14px]">
                                                    {batch.name} {batch.isSource && <span className="ml-1 text-[10px] text-[#5D5FEF] bg-[#5D5FEF]/10 px-2 py-0.5 rounded-full">(Current)</span>}
                                                </h5>
                                                <p className="text-gray-400 text-[10px] font-bold tracking-tighter">ID: {batch._id.substring(0, 12)}</p>
                                            </div>
                                        </div>

                                        {batch.isFull ? (
                                            <span className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase">Full</span>
                                        ) : batch.isSource ? (
                                            <span className="px-3 py-1 bg-[#FFFBEB] text-[#D97706] rounded-full text-[10px] font-black uppercase tracking-tighter">Source</span>
                                        ) : sliderVal > 0 ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase animate-pulse">
                                                <CheckCircle2 className="w-3 h-3" /> Target Selected
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 mb-2">
                                        <div>
                                            <p className="text-gray-400 text-[9px] font-black uppercase mb-1">Students</p>
                                            <p className="text-gray-700 font-bold text-[13px]">{batch.enrolledCount} / {batch.limit}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[9px] font-black uppercase mb-1">Moderator</p>
                                            <p className="text-gray-700 font-bold text-[13px] truncate">{batch.moderatorName || 'Pending'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[9px] font-black uppercase mb-1">{batch.isSource ? 'Status' : 'Capacity'}</p>
                                            <p className={`font-bold text-[13px] ${batch.isSource ? 'text-[#5D5FEF]' : (batch.availableSpace === 0 ? 'text-red-500' : 'text-green-600')}`}>
                                                {batch.isSource ? (batch.status || 'Active') : `${batch.availableSpace} slots`}
                                            </p>
                                        </div>
                                    </div>

                                    {!batch.isSource && batch.availableSpace > 0 && (
                                        <div className="pt-6 border-t border-gray-100 mt-4">
                                            <StudentSlider
                                                max={sourceStudents}
                                                value={sliderVal}
                                                onChange={(val) => handleSliderChange(batch._id, val)}
                                                availableSpace={batch.availableSpace}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 pb-4 border-t border-gray-100">
                <button
                    onClick={onClose}
                    disabled={isMoving}
                    className="w-full sm:flex-1 py-4 border-2 border-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all hover:border-gray-200"
                >
                    Cancel
                </button>
                <button
                    onClick={handleMoveSubmit}
                    disabled={!hasPendingMoves || isMoving}
                    className={`w-full sm:flex-1 py-4 font-black text-sm rounded-2xl transition-all shadow-xl shadow-[#5D5FEF]/20 relative overflow-hidden
                        ${hasPendingMoves 
                            ? 'bg-[#5D5FEF] text-white hover:bg-[#4C4ED6] hover:scale-[1.02] active:scale-95' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                >
                    {isMoving ? (
                        <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Moving Students…</span>
                        </div>
                    ) : (
                        'Move Students'
                    )}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}} />
        </div>
    );
};

export default AdjustStudentsTab;
