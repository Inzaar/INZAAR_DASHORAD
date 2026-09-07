import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AuthPage from '../../../components/layouts/AuthPage'
import AuthLeft from '../components/AuthLeft'
import AuthRight from '../components/AuthRight'
import AuthHeading from '../components/AuthHeading'
import Input1 from '../../../components/ui/inputs/Input1'
import Textarea1 from '../../../components/ui/inputs/Textarea1'
import OtpInput from '@/components/ui/inputs/OtpInput'
import GradiantButton from '../../../components/ui/buttons/GradiantButton'
import AuthText from '../components/AuthText'
import ErrorAlert from '@/components/ui/alerts/ErrorAlert'
import { useRegister } from '../context/RegisterContext'
import { register as registerUser, sendRegisterOtp } from '../../../api/auth'
import { useAuth } from '../../../context/AuthContext'
import { useTranslation } from 'react-i18next'

function RegisterPageP2() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formData, updateFormData } = useRegister();
  const { login } = useAuth();
  
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!formData.firstname || !formData.email || !formData.password) {
      navigate('/register', { replace: true });
    }
  }, [formData.firstname, formData.email, formData.password, navigate]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Auto-capitalize first letter for certain fields
    if (["Nationality", "Permanent Address", "Educational Qualification"].includes(name) && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    const fieldMap = {
      "Gender": "gender",
      "DOB": "dob",
      "Educational Qualification": "educationQualification",
      "Nationality": "nationality",
      "Permanent Address": "permanentAddress",
      "Already Attended a Religious Course, give details if any:": "attendedReligiousCourseDetails",
      "How Did You Come To Know About Inzaar/Course:": "referralSource"
    };
    updateFormData({ [fieldMap[name] || name]: value });
  };

  // Step 1: User clicks "Completed", system sends OTP email first
  const handleSendOtpAndProceed = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Final validation (referralSource is optional)
      if (!formData.gender || formData.gender === "Choose" || !formData.dob || !formData.nationality || !formData.permanentAddress) {
        throw new Error(t('auth.error_fill_all_required_p2', 'Kindly fill all the required feilds'));
      }

      // Call backend to send 6-digit OTP to user's email
      const res = await sendRegisterOtp({
        email: formData.email,
        username: formData.username,
        firstname: formData.firstname
      });

      if (res.data.success) {
        setOtp('');
        setMessage(res.data.message || t('auth.otp_sent_success', 'Verification code sent to your email!'));
        setStep('otp');
      } else {
        setError(res.data.message || t('auth.otp_send_failed', 'Failed to send verification code.'));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('auth.something_went_wrong', 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP handler
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await sendRegisterOtp({
        email: formData.email,
        username: formData.username,
        firstname: formData.firstname
      });
      setMessage(res.data.message || t('auth.otp_resent_success', 'New verification code sent to your email!'));
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('auth.otp_resend_failed', 'Failed to resend verification code.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: User submits OTP to complete registration
  const handleVerifyAndRegister = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 6) {
      setError(t('auth.error_invalid_otp', 'Please enter a valid 6-digit OTP code'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await registerUser({
        ...formData,
        otp
      });

      if (res.data.success) {
        setMessage(t('auth.account_created_success', 'Account verified & created successfully! Redirecting to login...'));
        // Clear stored form data
        sessionStorage.removeItem('registerFormData');
        
        // Redirect to login screen after 1.2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } else {
        setError(res.data.message || t('auth.registration_failed', 'Registration failed.'));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('auth.something_went_wrong', 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage>
      <AuthLeft />
      <AuthRight className="flex flex-col gap-1 py-10">
        {step === 'form' ? (
          <form onSubmit={handleSendOtpAndProceed} className="flex flex-col gap-3 w-full items-center">
            <div className='max-w-[500px] w-full flex items-center gap-3'>
              <button type="button" onClick={() => navigate('/register')} className="text-[#00235A] hover:text-[#7F60EA] transition-colors mb-2">
                <ArrowLeft size={26} />
              </button>
              <AuthHeading>
                {t('auth.create_new_account', 'Create New Account')}
              </AuthHeading>
            </div>

            <div className='max-w-[500px] w-full text-center'>
              {error && <ErrorAlert message={error} />}
            </div>

            <div className='max-w-[500px] w-full flex gap-2'>
              <div className={`h-[76px] w-[50%] flex flex-col items-start justify-between`}>
                <label className='text-[#18181B] text-[16px]'>{t('auth.gender_req', 'Gender*')}</label>
                <select
                  name="Gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className='w-full h-[52px] border border-[#71717A]/30 outline-[#71717A] text-[#71717A] text-[14px] rounded px-2'
                >
                  <option value="Choose">{t('auth.choose', 'Choose')}</option>
                  <option value="Male">{t('auth.male', 'Male')}</option>
                  <option value="Female">{t('auth.female', 'Female')}</option>
                  <option value="Other">{t('auth.other', 'Other')}</option>
                </select>
              </div>
              <div className="w-[50%]">
                <Input1
                  name="DOB"
                  label={t('auth.dob_req', 'DOB*')}
                  type="date"
                  placeholder={t('auth.your_age', 'your age')}
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className='max-w-[500px] w-full'>
              <Input1
                name="Educational Qualification"
                placeholder={t('auth.your_educational_qualification', 'Your Educational Qualification')}
                value={formData.educationQualification}
                onChange={handleChange}
              />
            </div>

            <div className='max-w-[500px] w-full'>
              <Input1
                name="Nationality"
                label={t('auth.nationality_req', 'Nationality*')}
                placeholder={t('auth.your_nationality', 'your nationality')}
                value={formData.nationality}
                onChange={handleChange}
              />
            </div>

            <div className='max-w-[500px] w-full'>
              <Input1
                name="Permanent Address"
                label={t('auth.permanent_address_req', 'Permanent Address*')}
                placeholder={t('auth.your_permanent_address', 'your Permanent Address')}
                value={formData.permanentAddress}
                onChange={handleChange}
              />
            </div>

            <div className='max-w-[500px] w-full'>
              <Textarea1
                name="Already Attended a Religious Course, give details if any:"
                placeholder={t('auth.details', 'details')}
                value={formData.attendedReligiousCourseDetails}
                onChange={handleChange}
              />
            </div>

            <div className='max-w-[500px] w-full'>
              <Textarea1
                name="How Did You Come To Know About Inzaar/Course:"
                placeholder={t('auth.feedback', 'feedback')}
                value={formData.referralSource}
                onChange={handleChange}
              />
            </div>

            <GradiantButton
              type="submit"
              disabled={loading}
              className="w-full max-w-[500px] h-[52px] rounded mt-2"
            >
              {loading ? t('auth.sending_otp', 'Sending Verification Code...') : t('auth.completed', 'Completed')}
            </GradiantButton>

            <AuthText className="mt-[10px]" isRegisterPage={true} />
          </form>
        ) : (
          /* OTP Verification Screen */
          <form onSubmit={handleVerifyAndRegister} className="flex flex-col gap-4 w-full items-center my-auto max-w-[500px]">
            <div className='w-full flex items-center gap-3'>
              <button type="button" onClick={() => setStep('form')} className="text-[#00235A] hover:text-[#7F60EA] transition-colors">
                <ArrowLeft size={26} />
              </button>
              <AuthHeading>
                {t('auth.verify_otp', 'Verify Verification Code')}
              </AuthHeading>
            </div>

            <p className="text-gray-600 text-sm text-left w-full">
              {t('auth.otp_sent_to', 'We sent a 6-digit verification code to')} <strong className="text-purple-900">{formData.email}</strong>
            </p>

            {error && <ErrorAlert message={error} />}
            {message && (
              <div className="w-full bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200 text-center font-medium">
                {message}
              </div>
            )}

            <div className="w-full flex flex-col gap-2 my-2">
              <label className="text-[#18181B] text-[15px] font-medium">
                {t('auth.enter_otp_label', 'Enter 6-Digit OTP')}
              </label>
              <OtpInput length={6} value={otp} onChange={setOtp} />
              
              <div className="flex justify-between items-center text-xs text-gray-500 px-1 mt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-[#B566E7] hover:underline font-medium"
                >
                  ← {t('auth.edit_info', 'Edit Details')}
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[#B566E7] hover:underline font-medium disabled:opacity-50"
                >
                  {t('auth.resend_otp', 'Resend Code')}
                </button>
              </div>
            </div>

            <GradiantButton
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full h-[52px] rounded mt-2"
            >
              {loading ? t('auth.verifying', 'Verifying...') : t('auth.verify_and_create_account', 'Verify & Create Account')}
            </GradiantButton>

            <AuthText className="mt-[20px]" isRegisterPage={true} />
          </form>
        )}
      </AuthRight>
    </AuthPage>
  )
}

export default RegisterPageP2
