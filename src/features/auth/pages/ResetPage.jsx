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

function ResetPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

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

    // API call implementation goes here
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

                <ErrorAlert message={error} />

                <GradiantButton onClick={handleSubmit} className="max-w-[500px] w-full h-[52px] rounded mt-[10px]">
                    {t('auth.reset_password_btn', 'Reset Password')}
                </GradiantButton>

                <AuthText className="mt-[30px]"/>
            </AuthRight>
    </AuthPage>
  )
}

export default ResetPage
