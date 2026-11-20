import React, { useEffect, useRef } from 'react'

function Textarea1({ name, label, placeholder, value, onChange, ...props }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="w-full flex flex-col items-start gap-1 sm:gap-1.5 mb-3 sm:mb-4">
      <label className="text-xs sm:text-[14px] md:text-[15px] font-medium text-[#18181B] leading-tight">{label || name}</label>
      <textarea
        ref={textareaRef}
        name={name}
        placeholder={placeholder ? `Enter ${placeholder}` : `Enter ${name}`}
        value={value}
        onChange={onChange}
        className="w-full min-h-[46px] sm:min-h-[52px] border border-[#71717A]/30 outline-[#71717A] text-[#71717A] text-xs sm:text-[14px] rounded p-2.5 sm:p-3 transition-all duration-200 resize-none overflow-hidden"
        {...props}
      />
    </div>
  )
}

export default Textarea1
