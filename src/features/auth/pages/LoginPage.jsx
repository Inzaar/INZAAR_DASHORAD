import AuthLeft from '../components/AuthLeft';
import AuthPage from '@/components/layouts/AuthPage';
import RightAuth from '../components/AuthRight';
import AuthHeading from '../components/AuthHeading';
import Input1 from '@/components/ui/inputs/Input1';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import GrayButton from '@/components/ui/buttons/GrayButton';
import GoogleLoginButton from '@/components/ui/buttons/GoogleLoginButton';
import AuthText from '../components/AuthText';
import { login } from '@/api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import ErrorAlert from '@/components/ui/alerts/ErrorAlert';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('student@inzaar.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  useEffect(() => {
    localStorage.removeItem('firstName');
    localStorage.removeItem('userId');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email === '' || password === '') {
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

    setLoading(true);
    setError('');

    try {
      const res = await login({
        email: email,
        password: password,
      });
      if (res.data && res.data.success && res.data.data) {
        const userData = res.data.data.user;
        console.log("userData", userData);

        authLogin({
          id: userData._id,
          name: `${userData.firstname} ${userData.lastname}`,
          firstname: userData.firstname,
          email: userData.email,
          role: userData.role || 'student',
          assignedFeatures: userData.assignedFeatures || [],
          loggedIn: true
        }, res.data.data.token);

        // Store legacy localStorage keys
        localStorage.setItem('firstName', JSON.stringify(userData.firstname));
        localStorage.setItem('userId', JSON.stringify(userData._id));

        if (userData.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "ERR_NETWORK") {
        setError(t('auth.error_network', 'Network error. Please check your internet connection or try again later.'));
      } else if (error.response) {
        if (error.response.status === 401) {
          setError(t('auth.error_invalid_credentials', 'Invalid email or password. Please try again.'));
        } else {
          console.log(error.response.data.message);
          setError(error.response.data.message);
        }
      } else if (error.request) {
        setError(t('auth.error_no_response', 'No response from server. Please try again later.'));
      } else {
        setError(t('auth.error_unexpected', 'An unexpected error occurred. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage>
      <AuthLeft />
      <RightAuth className="h-[634px] gap-3">
        <div className='max-w-[500px] w-full'>
          <AuthHeading>
            {t('auth.welcome', 'Welcome to Inzaar.org LMS Portal')}
          </AuthHeading>
          <p className='text-[#71717A] text-[12px]'>{t('auth.create_or_sign_in', 'Create your account or sign in.')}</p>
        </div>

        <form className="w-full flex flex-col items-center gap-4">
          <Input1
            label={t('auth.email', 'Email')}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input1
            label={t('auth.password', 'Password')}
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="w-full flex justify-end -mt-2">
            <Link
              to="/forgot-password"
              className="text-[14px] text-[#B566E7] hover:text-[#9333EA] hover:underline transition-colors font-medium"
            >
              {t('auth.forgot_password_question', 'Forgot Password?')}
            </Link>
          </div>

          <ErrorAlert message={error} />

          <div className="w-full max-w-[500px]">
            <GradiantButton onClick={handleSubmit} className="w-full h-[52px] rounded" type="submit">
              {loading ? t('auth.signing_in', 'Signing in...') : t('auth.sign_in', 'Sign in')}
            </GradiantButton>
          </div>
        </form>

        <p className='text-[#636363] text-[16px]'>{t('auth.or', 'Or')}</p>
        <GoogleLoginButton onClick={() => alert('Google OAuth integration pending setup')} className="mt-5 mb-3 !w-[calc(100%_-_60px)]" />
        <GrayButton className="!w-[calc(100%_-_60px)] rounded py-3 mb-10 mt-2">
          {t('auth.continue_as_guest', 'Continue As A Guest')}
        </GrayButton>
        <AuthText />
      </RightAuth>
    </AuthPage>
  );
};

export default LoginPage;