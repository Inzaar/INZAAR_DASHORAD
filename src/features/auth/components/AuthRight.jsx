
function RightAuth({children, className, parentClass}) {
  return (
    <div className={`w-[50%] max-[960px]:w-full h-full rounded-tr-2xl rounded-br-2xl max-[960px]:rounded-none flex items-center justify-center bg-orange-6001 ${parentClass} p-2`}>
      <div className={`max-w-[548px] w-full flex flex-col items-center justify-center p-10 ${className}`}>
      {children}
      </div>
    </div>
  )
}

export default RightAuth
