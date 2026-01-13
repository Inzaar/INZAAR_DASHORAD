function Sideabrbbutton({ children, isActive, onClick }) {
  return (
    <label
      onClick={onClick}
      className={`w-full h-[44px] flex items-center justify-start gap-[10px] text-[16px] cursor-pointer
      ${isActive
          ? 'text-[#265CEB]'
          : 'text-[#6A6F78] hover:text-[#265CEB]' // Added hover here for consistency
        }
      `}
    >
      <input
        type='checkbox'
        className='w-[12px] h-[12px] accent-[#265CEB]'

        checked={isActive}

        readOnly
      />
      <p className="select-none">
        {children}
      </p>
    </label>
  )
}

export default Sideabrbbutton