
function GradiantButton({className, content}) {
  return (
    <div className={` text-white bg-gradient-to-r from-[#3758EE] to-[#B666E7] flex items-center justify-center ${className}`}>
      {/* Enroll Now */}
      {content}
    </div>
  )
}

export default GradiantButton
