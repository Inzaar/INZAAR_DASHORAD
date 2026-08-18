import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react';

function Input1({ name, label, type = 'text', placeholder, value, onChange, isError, error, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const hasError = isError || Boolean(error);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`h-[76px] w-full flex flex-col items-start justify-between `}>
      <label className='text-[#18181B] text-[16px]'>{label || name}</label>
      <div className="relative w-full ">
        <input
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={`Enter ${placeholder || name}`}
          value={value}
          onChange={onChange}
          className={`w-full h-[52px] border ${hasError ? 'border-red-500 focus:border-red-500 outline-red-500' : 'border-[#71717A]/30 outline-[#71717A]'} text-[#71717A] text-[14px] rounded px-2 transition-all duration-200 ${isPassword ? 'pr-10' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default Input1
