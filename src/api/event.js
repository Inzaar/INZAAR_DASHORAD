import axiosInstance from "./axiosInstance";

export const getAllEvents = async () => {
    const res = await axiosInstance.get("/events", {
        withCredentials: true,
    });
    return res.data;
};

export const createEvent = async (eventData) => {
    const res = await axiosInstance.post("/events", eventData, {
        withCredentials: true,
    });
    return res.data;
};

export const updateEvent = async (eventId, eventData) => {
    const res = await axiosInstance.patch(`/events/${eventId}`, eventData, {
        withCredentials: true,
    });
    return res.data;
};

export const deleteEvent = async (eventId) => {
    const res = await axiosInstance.delete(`/events/${eventId}`, {
        withCredentials: true,
    });
    return res.data;
};
