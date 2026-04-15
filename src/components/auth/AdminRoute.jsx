import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/ui/Loader';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    // Check if user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If logged in but not admin or moderator, redirect to student dashboard
    if (user.role !== 'admin' && user.role !== 'moderator') {
        return <Navigate to="/dashboard" replace />;
    }

    // Protect moderator routes selectively based on their assigned features
    if (user.role === 'moderator') {
        // Map paths to feature names to match against user.assignedFeatures
        const pathToName = {
            '/admin-dashboard': 'Dashboard',
            '/admin-calendar': 'Calendar',
            '/admin-notifications': 'Notification',
            '/admin-moderators': 'Moderators',
            '/moderator-details': 'Moderators',
            '/student-profiles': 'Student Profiles',
            '/admin-courses': 'Courses Management',
            '/reports': 'Reports & Logs', 
            '/moderator-reports': 'Reports & Logs',
            '/course-reports': 'Reports & Logs',
            '/admin/student-details': 'Student Profiles',
            '/admin/moderator-details': 'Moderators',
            '/admin/course-details': 'Courses Management',
            '/admin-course-view': 'Courses Management',
            '/admin-course-play': 'Courses Management',
            '/admin-course-add': 'Courses Management',
            '/admin-add-course': 'Courses Management',
            '/registered-users': 'Student Profiles',
            '/registered-courses': 'Courses Management'
        };

        // Try exact match first
        let requiredFeature = pathToName[location.pathname];

        // If no exact match, try prefix matching
        if (!requiredFeature) {
            const matchedKey = Object.keys(pathToName).find(key =>
                location.pathname.startsWith(key) && key !== '/'
            );
            if (matchedKey) {
                requiredFeature = pathToName[matchedKey];
            }
        }

        // If this route mandates a feature, check the moderator's assigned array
        if (requiredFeature) {
            // Check if feature is in assignedFeatures array (case-incensitive fallback)
            const hasFeature = user.assignedFeatures?.includes(requiredFeature) || 
                             user.assignedFeatures?.some(f => f?.toLowerCase() === requiredFeature.toLowerCase() || 
                                                             (requiredFeature === 'Courses Management' && f === 'Courses'));
            
            // If they lack the required feature, firmly bounce them back to dashboard
            if (!hasFeature) {
                return <Navigate to="/dashboard" replace />;
            }
        }
    }

    return <Outlet />;
};

export default AdminRoute;
