import React, { useState, useEffect } from 'react';
import { Box, Check } from 'lucide-react';

const AssignManagementAccessModal = ({ isOpen, onClose, onSave, assignedFeatures = [] }) => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Remaining assignable features (Student Reports, Moderator Reports, and Course Reports are automatically assigned)
      const assignableList = [
        "Export Student Reports",
        "Export Moderator Reports"
      ];

      const dbFeatures = assignableList.map(f => ({
        id: f,
        label: f,
        checked: (assignedFeatures || []).includes(f)
      }));
      setFeatures(dbFeatures);
    } else {
      setFeatures([]); // Clear when closed
    }
  }, [isOpen, assignedFeatures]);

  if (!isOpen) return null;

  const toggleFeature = (id) => {
    setFeatures(features.map(f =>
      f.id === id ? { ...f, checked: !f.checked } : f
    ));
  };

  const handleSave = () => {
    // Zero additional features is valid and can continue without error
    const selectedFeatures = features.filter(f => f.checked).map(f => f.label);
    onSave({ features: selectedFeatures });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white w-full max-w-[750px] max-h-[90vh] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-50 flex-shrink-0">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Box size={20} className="text-indigo-600" />
          </div>
          <h2 className="text-[22px] font-bold text-gray-800">Update Management Access</h2>
        </div>

        <div className="px-8 py-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* Automatically Assigned Features Info */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-[16px] p-4">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              Default Features (Automatically Assigned)
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full shadow-2xs">
                <Check size={12} strokeWidth={3} /> Student Reports
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full shadow-2xs">
                <Check size={12} strokeWidth={3} /> Moderator Reports
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full shadow-2xs">
                <Check size={12} strokeWidth={3} /> Course Reports
              </span>
            </div>
          </div>

          {/* Additional Assignable Features List */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-1">Additional Assignable Features</h3>
            <p className="text-xs text-gray-400 mb-3">Optional. You can continue with zero additional features selected.</p>
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

export default AssignManagementAccessModal;
