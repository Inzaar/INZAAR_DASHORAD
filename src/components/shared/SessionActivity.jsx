import React, { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import axiosInstance from '@/api/axiosInstance';

function SessionActivity({ profileData }) {
    const [sessionData, setSessionData] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = profileData?.user?._id;

    useEffect(() => {
        const fetchSessionActivity = async () => {
            if (!userId) {
                // Fallback: show empty week
                setSessionData(getDefaultWeek());
                setLoading(false);
                return;
            }

            try {
                const res = await axiosInstance.get(`/session-activity/${userId}`);
                const weeklyData = res?.data?.data?.weeklyData;
                if (weeklyData && weeklyData.length > 0) {
                    setSessionData(weeklyData.map(d => ({
                        day: d.day,
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
    }, [userId]);

    const getDefaultWeek = () => [
        { day: 'Mon', value: 0 },
        { day: 'Tue', value: 0 },
        { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 0 },
        { day: 'Sun', value: 0 },
    ];

    return (
        <div className="bg-white p-6 rounded-[4px] shadow-sm border border-gray-100 h-[301px] lg:w-[50%] sm:w-full">
            <h3 className="text-gray-900 font-medium mb-6">Session Activity</h3>
            <div className="h-[220px] w-full">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        Loading session data...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                        <LineChart data={sessionData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#E5E7EB" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                                formatter={(value) => [`${value} sessions`, 'Sessions']}
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