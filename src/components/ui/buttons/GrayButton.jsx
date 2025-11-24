import React from 'react'

function GrayButton({children, className}) {
  return (
    <div className={`bg-gray-100 w-full flex items-center justify-center  ${className}`}>
      {children}
    </div>
  )
}

export default GrayButton
