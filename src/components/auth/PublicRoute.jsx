import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/ui/Loader';

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (user) {
        // If user is already logged in, redirect them to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
