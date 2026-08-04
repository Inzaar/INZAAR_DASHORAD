import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const RegisterContext = createContext();

export const useRegister = () => {
    return useContext(RegisterContext);
};

export const RegisterProvider = ({ children }) => {
    const loadInitialState = () => {
        try {
            const savedState = sessionStorage.getItem('registerFormData');
            if (savedState) {
                return JSON.parse(savedState);
            }
        } catch (e) {
            console.error("Failed to load registration data from session storage", e);
        }
        return {
            firstname: '',
            lastname: '',
            username: '',
            email: '',
            password: '',
            phone: '',
            gender: 'Choose',
            dob: '',
            educationQualification: '',
            nationality: '',
            permanentAddress: '',
            city: '', 
            attendedReligiousCourseDetails: '',
            referralSource: '',
        };
    };

    const [formData, setFormData] = useState(loadInitialState);

    useEffect(() => {
        try {
            sessionStorage.setItem('registerFormData', JSON.stringify(formData));
        } catch (e) {
            console.error("Failed to save registration data to session storage", e);
        }
    }, [formData]);

    const updateFormData = (newData) => {
        setFormData((prev) => ({ ...prev, ...newData }));
    };

    const value = {
        formData,
        updateFormData,
        setFormData
    };

    return (
        <RegisterContext.Provider value={value}>
            {children || <Outlet />}
        </RegisterContext.Provider>
    );
};
