import React from 'react'

function GrayButton({ children, className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export default GrayButton
