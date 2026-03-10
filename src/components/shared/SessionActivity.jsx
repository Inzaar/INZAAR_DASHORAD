import React from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
function SessionActivity() {
    const sessionData = [
        { day: 'Mon', value: -15 },
        { day: 'Tue', value: -10 },
        { day: 'Wed', value: -5 },
        { day: 'Thu', value: -3 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 5 },
    ];
  return (
    
        <div className="bg-white p-6 rounded-[4px] shadow-sm border border-gray-100 h-[301px] w-[475px]">
                                            <h3 className="text-gray-900 font-medium mb-6">Session Activity</h3>
                                            <div className="h-[220px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={sessionData}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#E5E7EB" />
                                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                                        <Tooltip />
                                                        {/* <Legend /> */}
                                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
        
    
  )
}

export default SessionActivity