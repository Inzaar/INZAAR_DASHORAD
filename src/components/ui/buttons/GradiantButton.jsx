
function GradiantButton({ className, children, onClick }) {
  return (
    <div onClick={onClick} className={`cursor-pointer transition-all duration-300 transform active:scale-95 hover:shadow-lg text-white bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right flex items-center justify-center ${className}`}>
      {children}
    </div>
  )
}

export default GradiantButton
