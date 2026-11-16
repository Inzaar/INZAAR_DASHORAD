import axiosInstance from './axiosInstance';

export const getVolunteers = (params) => {
    return axiosInstance.get('/volunteers', { params });
};

export const getVolunteerStats = () => {
    return axiosInstance.get('/volunteers/stats');
};

export const getVolunteerById = (id) => {
    return axiosInstance.get(`/volunteers/${id}`);
};

export const updateVolunteerStatus = (id, status) => {
    return axiosInstance.patch(`/volunteers/${id}/status`, { status });
};

export const addVolunteerRemark = (id, text) => {
    return axiosInstance.post(`/volunteers/${id}/remarks`, { text });
};

export const deleteVolunteer = (id) => {
    return axiosInstance.delete(`/volunteers/${id}`);
};

