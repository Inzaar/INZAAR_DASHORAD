import React, { useRef } from 'react';

function OtpInput({ length = 6, value = '', onChange }) {
  const inputRefs = useRef([]);

  // Ensure value is an array of length
  const otpDigits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // Only allow digits

    const newOtp = [...otpDigits];
    // Take the last character typed if multiple
    const digit = val.substring(val.length - 1);
    newOtp[index] = digit;
    
    const combined = newOtp.join('');
    onChange(combined);

    // Auto focus next input if digit entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move focus back on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pasteData)) return; // Only allow numbers

    const digits = pasteData.slice(0, length).split('');
    const newOtp = [...otpDigits];
    digits.forEach((d, idx) => {
      newOtp[idx] = d;
      if (inputRefs.current[idx]) {
        inputRefs.current[idx].value = d;
      }
    });

    onChange(newOtp.join(''));

    // Focus last pasted or next index
    const nextIndex = Math.min(digits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center items-center w-full my-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otpDigits[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-gray-800 border border-[#71717A]/30 rounded-lg outline-none focus:border-[#B566E7] focus:ring-2 focus:ring-[#B566E7]/20 transition-all duration-200 shadow-sm"
        />
      ))}
    </div>
  );
}

export default OtpInput;
