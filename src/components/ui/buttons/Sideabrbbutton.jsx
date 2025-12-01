
function Sideabrbbutton({children}) {
  return (
    <div className='w-full h-[44px] flex items-center justify-start gap-[10px] text-[16px] text-[#6A6F78] hover:text-[#265CEB]'>
      <input type='checkbox' className='w-[12px] h-[12px]'/>
      <p>
        {children}
      </p>
    </div>
  )
}

export default Sideabrbbutton
