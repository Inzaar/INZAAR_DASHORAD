function Sideabrbbutton({ children, isActive, onClick }) {
  return (
    <label
      onClick={onClick}
      className={`w-full py-2.5 px-3 flex items-center justify-start text-[16px] cursor-pointer text-left transition-all rounded-lg
      ${isActive
          ? 'text-[#265CEB] bg-[#265CEB]/10 font-medium'
          : 'text-[#6A6F78] hover:text-[#265CEB] hover:bg-gray-50'
        }
      `}
    >
      {/* 
      <input
        type='checkbox'
        className='w-[12px] h-[12px] accent-[#265CEB]'

        checked={isActive}

        readOnly
      />
      */}
      <div className="select-none flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left pr-2">
        {children}
      </div>
    </label>
  )
}

export default Sideabrbbutton