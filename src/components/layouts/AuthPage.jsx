
export default function AuthPage({children, className = '', parenntClass = ''}) {
  return (
    <div className={`w-full min-h-screen max-[960px]:h-auto bg-black max-[960px]:bg-white flex justify-center items-center ${parenntClass} overflow-x-hidden`}>
      <div className={`max-w-[1280px] w-full min-h-[500px] max-h-[95vh] max-[960px]:max-h-none rounded-2xl max-[960px]:rounded-none h-[862px] max-[960px]:h-auto max-[960px]:min-h-screen bg-white flex items-center justify-between ${className} shadow-2xl max-[960px]:shadow-none`}>
          {children}
        </div>
    </div>
  )
}
