import React, { useState, useEffect } from 'react';
import { X, Search, PlusCircle, User, Users } from 'lucide-react';
import BatchInformation from './BatchInformation';
import AdjustStudentsTab from './AdjustStudentsTab';

const BatchManagementModal = ({ isOpen, onClose, batchData, initialTab = 'assign' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    // Reset tab when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const moderators = [
        { name: "Ali Khar", email: "ali@lms.com", batches: 2, tags: ["Digital Marketing", "SEO", "Content Marketing"] },
        { name: "Sara Ahmed", email: "sara@lms.com", batches: 1, tags: ["Digital Marketing", "Social Media", "Analytics"] },
        { name: "Hassan Raza", email: "hassan@lms.com", batches: 3, tags: ["Web Development", "JavaScript", "React"] },
        { name: "Fatima Noor", email: "fatima@lms.com", batches: 1, tags: ["Data Science", "Python", "Machine Learning"] },
        { name: "Zainab Khan", email: "zainab@lms.com", batches: 2, tags: ["UI/UX Design", "Figma", "Branding"] },
        { name: "Umer Sheikh", email: "umer@lms.com", batches: 4, tags: ["Backend", "Node.js", "MongoDB"] },
        { name: "Ayesha Bibi", email: "ayesha@lms.com", batches: 0, tags: ["Quality Assurance", "Testing"] },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
                                <h3 className="text-gray-900 text-sm font-bold">Assign Moderator</h3>
                                <p className="text-gray-400 text-[10px] mt-0.5">Choose a moderator responsible for managing this batch.</p>

                                {/* Search Bar (Fixed at top of tab) */}
                                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative group">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 group-focus-within:text-[#5D5FEF] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search moderators..."
                                            className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]/10 focus:bg-white focus:border-[#5D5FEF]/20 transition-all text-[11px]"
                                        />
                                    </div>
                                    <button className="px-4 py-2 border border-[#5D5FEF] text-[#5D5FEF] rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-[#5D5FEF] hover:text-white transition-all active:scale-95">
                                        <PlusCircle className="w-4 h-4" /> Add New
                                    </button>
                                </div>

                                {/* Moderator List (Independently Scrollable on Desktop) */}
                                <div className="flex-1 overflow-y-visible xl:overflow-y-auto mt-4 pr-1 space-y-3 custom-scrollbar pb-6">
                                    {moderators.map((mod, i) => (
                                        <div
                                            key={i}
                                            className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[#5D5FEF]/30 hover:shadow-lg hover:shadow-gray-500/5 transition-all group"
                                        >
                                            <div className="flex gap-4 items-center w-full sm:flex-1 min-w-0">
                                                <div className="bg-[#3758EE] p-2.5 rounded-full text-white shadow-md flex-shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-sm truncate">{mod.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-0.5">
                                                        <p className="text-gray-400 text-[10px] flex items-center gap-1.5 min-w-0">
                                                            <span className="opacity-60 text-[8px]">📧</span> <span className="truncate">{mod.email}</span>
                                                        </p>
                                                        <p className="text-gray-400 text-[10px] flex items-center gap-1.5 whitespace-nowrap">
                                                            <span className="opacity-60 text-[8px]">💼</span> {mod.batches} batches
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {mod.tags.map((tag, j) => (
                                                            <span key={j} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-[9px] font-bold border border-gray-100 group-hover:bg-[#5D5FEF]/5 group-hover:border-[#5D5FEF]/10 group-hover:text-[#5D5FEF] transition-colors">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right text-white rounded-lg font-bold text-xs shadow-md hover:scale-[1.02] transition-all active:scale-95 flex-shrink-0">
                                                Assign
                                            </button>
                                        </div>
                                    ))}
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
        </div>
    );
};

export default BatchManagementModal;
