import React from "react";
import { IoWarningOutline } from "react-icons/io5";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { HiOutlineShieldExclamation } from "react-icons/hi2";

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = "danger", confirmText = "Confirm", loading = false }) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <RiDeleteBin6Fill size={28} />,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      buttonBg: "bg-red-500 hover:bg-red-600",
    },
    warning: {
      icon: <HiOutlineShieldExclamation size={28} />,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      buttonBg: "bg-amber-500 hover:bg-amber-600",
    },
    info: {
      icon: <IoWarningOutline size={28} />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      buttonBg: "bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right",
    },
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fadeIn"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-[420px] p-0 overflow-hidden animate-scaleIn">
        {/* Top accent bar */}
        <div className={`h-[4px] w-full ${type === "danger" ? "bg-red-500" : type === "warning" ? "bg-amber-500" : "bg-gradient-to-r from-[#3758EE] to-[#B666E7]"}`} />

        <div className="px-6 pt-6 pb-5">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-[56px] h-[56px] rounded-full ${config.iconBg} ${config.iconColor} flex items-center justify-center`}>
              {config.icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-center text-[18px] font-bold text-gray-800 mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-center text-[14px] text-gray-500 leading-relaxed mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-[44px] rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-[14px] font-semibold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 h-[44px] rounded-lg text-white text-[14px] font-semibold transition-all duration-200 disabled:opacity-70 ${config.buttonBg}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

export default ConfirmDialog;
