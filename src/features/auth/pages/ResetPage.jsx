import React, { useState } from 'react'
import AuthPage from '../../../components/layouts/AuthPage'
import AuthLeft from '../components/AuthLeft'
import AuthRight from '../components/AuthRight'
import AuthHeading from '../components/AuthHeading'
import Input1 from '../../../components/ui/inputs/Input1'
import GradiantButton from '../../../components/ui/buttons/GradiantButton'
import AuthText from '../components/AuthText'
import ErrorAlert from '@/components/ui/alerts/ErrorAlert'
import { useTranslation } from 'react-i18next'
import { resetPassword } from '@/api/auth'
import { useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Key } from 'lucide-react'

function ResetPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showSamePasswordModal, setShowSamePasswordModal] = useState(false);

  const handleTryAgain = () => {
    setShowSamePasswordModal(false);
    setPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      document.querySelector('input[name="password"]')?.focus();
    }, 100);
  };

  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError(t('auth.error_fill_all_fields', 'Please fill all fields'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.error_password_length', 'Password must be at least 8 characters long.'));
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError(t('auth.error_password_uppercase', 'Password must contain at least one uppercase letter.'));
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError(t('auth.error_password_special', 'Password must contain at least one special symbol.'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.error_passwords_not_match', 'Passwords do not match.'));
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email, otp, password });
      setMessage(res.data?.message || t('auth.password_reset_success', 'Password reset successfully! Redirecting to login...'));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.code === 'SAME_AS_OLD_PASSWORD' || err.response?.data?.message === "You cannot reuse your old password.") {
        setShowSamePasswordModal(true);
      } else {
        setError(err.response?.data?.message || t('auth.error_unexpected', 'An unexpected error occurred. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage>
      <AuthLeft />
      <AuthRight className="flex flex-col gap-3">
        <div className='max-w-[500px] w-full'>
          <AuthHeading>
            {t('auth.reset_your_password', 'Reset Your Password')}
          </AuthHeading>
        </div>

        {error && <ErrorAlert message={error} />}
        {message && (
          <div className="w-full max-w-[500px] bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <div className='max-w-[500px] w-full'>
            <Input1
              label={t('auth.new_password', 'New Password')}
              name="password"
              type="password"
              placeholder={t('auth.your_new_password', 'your new password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className='max-w-[500px] w-full'>
            <Input1
              label={t('auth.confirm_new_password', 'Confirm New Password')}
              name="confirmPassword"
              type="password"
              placeholder={t('auth.new_password_again', 'new password again')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <GradiantButton type="submit" disabled={loading} className="max-w-[500px] w-full h-[52px] rounded mt-[10px]">
            {loading ? t('auth.resetting', 'Resetting...') : t('auth.reset_password_btn', 'Reset Password')}
          </GradiantButton>
        </form>

        <AuthText className="mt-[30px]" />
      </AuthRight>

      {showSamePasswordModal && createPortal(
        <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-150 ease-out animate-in fade-in fill-mode-both" onClick={handleTryAgain} />
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm p-8 relative animate-in zoom-in-95 duration-300">
            <button
              onClick={handleTryAgain}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="flex flex-col items-center text-center gap-4 pt-2">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-2 border-4 border-purple-50">
                <Key size={28} strokeWidth={2} />
              </div>
              <div className="w-full">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Password Already Matches
                </h3>
                <p className="text-[14px] leading-relaxed text-gray-500 font-medium mb-4">
                  It looks like you entered your current password. No need to reset it—you can proceed to log in directly.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition active:scale-95 shadow-lg shadow-purple-500/20"
              >
                Continue to Login
              </button>
              <button
                onClick={handleTryAgain}
                className="w-full py-2 text-[14px] text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Change anyway
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AuthPage>
  )
}

export default ResetPage
