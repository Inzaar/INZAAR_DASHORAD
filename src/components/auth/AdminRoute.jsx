import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/ui/Loader';

const AdminRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loader />;
    }

    // Check if user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If logged in but not admin, moderator, or management, redirect to student dashboard
    if (user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'management') {
        return <Navigate to="/dashboard" replace />;
    }

    // Protect moderator and management routes selectively based on their assigned features
    if (user.role === 'moderator' || user.role === 'management') {
        // Map paths to feature names to match against user.assignedFeatures
        const pathToName = {
            '/admin-dashboard': 'Dashboard',
            '/admin-calendar': 'Calendar',
            '/admin-notifications': 'Notification',
            '/admin-moderators': 'Moderators',
            '/moderator-details': ['Moderators', 'Reports & Logs', 'Dashboard'],
            '/student-profiles': 'Student Profiles',
            '/admin-courses': 'Courses Management',
            '/reports': 'Student Reports', 
            '/moderator-reports': 'Moderator Reports',
            '/course-reports': 'Course Reports',
            '/export-student-reports': 'Export Student Reports',
            '/export-moderator-reports': 'Export Moderator Reports',
            '/admin/student-details': ['Student Profiles', 'Reports & Logs', 'Student Reports', 'Courses Management', 'Dashboard'],
            '/admin/moderator-details': ['Moderators', 'Reports & Logs', 'Moderator Reports', 'Dashboard'],
            '/admin/course-details': 'Courses Management',
            '/admin-course-view': 'Courses Management',
            '/admin-course-play': 'Courses Management',
            '/admin-course-add': 'Courses Management',
            '/admin-add-course': 'Courses Management',
            '/registered-users': 'Student Profiles',
            '/registered-courses': 'Courses Management',
            '/admin-management': 'Management'
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
            const featuresToCheck = Array.isArray(requiredFeature) ? requiredFeature : [requiredFeature];
            // Check if any of the required features is in assignedFeatures array (case-insensitive fallback)
            const hasFeature = featuresToCheck.some(feat => 
                user.assignedFeatures?.includes(feat) || 
                user.assignedFeatures?.some(f => f?.toLowerCase() === feat.toLowerCase() || 
                                                 (feat === 'Courses Management' && f === 'Courses'))
            );
            
            // If they lack the required feature, firmly bounce them back to dashboard
            if (!hasFeature) {
                return <Navigate to="/dashboard" replace />;
            }
        }
    }

    return <Outlet />;
};

export default AdminRoute;
