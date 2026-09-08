import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getMyNotifications, markNotificationsAsSeen, markSingleAsRead } from '@/api/notification';

const NotificationContext = createContext();

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async (isSilent = false) => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        if (!isSilent) setLoading(true);

        try {
            const res = await getMyNotifications();
            if (res.data && res.data.success && res.data.data) {
                setNotifications(res.data.data.notifications || []);
                setUnreadCount(res.data.data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [user]);

    // Handle marking all as seen
    const markAllSeen = useCallback(async () => {
        try {
            await markNotificationsAsSeen();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
        } catch (error) {
            console.error("Failed to mark notifications as seen:", error);
        }
    }, []);

    // Handle marking single notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await markSingleAsRead(notificationId);
            setNotifications(prev => prev.map(n => 
                n.id === notificationId ? { ...n, isUnread: false } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark single notification as read:", error);
        }
    }, []);

    // Trigger initial fetch, 15s interval polling, and window focus sync
    useEffect(() => {
        if (!user) return;

        // Initial fetch
        fetchNotifications(false);

        // Background polling every 15 seconds
        const intervalId = setInterval(() => {
            fetchNotifications(true);
        }, 15000);

        // Re-sync immediately when tab receives focus
        const handleFocus = () => {
            fetchNotifications(true);
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
        };
    }, [user, fetchNotifications]);

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAllSeen,
        markAsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
