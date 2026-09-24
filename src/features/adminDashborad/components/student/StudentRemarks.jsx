import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import GradiantButton from '@/components/ui/buttons/GradiantButton';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const StudentRemarks = ({ profileData, setProfileData }) => {
    const [newRemark, setNewRemark] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const remarks = profileData?.user?.remarks || [];

    const handleAddRemark = async (e) => {
        e.preventDefault();
        if (!newRemark.trim()) return;

        setIsSubmitting(true);
        const toastId = toast.loading('Adding remark...');

        try {
            const res = await axiosInstance.post(`/admin/students/${profileData.user._id}/remarks`, { text: newRemark });
            if (res.data?.data) {
                // Update profileData locally
                setProfileData((prev) => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        remarks: res.data.data,
                    },
                }));
                setNewRemark('');
                toast.success('Remark added successfully!', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Failed to add remark', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 mt-[20px]">
            <h3 className="text-[18px] font-medium text-gray-800 mb-6">Remarks History</h3>

            <div className="space-y-6">
                {/* Remarks List */}
                {remarks.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No remarks added yet.
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {remarks.slice().reverse().map((remark, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{remark.text}</p>
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                    <span className="font-medium">Added by Admin/Moderator</span>
                                    <span>{formatDate(remark.date)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add New Remark */}
                <form onSubmit={handleAddRemark} className="mt-6 border-t border-gray-100 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add New Remark</label>
                    <textarea
                        value={newRemark}
                        onChange={(e) => setNewRemark(e.target.value)}
                        placeholder="Enter your remarks about this student..."
                        className="w-full min-h-[100px] rounded-[12px] border border-gray-200 p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm resize-y"
                    ></textarea>
                    <div className="flex justify-end mt-4">
                        <GradiantButton
                            type="submit"
                            disabled={isSubmitting || !newRemark.trim()}
                            className="px-6 py-2 rounded-[4px] text-sm font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Add Remark'}
                        </GradiantButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentRemarks;
