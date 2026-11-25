import React, { useState, useEffect } from 'react';
import { X, Box, Check } from 'lucide-react';
import { getModeratorFeatures } from '@/api/user';

const AssignModeratorModal = ({ isOpen, onClose, onSave, assignedFeatures = [], initialTier = '' }) => {
  const [selectedTier, setSelectedTier] = useState(initialTier || '');
  const [features, setFeatures] = useState([]);

  let limit = 0;
  if (selectedTier === 'Junior') limit = 0;
  else if (selectedTier === 'Standard') limit = 2;
  else if (selectedTier === 'Senior') limit = 5;
  else if (selectedTier === 'Lead') limit = Infinity;

  const currentSelectedCount = features.filter(f => f.checked).length;

  useEffect(() => {
    if (isOpen) {
      setSelectedTier(initialTier || '');
    }
  }, [initialTier, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchFeatures = async () => {
        try {
          const res = await getModeratorFeatures();
          if (res?.data) {
            const dbFeatures = res.data
              .filter(f => !['Student Profiles', 'Reports & Logs', 'My Batches'].includes(f.name))
              .map(f => ({
                id: f._id || f.key || f.name,
                label: f.name,
                checked: (assignedFeatures || []).includes(f.name) || (assignedFeatures || []).includes(f.key)
              }));
            setFeatures(dbFeatures);
          }
        } catch (err) {
          console.error("Failed to fetch moderator features", err);
        }
      };
      fetchFeatures();
    } else {
      setFeatures([]); // Clear when closed
    }
    // Only re-run when modal opens/closes to prevent overwriting user clicks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleFeature = (id) => {
    setFeatures(features.map(f => {
      if (f.id === id) {
        if (!f.checked && currentSelectedCount >= limit) {
          import('react-hot-toast').then(({ default: toast }) => {
            toast.error(`${selectedTier || 'Selected'} Moderators can only have up to ${limit} extra features.`);
          });
          return f;
        }
        return { ...f, checked: !f.checked };
      }
      return f;
    }));
  };

  const handleSave = () => {
    const selectedFeatures = features.filter(f => f.checked).map(f => f.label);
    onSave({ selectedRole: 'moderator', moderatorTier: selectedTier, features: selectedFeatures });
  };

  const handleTierChange = (e) => {
    const tier = e.target.value;
    setSelectedTier(tier);

    let defaultFeatures = [];
    if (tier === 'Standard') defaultFeatures = ['Batches', 'Courses Management'];
    else if (tier === 'Senior') defaultFeatures = ['Batches', 'Courses Management', 'Management', 'Student Reports', 'Course Reports'];

    setFeatures(features.map(f => {
      if (tier === 'Lead') return { ...f, checked: true };
      if (tier === 'Junior' || !tier) return { ...f, checked: false };
      return {
        ...f,
        checked: defaultFeatures.includes(f.label)
      };
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-2.5 sm:p-4 font-sans" onClick={onClose}>
      <div className="bg-white w-full max-w-[750px] max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-2xl sm:rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between gap-2.5 px-4 sm:px-6 xl:px-8 py-3.5 sm:py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
              <Box size={18} className="text-indigo-600 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-[15px] sm:text-xl xl:text-[22px] font-bold text-gray-800 leading-snug break-words">
              Assign Student As Moderator
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 xl:px-8 py-4 sm:py-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Role Selection */}
          <div className="mb-4 sm:mb-6 xl:mb-8">
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">Assign Role</label>
            <div className="relative">
              <select
                value={selectedTier}
                onChange={handleTierChange}
                className="w-full bg-[#FAFAFA] border border-gray-200 sm:border-gray-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 pr-9 text-gray-600 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Available Roles</option>
                <option value="Junior">Junior Moderator</option>
                <option value="Standard">Standard Moderator</option>
                <option value="Senior">Senior Moderator</option>
                <option value="Lead">Lead Moderator</option>
              </select>
              <div className="absolute inset-y-0 right-3 sm:right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2.5 sm:mb-4">Assigned Features</h3>
            <div className="bg-gray-50/70 rounded-xl sm:rounded-[20px] p-1.5 sm:p-2 space-y-1.5 sm:space-y-2">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className="bg-white rounded-lg sm:rounded-[12px] px-3 py-2.5 sm:p-4 flex items-center justify-between gap-2 shadow-sm cursor-pointer hover:shadow-md transition-all border border-gray-100/80"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-700 leading-snug">{feature.label}</span>
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-[6px] flex items-center justify-center transition-all shrink-0 ${feature.checked ? 'bg-[#3758EE]' : 'border-2 border-gray-200'}`}>
                    {feature.checked && <Check size={13} className="text-white" strokeWidth={4} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 xl:px-8 py-3 sm:py-5 flex flex-row justify-between items-center gap-2.5 sm:gap-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none sm:px-10 py-2.5 sm:py-3 bg-[#F5F5F5] text-gray-600 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-200 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-none sm:px-16 py-2.5 sm:py-3 bg-gradient-to-r from-[#4E6BFF] to-[#8E6BFF] text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModeratorModal;
