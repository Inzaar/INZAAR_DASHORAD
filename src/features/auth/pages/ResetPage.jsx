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

function ResetPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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
      setError(err.response?.data?.message || t('auth.error_unexpected', 'An unexpected error occurred. Please try again.'));
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

                <AuthText className="mt-[30px]"/>
            </AuthRight>
    </AuthPage>
  )
}

export default ResetPage
