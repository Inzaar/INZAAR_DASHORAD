
export default function AuthPage({children, className, parenntClass}) {
  return (
    <div className={`w-screen h-screen bg-black flex justify-center items-center ${parenntClass} overflow-hidden`}>
      <div className={`max-w-[1280px] w-full min-h-[500px] max-h-[95vh] max-[960px]:max-h-screen rounded-2xl max-[960px]:rounded-none h-[862px] max-[960px]:h-full bg-white flex items-center justify-between ${className} shadow-2xl`}>
          {children}
        </div>
    </div>
  )
}
