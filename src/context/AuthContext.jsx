import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const isGuest = localStorage.getItem('isGuest');

        if (!token) {
            if (isGuest === 'true') {
                setUser({
                    id: 'guest',
                    name: 'Guest User',
                    firstname: 'Guest',
                    email: 'guest@inzaar.org',
                    role: 'guest',
                    profileImageUrl: null,
                    assignedFeatures: [],
                    loggedIn: true
                });
            } else {
                setUser(null);
            }
            setLoading(false);
            return;
        }
        try {
            // Using /users/profile to verify the user identity
            const res = await axiosInstance.get('/users/profile');
            if (res.data && res.data.success && res.data.data) {
                const profile = res.data.data.user || res.data.data;
                setUser({
                    id: profile._id,
                    name: `${profile.firstname} ${profile.lastname || ''}`.trim(),
                    firstname: profile.firstname,
                    email: profile.email,
                    role: profile.role || 'student',
                    profileImageUrl: profile.profileImageUrl || null,
                    assignedFeatures: profile.assignedFeatures || [],
                    phone: profile.phone || null,
                    loggedIn: true
                });
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData, token) => {
        if (token) {
            localStorage.setItem('token', token);
        }
        setUser(userData);
    };

    const loginAsGuest = () => {
        localStorage.setItem('isGuest', 'true');
        setUser({
            id: 'guest',
            name: 'Guest User',
            firstname: 'Guest',
            email: 'guest@inzaar.org',
            role: 'guest',
            profileImageUrl: null,
            assignedFeatures: [],
            loggedIn: true
        });
    };

    const logout = async () => {
        // Clear frontend state
        setUser(null);

        // Remove JWT token and Guest flag
        localStorage.removeItem('token');
        localStorage.removeItem('isGuest');
        sessionStorage.clear();

        // Expire all cookies to guarantee a clean slate
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Notify backend to clear httpOnly cookie
        try { await axiosInstance.post('/users/logout'); } catch (_) { }
    };

    const value = {
        user,
        loading,
        login,
        loginAsGuest,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
