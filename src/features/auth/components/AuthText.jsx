import { Link } from 'react-router-dom';

function AuthText({ className, isRegisterPage = false }) {
  return (
    <div className={`max-w-[383px] h-[60px] flex flex-col items-center justify-center text-center gap-3 ${className}`}>
      <p className="font-[500] text-[16px] text-gray-800">
        {isRegisterPage ? (
          <>Already have an account? <Link to="/login" className="text-[#B566E7] hover:underline">Login</Link></>
        ) : (
          <>No account? <Link to="/register" className="text-[#B566E7] hover:underline">Create one</Link></>
        )}
      </p>
      <p className="text-[#2B2B2B] font-[400] text-[14px]">By continuing, you agree to our Terms and Privacy Policy.</p>
    </div>
  )
}

export default AuthText
