import React from 'react';

function RightAuth({children, className = '', parentClass = ''}) {
  return (
    <div 
      className={`w-[50%] max-[960px]:w-full h-full rounded-tr-2xl rounded-br-2xl max-[960px]:rounded-none flex items-start justify-center ${parentClass} overflow-y-auto`}
    >
      <div className={`max-w-[548px] w-full flex flex-col items-center px-4 py-6 sm:px-8 sm:py-8 md:p-10 ${className}`}>
      {children}
      </div>
    </div>
  )
}

export default RightAuth
