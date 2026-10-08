import axiosInstance from './axiosInstance';

export const createInstructor = (data) => {
    return axiosInstance.post('/instructors', data);
};

export const getInstructors = () => {
    return axiosInstance.get('/instructors');
};

export const getInstructorById = (id) => {
    return axiosInstance.get(`/instructors/${id}`);
};

export const updateInstructor = (id, data) => {
    return axiosInstance.put(`/instructors/${id}`, data);
};

export const deleteInstructor = (id) => {
    return axiosInstance.delete(`/instructors/${id}`);
};
