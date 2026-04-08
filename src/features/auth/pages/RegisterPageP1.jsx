import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import AuthLeft from '../components/AuthLeft'
import AuthPage from '../../../components/layouts/AuthPage'
import AuthRight from '../components/AuthRight'
import AuthHeading from '../components/AuthHeading'
import Input1 from '../../../components/ui/inputs/Input1'
import PhoneInput from '../../../components/ui/inputs/PhoneInput'
import GradiantButton from '../../../components/ui/buttons/GradiantButton'
import { Link } from 'react-router-dom';
import { useRegister } from '../context/RegisterContext';
import AuthText from '../components/AuthText';

function RegisterPageP1() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useRegister();
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Auto-capitalize first letter for First name, Last name, etc.
    if (["First Name", "Last Name", "Nationality", "Permanent Address"].includes(name) && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    const fieldMap = {
      "First Name": "firstname",
      "Last Name": "lastname",
      "Username": "username",
      "Email": "email",
      "Password": "password",
      "Phone number": "phone"
    };

    const backendField = fieldMap[name] || name;
    updateFormData({ [backendField]: value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    
    // Basic validation for fields
    if (!formData.firstname || !formData.lastname || !formData.username || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields (including Second Name).');
      return;
    }

    // Validation for terms
    if (!agreedToTerms) {
      setError('Please agree to the Terms of use and Privacy Policy.');
      setShouldShake(true);
      // Reset shake after animation completes
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    setError('');
    navigate('/register/step2');
  };

  return (
    <AuthPage>
      <AuthLeft />
      <AuthRight className="flex flex-col gap-3">
        <div className='max-w-[500px] w-full'>
          <AuthHeading>
            Create New Account
          </AuthHeading>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className='max-w-[500px] w-full flex gap-2'>
          <Input1 
            name="First Name" 
            placeholder="First Name" 
            value={formData.firstname}
            onChange={handleChange}
          />
          <Input1 
            name="Last Name" 
            placeholder="Second Name" 
            value={formData.lastname}
            onChange={handleChange}
          />
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 
            name="Username" 
            placeholder="Username" 
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 
            name="Email" 
            placeholder="Email" 
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 
            name="Password" 
            placeholder="8 Digit Password" 
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className='max-w-[500px] w-full'>
          <PhoneInput 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <button onClick={handleNext} className="w-full max-w-[500px]">
          <GradiantButton className="w-full h-[52px] rounded mt-[10px]">
            Next
          </GradiantButton>
        </button>

        <div className={`max-w-[548px] w-full flex flex-col gap-4 ${shouldShake ? 'animate-shake' : ''}`}>
          {/* Checkbox 1 */}
          <div className='flex items-start w-full gap-3 mt-10'>
            <input
              type='checkbox'
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
              className='w-5 h-5 mt-0.5 accent-[#7F60EA] cursor-pointer shrink-0 rounded'
            />
            <label htmlFor="terms" className='text-[16px] font-[400] text-[#333333CC] cursor-pointer leading-tight select-none'>
              By creating an account, I agree to our <span className='underline'>Terms of use</span> and <span className='underline'>Privacy Policy</span>
            </label>
          </div>

          {/* Checkbox 2 */}
          <div className='flex items-start w-full gap-3'>
            <input
              type='checkbox'
              id="newsletter"
              className='w-5 h-5 mt-0.5 accent-[#7F60EA] cursor-pointer shrink-0 rounded'
            />
            <label htmlFor="newsletter" className='text-[16px] font-[400] text-[#333333CC] cursor-pointer leading-tight select-none'>
              By creating an account, I am also consenting to receive SMS messages and emails, including product new feature updates, Courses, and marketing promotions.
            </label>
          </div>
        </div>
        <AuthText className="mt-[20px]" isRegisterPage={true} />
      </AuthRight>
    </AuthPage>
  )
}

export default RegisterPageP1
