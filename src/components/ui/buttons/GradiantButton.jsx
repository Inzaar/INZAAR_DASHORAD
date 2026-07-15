
function GradiantButton({ className, children, onClick, ...props }) {
  return (
    <button
      {...props}
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg text-white bg-gradient-to-r from-[#3758EE] via-[#B666E7] to-[#3758EE] bg-[length:200%_auto] hover:bg-right flex items-center justify-center ${className}`}
    >
      <span className="leading-[1.8] py-0.5 w-full flex items-center justify-center">{children}</span>
    </button>
  )
}

export default GradiantButton
