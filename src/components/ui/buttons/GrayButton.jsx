import React from 'react'

function GrayButton({ children, className }) {
  return (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      {children}
    </div>
  )
}

export default GrayButton
