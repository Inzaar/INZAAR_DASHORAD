import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/ui/Loader';

const StudentRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    // Check if user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user is admin trying to access student routes, redirect to admin dashboard
    if (user.role === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
    }

    return <Outlet />;
};

export default StudentRoute;
