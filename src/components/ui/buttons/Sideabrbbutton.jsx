import React from 'react'

function Sideabrbbutton({children}) {
  return (
    <div className='max-w-[194px] bg-red-600 flex items-center justify-evenly text-[16px] text-[#6A6F78] hover:text-[#265CEB]'>
      <input type='checkbox' className='w-[12px] h-[12px]'/>
      <p>
        {children}
      </p>
    </div>
  )
}

export default Sideabrbbutton
