import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom
import AuthLeft from '../components/AuthLeft';
import AuthPage from '../../../components/layouts/AuthPage';

const LoginPage = () => {
  return (
    <AuthPage>
        <AuthLeft />
    </AuthPage>
  );
};

export default LoginPage;