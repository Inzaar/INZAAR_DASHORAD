import React from 'react'

function PhoneInput() {
  return (
    <div className='max-w-[500px] w-full h-[52px] border border-[#71717A]/30 rounded px-3 flex items-center justify-between transition-all duration-200 focus-within:border-[#71717A] focus-within:ring-1 focus-within:ring-[#71717A]'>
      
      <div className="mr-3 text-sm text-gray-500">Flag</div>

      <input 
        type="text" 
        placeholder='enter phone number' 
        className='w-full h-full outline-none text-[#71717A] text-[14px] bg-transparent'
      />
    </div>
  )
}

export default PhoneInput