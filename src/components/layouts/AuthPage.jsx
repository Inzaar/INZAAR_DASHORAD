
export default function AuthPage({children, className, parenntClass}) {
  return (
    <div className={`w-[100vw] h-[100vh] bg-black flex justify-center items-center ${parenntClass}`}>
      <div className={`max-w-[1280px] w-full max-h-[862px] max-[960px]:max-h-[100vh] rounded-2xl max-[960px]:rounded-none h-full bg-white flex items-center justify-between ${className}`}>
          {children}
        </div>
    </div>
  )
}
