import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

const RegisterContext = createContext();

export const useRegister = () => {
    return useContext(RegisterContext);
};

export const RegisterProvider = ({ children }) => {
    const [formData, setFormData] = useState({
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
    });

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
