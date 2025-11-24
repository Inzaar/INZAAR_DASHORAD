import AuthLeft from '../components/AuthLeft';
import AuthPage from '../../../components/layouts/AuthPage';
import RightAuth from '../components/AuthRight';
import AuthHeading from '../components/AuthHeading';
import Input1 from '../../../components/ui/inputs/Input1';
import GradiantButton from '../../../components/ui/buttons/GradiantButton';
import GrayButton from '../../../components/ui/buttons/GrayButton';
import AuthText from '../components/AuthText';

const LoginPage = () => {
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
        <Input1 name="Email" />
        <Input1 name="Password" />
        <GradiantButton className="max-w-[500px] h-[52px] rounded w-full">Sign in</GradiantButton>
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