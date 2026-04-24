import React, { useState, useEffect } from 'react';
import { X, Box, Check } from 'lucide-react';
import { getModeratorFeatures } from '@/api/user';

const AssignModeratorModal = ({ isOpen, onClose, onSave, assignedFeatures = [], initialRole = '' }) => {
  const [selectedRole, setSelectedRole] = useState(initialRole || '');
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole || '');
    }
  }, [initialRole, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchFeatures = async () => {
        try {
          const res = await getModeratorFeatures();
          if (res?.data) {
            const dbFeatures = res.data.map(f => ({
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
    setFeatures(features.map(f =>
      f.id === id ? { ...f, checked: !f.checked } : f
    ));
  };

  const handleSave = () => {
    const selectedFeatures = features.filter(f => f.checked).map(f => f.label);
    
    if (selectedFeatures.length === 0) {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error("Choose at least one feature");
      });
      return;
    }
    
    onSave({ selectedRole, features: selectedFeatures });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white w-full max-w-[750px] max-h-[90vh] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-50 flex-shrink-0">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Box size={20} className="text-indigo-600" />
          </div>
          <h2 className="text-[22px] font-bold text-gray-800">Assign Student As Moderator</h2>
        </div>

        <div className="px-8 py-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Assign Role</label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-gray-100 rounded-[12px] px-4 py-3 text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Available Roles</option>
                <option value="moderator">Moderator</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-4">Assigned Features</h3>
            <div className="bg-gray-50/50 rounded-[20px] p-2 space-y-2">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className="bg-white rounded-[12px] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all border border-gray-50"
                >
                  <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                  <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center transition-all ${feature.checked ? 'bg-[#3758EE]' : 'border-2 border-gray-200'}`}>
                    {feature.checked && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-10 py-3 bg-[#F5F5F5] text-gray-600 rounded-[12px] font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-16 py-3 bg-gradient-to-r from-[#4E6BFF] to-[#8E6BFF] text-white rounded-[12px] font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModeratorModal;
