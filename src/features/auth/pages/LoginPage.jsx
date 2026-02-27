import AuthLeft from '../components/AuthLeft';
import AuthPage from '@/components/layouts/AuthPage';
import RightAuth from '../components/AuthRight';
import AuthHeading from '../components/AuthHeading';
import Input1 from '@/components/ui/inputs/Input1';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import GrayButton from '@/components/ui/buttons/GrayButton';
import AuthText from '../components/AuthText';
import { login } from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import ErrorAlert from '@/components/ui/alerts/ErrorAlert';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('muzamilhussainuser@gmail.com');
  const [password, setPassword] = useState('Muzamil@369#');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  useEffect(() => {
    localStorage.removeItem('firstName');
    localStorage.removeItem('userId');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email === '' || password === '') {
      setError('Please fill all fields');
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

        authLogin({
          id: userData._id,
          name: `${userData.firstname} ${userData.lastname}`,
          firstname: userData.firstname,
          email: userData.email,
          role: userData.role || 'student',
          loggedIn: true
        });

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
        setError("Network error. Please check your internet connection or try again later.");
      } else if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid email or password. Please try again.");
        } else {
          console.log(error.response.data.message);
          setError(error.response.data.message);
        }
      } else if (error.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError("An unexpected error occurred. Please try again.");
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
            Welcome to Inzaar.org LMS Portal
          </AuthHeading>
          <p className='text-[#71717A] text-[12px]'>Create your account or sign in.</p>
        </div>

        <form className="w-full flex flex-col items-center gap-4">
          <Input1
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input1
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <ErrorAlert message={error} />

          <div className="w-full max-w-[500px]">
            <GradiantButton onClick={handleSubmit} className="w-full h-[52px] rounded" type="submit">
              {loading ? 'Signing in...' : 'Sign in'}
            </GradiantButton>
          </div>
        </form>

        <p className='text-[#636363] text-[16px]'>Or</p>
        <GrayButton className="!w-[calc(100%_-_60px)] rounded py-3 mb-10 mt-5">
          Continue As A Guest
        </GrayButton>
        <AuthText />
      </RightAuth>
    </AuthPage>
  );
};

export default LoginPage;