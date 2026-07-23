import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AuthText({ className, isRegisterPage = false }) {
  const { t } = useTranslation();
  return (
    <div className={`max-w-[383px] h-[60px] flex flex-col items-center justify-center text-center gap-3 ${className}`}>
      <p className="font-[500] text-[16px] text-gray-800">
        {isRegisterPage ? (
          <>{t('auth.already_have_account', 'Already have an account?')} <Link to="/login" className="text-[#B566E7] hover:underline">{t('auth.login_link', 'Login')}</Link></>
        ) : (
          <>{t('auth.no_account', 'No account?')} <Link to="/register" className="text-[#B566E7] hover:underline">{t('auth.create_one', 'Create one')}</Link></>
        )}
      </p>
      <p className="text-[#2B2B2B] font-[400] text-[14px]">{t('auth.terms_privacy', 'By continuing, you agree to our Terms and Privacy Policy.')}</p>
    </div>
  )
}

export default AuthText
