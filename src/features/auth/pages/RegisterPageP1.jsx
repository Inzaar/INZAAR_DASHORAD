import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthLeft from '../components/AuthLeft'
import AuthPage from '../../../components/layouts/AuthPage'
import AuthRight from '../components/AuthRight'
import AuthHeading from '../components/AuthHeading'
import Input1 from '../../../components/ui/inputs/Input1'
import PhoneInput from '../../../components/ui/inputs/PhoneInput'
import GradiantButton from '../../../components/ui/buttons/GradiantButton'
import GoogleLoginButton from '../../../components/ui/buttons/GoogleLoginButton'
import { Link } from 'react-router-dom';
import { useRegister } from '../context/RegisterContext';
import AuthText from '../components/AuthText';
import { checkUsername, checkEmail } from '../../../api/auth';

function RegisterPageP1() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useRegister();
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.username && formData.username.length > 0) {
        try {
          const res = await checkUsername(formData.username);
          if (!res.data.data.available) {
            setUsernameError('This username already exists.');
          } else {
            setUsernameError('');
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setUsernameError('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.username]);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.email && formData.email.length > 0) {
        try {
          const res = await checkEmail(formData.email);
          if (!res.data.data.available) {
            setEmailError('This email is already exist.');
          } else {
            setEmailError('');
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setEmailError('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.email]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Auto-capitalize first letter for First name, Last name, etc.
    if (["First Name", "Last Name", "Nationality", "Permanent Address"].includes(name) && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    // Prevent spaces in Username and Email
    if (["Username", "Email"].includes(name)) {
      value = value.replace(/\s/g, '');
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

    // Basic validation for fields (lastname is optional)
    if (!formData.firstname || !formData.username || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.username.includes(' ')) {
      setError('Username cannot contain spaces.');
      return;
    }

    if (usernameError) {
      setError('Please choose a unique username.');
      return;
    }

    if (emailError) {
      setError('Please use a unique email address.');
      return;
    }

    // Password Validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError('Password must contain at least one special symbol.');
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
        <div className='max-w-[500px] w-full flex items-center gap-3'>
          <button onClick={() => navigate('/login')} className="text-[#00235A] hover:text-[#7F60EA] transition-colors mb-2">
            <ArrowLeft size={26} />
          </button>
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
          {usernameError && <p className="text-red-500 text-[13px] mt-1 text-left">{usernameError}</p>}
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1
            name="Email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {emailError && <p className="text-red-500 text-[13px] mt-1 text-left">{emailError}</p>}
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

        <div className="w-full max-w-[500px] flex flex-col items-center justify-center mt-6 mb-2">
          <p className="text-[#636363] text-[16px] mb-4">Or sign up with</p>
          <GoogleLoginButton onClick={() => alert('Google OAuth integration pending setup')} />
        </div>

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
