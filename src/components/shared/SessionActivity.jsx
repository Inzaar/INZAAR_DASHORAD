import React, { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import axiosInstance from '@/api/axiosInstance';
import { useTranslation } from 'react-i18next';

function SessionActivity({ profileData }) {
    const { t } = useTranslation();
    const [sessionData, setSessionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState('');

    const userId = profileData?.user?._id;

    const getDefaultWeek = () => {
        let startD = new Date();
        if (fromDate) {
            startD = new Date(fromDate);
        } else {
            startD.setDate(startD.getDate() - 6);
        }
        startD.setHours(0, 0, 0, 0);

        const days = [];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startD);
            d.setDate(startD.getDate() + i);
            days.push({
                day: dayNames[d.getDay()],
                date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                value: 0
            });
        }
        return days;
    };

    useEffect(() => {
        const fetchSessionActivity = async () => {
            if (!userId) {
                // Fallback: show empty week
                setSessionData(getDefaultWeek());
                setLoading(false);
                return;
            }

            try {
                let url = `/session-activity/${userId}`;
                const queryParams = new URLSearchParams();
                if (fromDate) {
                    queryParams.append('from', fromDate);
                    const from = new Date(fromDate);
                    const to = new Date(from);
                    to.setDate(to.getDate() + 6); // Add 6 days to get a 7-day range
                    queryParams.append('to', to.toISOString().split('T')[0]);
                }
                if (queryParams.toString()) url += `?${queryParams.toString()}`;

                const res = await axiosInstance.get(url);
                const weeklyData = res?.data?.data?.weeklyData;
                if (weeklyData && weeklyData.length > 0) {
                    setSessionData(weeklyData.map(d => ({
                        day: d.day,
                        date: d.date, // Format like "12 Oct" returned from backend
                        value: d.sessions,
                    })));
                } else {
                    setSessionData(getDefaultWeek());
                }
            } catch (error) {
                console.error("Error fetching session activity:", error);
                setSessionData(getDefaultWeek());
            } finally {
                setLoading(false);
            }
        };

        fetchSessionActivity();
    }, [userId, fromDate]);

    return (
        <div className="bg-white p-6 rounded-[4px] shadow-sm border border-gray-100 h-[301px] lg:w-[50%] sm:w-full">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <h3 className="text-gray-900 font-medium">{t('auth.session_activity', 'Session Activity')}</h3>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <label className="text-xs text-gray-500">From:</label>
                        <input 
                            type="date" 
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none bg-gray-50" 
                        />
                    </div>
                </div>
            </div>
            <div className="h-[220px] w-full">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        {t('auth.loading_session_data', 'Loading session data...')}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                        <LineChart data={sessionData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#E5E7EB" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                                formatter={(value) => [`${value} ${t('auth.sessions', 'sessions')}`, t('auth.sessions', 'Sessions')]}
                                labelFormatter={(label, payload) => {
                                    if (payload && payload.length > 0) {
                                        return `${payload[0].payload.day}, ${label}`;
                                    }
                                    return label;
                                }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}

export default SessionActivity