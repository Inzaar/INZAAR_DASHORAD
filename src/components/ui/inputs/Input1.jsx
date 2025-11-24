import React from 'react'

function Input1({name}) {
  return (
    <div className={`h-[76px] max-w-[500px] w-full flex flex-col items-start justify-between `}>
      <label className='text-[#18181B] text-[16px]'>{name}</label>  
      <input type='text' placeholder={`enter ${name}`} className='max-w-[500px] w-full h-[52px] border border-[#71717A]/30 outline-[#71717A] text-[#71717A] text-[14px] rounded px-2 transition-all duration-200'/>
    </div>
  )
}

export default Input1
