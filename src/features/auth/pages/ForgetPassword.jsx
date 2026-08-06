import React, { useState } from 'react';
import AuthPage from '../../../components/layouts/AuthPage';
import AuthLeft from '../components/AuthLeft';
import AuthRight from '../components/AuthRight';
import AuthHeading from '../components/AuthHeading';
import Input1 from '../../../components/ui/inputs/Input1';
import OtpInput from '@/components/ui/inputs/OtpInput';
import GradiantButton from '../../../components/ui/buttons/GradiantButton';
import AuthText from '../components/AuthText';
import ErrorAlert from '../../../components/ui/alerts/ErrorAlert';
import { useTranslation } from 'react-i18next';
import { forgotPassword, verifyOtp } from '@/api/auth';
import { Link, useNavigate } from 'react-router-dom';

function ForgetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setError(t('auth.error_fill_all_fields', 'Please fill all fields'));
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await forgotPassword({ email });
      setMessage(res.data?.message || t('auth.otp_sent', 'OTP sent to your email!'));
      setStep('otp');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || t('auth.error_unexpected', 'An unexpected error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 6) {
      setError(t('auth.error_invalid_otp', 'Please enter a valid 6-digit OTP code'));
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await verifyOtp({ email, otp });
      setMessage(res.data?.message || t('auth.otp_verified', 'OTP verified successfully!'));
      setTimeout(() => {
        navigate('/reset-password', { state: { email, otp } });
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || t('auth.error_invalid_otp', 'Invalid or expired OTP code'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage>
      <AuthLeft />
      <AuthRight className="flex flex-col gap-3">
        <div className="max-w-[500px] w-full">
          <AuthHeading>
            {step === 'email'
              ? t('auth.forgot_password', 'Forgot Password')
              : t('auth.verify_otp', 'Enter OTP Code')}
          </AuthHeading>
          {step === 'otp' && (
            <p className="text-gray-500 text-sm mt-1">
              {`${t('auth.otp_sent_to', 'We sent a 6-digit code to')} ${email}`}
            </p>
          )}
        </div>

        {error && <ErrorAlert message={error} />}
        {message && (
          <div className="w-full max-w-[500px] bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
            {message}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="w-full flex flex-col items-center gap-4">
            <div className="max-w-[500px] w-full">
              <Input1
                name="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.your_email_address', 'your email address')}
              />
            </div>

            <GradiantButton type="submit" disabled={loading} className="max-w-[500px] w-full h-[52px] rounded mt-[10px]">
              {loading ? t('auth.sending', 'Sending...') : t('auth.send_otp', 'Send OTP')}
            </GradiantButton>

            <button
              type="button"
              onClick={() => setStep('otp')}
              className="text-xs text-[#B566E7] hover:underline mt-1"
            >
              {t('auth.already_have_otp', 'Already have an OTP code?')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="w-full flex flex-col items-center gap-4">
            <div className="max-w-[500px] w-full flex flex-col gap-2">
              <label className="text-[#18181B] text-[15px] font-medium">
                {t('auth.enter_otp_label', 'Enter 6-Digit OTP')}
              </label>

              <OtpInput length={6} value={otp} onChange={setOtp} />

              <div className="flex justify-between items-center text-xs text-gray-500 px-1 mt-1">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[#B566E7] hover:underline"
                >
                  ← {t('auth.change_email', 'Change Email')}
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-[#B566E7] hover:underline font-medium"
                >
                  {t('auth.resend_otp', 'Resend OTP')}
                </button>
              </div>
            </div>

            <GradiantButton
              type="submit"
              disabled={loading || otp.length < 6}
              className="max-w-[500px] w-full h-[52px] rounded mt-[10px]"
            >
              {loading ? t('auth.verifying', 'Verifying...') : t('auth.verify_otp_btn', 'Verify OTP')}
            </GradiantButton>
          </form>
        )}

        <div className="mt-4">
          <Link to="/login" className="text-[#B566E7] hover:underline text-sm font-medium">
            ← {t('auth.back_to_login', 'Back to Login')}
          </Link>
        </div>

        <AuthText className="mt-[30px]" />
      </AuthRight>
    </AuthPage>
  );
}

export default ForgetPassword;
