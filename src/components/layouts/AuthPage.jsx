
export default function AuthPage({children, className, parenntClass}) {
  return (
    <div className={`w-[100vw] h-[100vh] bg-black flex justify-center items-center ${parenntClass}`}>
      <div className={`max-w-[1280px] w-full max-h-[862px] rounded-2xl h-full bg-white ${className}`}>
          {children}
        </div>
    </div>
  )
}
