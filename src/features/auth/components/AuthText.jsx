import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AuthText({ className = '', isRegisterPage = false }) {
  const { t } = useTranslation();
  const location = useLocation();
  const targetSearch = location.search || '';

  return (
    <div className={`max-w-[420px] w-full h-auto flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2.5 mt-3 sm:mt-5 mb-2 ${className}`}>
      <p className="font-medium text-xs sm:text-[15px] text-gray-800">
        {isRegisterPage ? (
          <>{t('auth.already_have_account', 'Already have an account?')} <Link to={`/login${targetSearch}`} className="text-[#B566E7] hover:underline font-semibold">{t('auth.login_link', 'Login')}</Link></>
        ) : (
          <>{t('auth.no_account', 'No account?')} <Link to={`/register${targetSearch}`} className="text-[#B566E7] hover:underline font-semibold">{t('auth.create_one', 'Create one')}</Link></>
        )}
      </p>
      <p className="text-[#2B2B2B] font-normal text-[11px] sm:text-xs leading-normal">{t('auth.terms_privacy', 'By continuing, you agree to our Terms and Privacy Policy.')}</p>
    </div>
  )
}

export default AuthText
