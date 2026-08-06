import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, PlusCircle, User, Users, Loader2, Check, Edit2, UserX } from 'lucide-react';
import BatchInformation from './BatchInformation';
import AdjustStudentsTab from './AdjustStudentsTab';
import { fetchAllModerators, assignBatch, removeModerator } from '../../../api/user';
import CreateModeratorModal from '../../../features/adminDashborad/components/CreateModeratorModal';
import { toast } from 'react-hot-toast';

const BatchManagementModal = ({ isOpen, onClose, batchData, initialTab = 'assign' }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [moderators, setModerators] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assigningId, setAssigningId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [assignedModId, setAssignedModId] = useState(batchData?.assignedModerator?._id || batchData?.assignedModerator);
    const [isEditMode, setIsEditMode] = useState(!(batchData?.assignedModerator?._id || batchData?.assignedModerator));
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Custom error popup state
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Sync state with batchData when it opens
    useEffect(() => {
        if (isOpen && batchData) {
            const modId = batchData.assignedModerator?._id || batchData.assignedModerator;
            setAssignedModId(modId);
            setIsEditMode(!modId);
        }
    }, [isOpen, batchData]);

    // Fetch moderators from backend
    useEffect(() => {
        const getModerators = async () => {
            if (isOpen) {
                setLoading(true);
                try {
                    const response = await fetchAllModerators();
                    if (response.success) {
                        setModerators(response.data.moderatorList);
                    }
                } catch (error) {
                    console.error("Error fetching moderators:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        getModerators();
    }, [isOpen]);

    const handleAssign = async (moderatorId) => {
        const batchId = batchData?._id || batchData?.id;
        if (!batchId) {
            toast.error("No Batch ID found for assignment");
            return;
        }

        setAssigningId(moderatorId);
        try {
            const response = await assignBatch(moderatorId, batchId);
            if (response.success) {
                setAssignedModId(moderatorId);
                setIsEditMode(false);
                // Refresh moderator list to show updated batch counts
                const modResponse = await fetchAllModerators();
                if (modResponse.success) {
                    setModerators(modResponse.data.moderatorList);
                }
            }
        } catch (error) {
            console.error("Failed to assign moderator:", error);
            const errMsg = error.response?.data?.message || error.message || "Failed to assign moderator";
            
            // Show custom popup for the enrollment conflict
            if (errMsg.includes("already enrolled as a student")) {
                setErrorMessage(errMsg);
                setShowErrorPopup(true);
            } else {
                toast.error(errMsg);
            }
        } finally {
            setAssigningId(null);
        }
    };

    const handleRemove = async () => {
        const batchId = batchData?._id || batchData?.id;
        if (!batchId) return;

        setAssigningId('removing');
        try {
            const response = await removeModerator(batchId);
            if (response.success) {
                // Reset to unassigned state
                setAssignedModId(null);
                setIsEditMode(true);
                // Refresh moderator list
                const modResponse = await fetchAllModerators();
                if (modResponse.success) {
                    setModerators(modResponse.data.moderatorList);
                }
            }
        } catch (error) {
            console.error("Failed to remove moderator:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to remove moderator";
            toast.error(errorMessage);
        } finally {
            setAssigningId(null);
        }
    };

    // Reset tab when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    // Filter moderators based on search and gender
    const filteredModerators = moderators.filter(mod => {
        // Enforce gender segregation: if batch is Male or Female, only show matching moderators
        const requiredGender = batchData?.genderType;
        if (requiredGender === 'Male' || requiredGender === 'Female') {
            if (mod.gender !== requiredGender) return false;
        }

        return mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               mod.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Batch Management</h2>
                        <p className="text-gray-400 text-xs mt-0.5">Assign moderators or redistribute students across batches.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                    >
                        <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col xl:min-h-0 overflow-y-auto xl:overflow-hidden px-4 sm:px-6 pt-6 no-scrollbar">

                    {/* Batch Info Component */}
                    <BatchInformation data={batchData} />

                    {/* Tabs Navigation */}
                    <div className="mt-6 border-b border-gray-100 flex gap-8">
                        <button
                            onClick={() => setActiveTab('assign')}
                            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'assign' ? 'text-[#5D5FEF]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Assign Moderator
                            {activeTab === 'assign' && (
                                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#5D5FEF] rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'students' ? 'text-[#5D5FEF]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Adjust Students
                            {activeTab === 'students' && (
                                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#5D5FEF] rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* Tab Content Area */}
                    <div className="flex-1 xl:min-h-0 mt-6 relative flex flex-col overflow-visible xl:overflow-hidden">
                        {activeTab === 'assign' && (
                            <div className="flex-1 xl:min-h-0 flex flex-col overflow-visible xl:overflow-hidden">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-gray-900 text-sm font-bold">Assign Moderator</h3>
                                        <p className="text-gray-400 text-[10px] sm:text-[11px] mt-1 leading-relaxed max-w-sm">
                                            Choose a moderator responsible for managing this batch. You can change or remove the assignment at any time.
                                        </p>
                                    </div>
                                    {/* Action buttons — only shown when a moderator is assigned and we're NOT in edit mode */}
                                    {assignedModId && !isEditMode && (
                                        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <button
                                                onClick={() => setIsEditMode(true)}
                                                className="flex items-center gap-2 px-3 py-2 bg-[#5D5FEF]/5 text-[#5D5FEF] rounded-xl text-[10px] font-bold hover:bg-[#5D5FEF]/10 transition-all active:scale-95 border border-[#5D5FEF]/10 hover:border-[#5D5FEF]/20"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Change
                                            </button>
                                            <button
                                                onClick={handleRemove}
                                                disabled={assigningId !== null}
                                                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold hover:bg-red-100 transition-all active:scale-95 border border-red-100/30 hover:border-red-200"
                                            >
                                                {assigningId === 'removing' ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <UserX className="w-3.5 h-3.5" />
                                                )}
                                                Remove Moderator
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="flex items-center gap-2 px-5 py-2 bg-[#5D5FEF] text-white rounded-xl text-[10px] font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-md shadow-[#5D5FEF]/20"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Done
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Search Bar (Fixed at top of tab) */}
                                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative group">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 group-focus-within:text-[#5D5FEF] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search moderators..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/10 focus:bg-white focus:border-[#5D5FEF]/20 transition-all text-[11px]"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="px-4 py-2 border border-[#5D5FEF] text-[#5D5FEF] rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-[#5D5FEF] hover:text-white transition-all active:scale-95"
                                    >
                                        <PlusCircle className="w-4 h-4" /> Add New
                                    </button>
                                </div>
                                 {/* Moderator List (Independently Scrollable on Desktop) */}
                                 <div className="flex-1 overflow-y-visible xl:overflow-y-auto mt-4 pr-1 space-y-3 custom-scrollbar pb-6">
                                      {loading ? (
                                          <div className="flex flex-col items-center justify-center py-10 gap-3">
                                              <Loader2 className="w-8 h-8 text-[#5D5FEF] animate-spin" />
                                              <p className="text-gray-400 text-xs font-medium">Fetching moderators...</p>
                                          </div>
                                      ) : filteredModerators.length === 0 ? (
                                          <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                              <p className="text-gray-400 text-xs">No moderators found</p>
                                          </div>
                                      ) : (
                                          filteredModerators.map((mod, i) => (
                                              <div
                                                  key={mod.id || i}
                                                  className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[#5D5FEF]/30 hover:shadow-lg hover:shadow-gray-500/5 transition-all group"
                                              >
                                                  <div className="flex gap-4 items-center w-full sm:flex-1 min-w-0">
                                                      <div className={`rounded-full text-white shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden w-10 h-10 ${!mod.imageUrl ? 'bg-[#3758EE]' : ''}`}>
                                                          {mod.imageUrl ? (
                                                              <img src={mod.imageUrl} alt={mod.name} className="w-full h-full object-cover" />
                                                          ) : (
                                                              <User className="w-5 h-5" />
                                                          )}
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                          <h4 className="font-bold text-gray-900 text-sm truncate">{mod.name}</h4>
                                                          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-0.5">
                                                              <p className="text-gray-400 text-[10px] flex items-center gap-1.5 min-w-0">
                                                                  <span className="opacity-60 text-[8px]">📧</span> <span className="truncate">{mod.email}</span>
                                                              </p>
                                                              <p className="text-gray-400 text-[10px] flex items-center gap-1.5 whitespace-nowrap">
                                                                  <span className="opacity-60 text-[8px]">💼</span> {mod.batches || 0} batches
                                                              </p>
                                                          </div>
                                                          <div className="flex flex-wrap gap-1.5 mt-2">
                                                              {mod.tags && mod.tags.length > 0 ? (
                                                                  mod.tags.map((tag, j) => (
                                                                      <span key={j} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-[9px] font-bold border border-gray-100 group-hover:bg-[#5D5FEF]/5 group-hover:border-[#5D5FEF]/10 group-hover:text-[#5D5FEF] transition-colors">{tag}</span>
                                                                  ))
                                                              ) : (
                                                                  <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[9px] font-bold border border-gray-50 italic">No tags assigned</span>
                                                              )}
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <button
                                                      onClick={() => handleAssign(mod.id)}
                                                      disabled={
                                                          assigningId !== null ||
                                                          // In read-only mode: block all cards
                                                          (!isEditMode && assignedModId) ||
                                                          // In read-only mode: the assigned card is visually locked
                                                          (mod.id === assignedModId && !isEditMode)
                                                      }
                                                      className={`w-full sm:w-auto px-5 py-2 rounded-lg font-bold text-xs shadow-md transition-all active:scale-95 flex-shrink-0 flex items-center justify-center gap-2 
                                                         ${
                                                             // Show green "Assigned" ONLY when not in edit mode
                                                             mod.id === assignedModId && !isEditMode
                                                                 ? 'bg-green-500 text-white cursor-default'
                                                                 : 'bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right text-white'
                                                         } 
                                                         ${
                                                             // Dim when globally disabled
                                                             (assigningId !== null || (!isEditMode && assignedModId && mod.id !== assignedModId))
                                                                 ? 'opacity-50 cursor-not-allowed grayscale-[0.5]'
                                                                 : 'hover:scale-[1.02]'
                                                         }`}
                                                  >
                                                      {assigningId === mod.id ? (
                                                          <>
                                                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                              Assigning...
                                                          </>
                                                      ) : mod.id === assignedModId && !isEditMode ? (
                                                          <>
                                                              <Check className="w-3.5 h-3.5" />
                                                              Assigned
                                                          </>
                                                      ) : (
                                                          'Assign'
                                                      )}
                                                  </button>
                                              </div>
                                          ))
                                      )}
                                 </div>
                             </div>
                        )}

                        {activeTab === 'students' && (
                            <AdjustStudentsTab
                                batchData={batchData}
                                onClose={onClose}
                            />
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar {
                     width: 6px;
                 }
                 .custom-scrollbar::-webkit-scrollbar-track {
                     background: #f1f5f9;
                     border-radius: 10px;
                 }
                 .custom-scrollbar::-webkit-scrollbar-thumb {
                     background: #cbd5e1;
                     border-radius: 10px;
                     border: 1px solid #f1f5f9;
                 }
                 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                     background: #94a3b8;
                 }
            `}} />

            <CreateModeratorModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSuccess={async () => {
                    // Refetch moderators to include the newly created one
                    setLoading(true);
                    try {
                        const response = await fetchAllModerators();
                        if (response.success) {
                            setModerators(response.data.moderatorList);
                        }
                    } catch (error) {
                        console.error("Error fetching moderators:", error);
                    } finally {
                        setLoading(false);
                    }
                }} 
            />

            {/* Custom Error Popup for Conflict */}
            {showErrorPopup && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm p-8 relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowErrorPopup(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col items-center text-center gap-5 pt-2">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2 border-4 border-red-100">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Assignment Conflict</h3>
                                <p className="text-[14px] leading-relaxed text-gray-500 font-medium">{errorMessage}</p>
                            </div>
                            <button
                                onClick={() => setShowErrorPopup(false)}
                                className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white font-bold text-[14px] shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchManagementModal;
