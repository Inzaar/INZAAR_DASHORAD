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
        try {
            // Using /users/profile to verify the user identity
            const res = await axiosInstance.get('/users/profile');
            if (res.data && res.data.success && res.data.data) {
                // Backend sends { success: true, data: { _id, firstname, role, ... } }
                setUser({
                    id: res.data.data._id,
                    name: `${res.data.data.firstname} ${res.data.data.lastname}`,
                    firstname: res.data.data.firstname,
                    email: res.data.data.email,
                    role: res.data.data.role || 'student', // Default to student if not specified
                    loggedIn: true
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        // Clear frontend state
        setUser(null);

        // Completely wipe localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Expire all cookies to guarantee a clean slate
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    };

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
