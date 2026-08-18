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
import { useTranslation } from 'react-i18next';

function RegisterPageP1() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formData, updateFormData } = useRegister();
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.username && formData.username.length > 0) {
        if (formData.username.length < 4) {
          setUsernameError(t('auth.error_username_min_length', 'Username must be at least 4 characters long.'));
          return;
        }
        try {
          const res = await checkUsername(formData.username);
          if (!res.data.data.available) {
            setUsernameError(t('auth.error_username_exists', 'This username already exists.'));
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setEmailError(t('auth.error_invalid_email', 'Please enter a valid email address.'));
          return;
        }
        try {
          const res = await checkEmail(formData.email);
          if (!res.data.data.available) {
            setEmailError(t('auth.error_email_exists', 'This email is already exist.'));
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

    if (name === "Password") {
      setPasswordError('');
    }

    // Auto-capitalize first letter for First name, Last name, etc.
    if (["First Name", "Last Name", "Nationality", "Permanent Address"].includes(name) && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    // Prevent spaces in Username and Email
    if (["Username", "Email"].includes(name)) {
      value = value.replace(/\s/g, '');
    }

    // Automatically convert Username to lowercase
    if (name === "Username") {
      value = value.toLowerCase();
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
    setError('');
    setPasswordError('');

    // Basic validation for fields (lastname is optional)
    if (!formData.firstname || !formData.username || !formData.email || !formData.password || !formData.phone) {
      setError(t('auth.error_fill_required', 'Kindly fill all the required feilds'));
      return;
    }

    if (formData.username.length < 4) {
      setError(t('auth.error_username_min_length', 'Username must be at least 4 characters long.'));
      return;
    }

    if (formData.username.includes(' ')) {
      setError(t('auth.error_username_spaces', 'Username cannot contain spaces.'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('auth.error_invalid_email', 'Please enter a valid email address.'));
      return;
    }

    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (emailError) {
      setError(emailError);
      return;
    }

    // Password Validation
    if (formData.password.length < 8) {
      setPasswordError(t('auth.error_password_length', 'Password must be at least 8 characters long.'));
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setPasswordError(t('auth.error_password_uppercase', 'Password must contain at least one uppercase letter.'));
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setPasswordError(t('auth.error_password_special', 'Password must contain at least one special symbol.'));
      return;
    }

    // Validation for terms
    if (!agreedToTerms) {
      setError(t('auth.error_agree_terms', 'Please agree to the Terms of use and Privacy Policy.'));
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
            {t('auth.create_new_account', 'Create New Account')}
          </AuthHeading>
        </div>

        {error && <p className="text-red-500 text-sm text-center w-full max-w-[500px]">{error}</p>}

        <div className='max-w-[500px] w-full flex gap-2'>
          <Input1
            name="First Name"
            label={t('auth.first_name_req', 'First Name*')}
            placeholder={t('auth.first_name', 'First Name')}
            value={formData.firstname}
            onChange={handleChange}
          />
          <Input1
            name="Last Name"
            placeholder={t('auth.second_name', 'Second Name')}
            value={formData.lastname}
            onChange={handleChange}
          />
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1 
            name="Username"
            label={t('auth.username_req', 'Username*')}
            placeholder={t('auth.username', 'Username')} 
            value={formData.username}
            onChange={handleChange}
          />
          {usernameError && <p className="text-red-500 text-[13px] mt-1 text-left">{usernameError}</p>}
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1
            name="Email"
            label={t('auth.email_req', 'Email*')}
            placeholder={t('auth.email', 'Email')}
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {emailError && <p className="text-red-500 text-[13px] mt-1 text-left">{emailError}</p>}
        </div>

        <div className='max-w-[500px] w-full'>
          <Input1
            name="Password"
            label={t('auth.password_req', 'Password*')}
            placeholder={t('auth.8_digit_password', '8 Digit Password')}
            type="password"
            value={formData.password}
            onChange={handleChange}
            isError={!!passwordError}
          />
          {passwordError && <p className="text-red-500 text-[13px] mt-1 text-left">{passwordError}</p>}
        </div>

        <div className='max-w-[500px] w-full'>
          <PhoneInput
            name="phone"
            label="Phone number*"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <button onClick={handleNext} className="w-full max-w-[500px]">
          <GradiantButton className="w-full h-[52px] rounded mt-[10px]">
            {t('auth.next', 'Next')}
          </GradiantButton>
        </button>

        <div className="w-full max-w-[500px] flex flex-col items-center justify-center mt-6 mb-2">
          <p className="text-[#636363] text-[16px] mb-4">{t('auth.or_sign_up_with', 'Or sign up with')}</p>
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
              {t('auth.terms_agree_p1', 'By creating an account, I agree to our')} <span className='underline'>{t('auth.terms_of_use', 'Terms of use')}</span> {t('auth.and', 'and')} <span className='underline'>{t('auth.privacy_policy', 'Privacy Policy')}</span>
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
              {t('auth.newsletter_agree', 'By creating an account, I am also consenting to receive SMS messages and emails, including product new feature updates, Courses, and marketing promotions.')}
            </label>
          </div>
        </div>
        <AuthText className="mt-[20px]" isRegisterPage={true} />
      </AuthRight>
    </AuthPage>
  )
}

export default RegisterPageP1
