// import React, { useState } from 'react';
// import Sidebar from '@/components/layouts/SideBar';
// import Navbar from '@/components/layouts/NavBar';
// import Input1 from '@/components/ui/inputs/Input1';
// import GradiantButton from '@/components/ui/buttons/GradiantButton';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import {
//     format,
//     addMonths,
//     subMonths,
//     startOfMonth,
//     endOfMonth,
//     startOfWeek,
//     endOfWeek,
//     eachDayOfInterval,
//     isSameMonth,
//     isSameDay,
//     isToday,
//     isWithinInterval,
//     startOfDay
// } from 'date-fns';

// const AdminCalendar = () => {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     // Updated Form State
//     const [eventTitle, setEventTitle] = useState('');
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     const [selectedColor, setSelectedColor] = useState('bg-indigo-500'); // Default color

//     const [currentDate, setCurrentDate] = useState(new Date());
//     const [events, setEvents] = useState([
//         { id: 1, title: 'German class', startDate: new Date(2025, 8, 7), endDate: new Date(2025, 8, 10), color: 'bg-indigo-500 text-white' },
//         { id: 2, title: 'French class', startDate: new Date(2025, 8, 18), endDate: new Date(2025, 8, 18), color: 'bg-purple-500 text-white' },
//     ]);

//     // Available colors for the Admin
//     const colorOptions = [
//         { name: 'Indigo', value: 'bg-indigo-500' },
//         { name: 'Purple', value: 'bg-purple-500' },
//         { name: 'Rose', value: 'bg-rose-500' },
//         { name: 'Amber', value: 'bg-amber-500' },
//         { name: 'Emerald', value: 'bg-emerald-500' },
//     ];

//     const handleAddEvent = () => {
//         if (!eventTitle || !startDate) return;
//         const newEvent = {
//             id: Date.now(),
//             title: eventTitle,
//             startDate: new Date(startDate),
//             endDate: endDate ? new Date(endDate) : new Date(startDate),
//             color: `${selectedColor} text-white`
//         };
//         setEvents([...events, newEvent]);
//         // Reset form
//         setEventTitle(''); setStartDate(''); setEndDate(''); setSelectedColor('bg-indigo-500');
//     };

//     const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
//     const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
//     const goToToday = () => setCurrentDate(new Date());

//     const days = eachDayOfInterval({
//         start: startOfWeek(startOfMonth(currentDate)),
//         end: endOfWeek(endOfMonth(currentDate))
//     });

//     return (
//         <div className=" w-screen flex flex-col bg-[#F8F9FA] overflow-hidden">
//             <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
//             <div className='flex flex-1 overflow-hidden px-4 gap-4'>
//                 <Sidebar
//                     onClose={() => setIsSidebarOpen(false)}
//                     className={`lg:block ${isSidebarOpen ? 'block' : 'hidden'}`}
//                 />

//                 <main className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 no-scrollbar">
//                     {/* Event Creation Form */}
//                     <div className="bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm">
//                         <h3 className="text-[#3758EE] text-[16px] font-bold mb-4">+ Add New Event</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
//                             <div className="md:col-span-3">
//                                 <Input1 label="Event title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
//                             </div>
//                             <div className="md:col-span-2">
//                                 <label className='block mb-2 text-sm font-medium'>From</label>
//                                 <input type="date" className="w-full h-[52px] border border-gray-200 rounded px-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//                             </div>
//                             <div className="md:col-span-2">
//                                 <label className='block mb-2 text-sm font-medium'>To</label>
//                                 <input type="date" className="w-full h-[52px] border border-gray-200 rounded px-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
//                             </div>
//                             {/* Color Picker */}
//                             <div className="md:col-span-3">
//                                 <label className='block mb-2 text-sm font-medium'>Label Color</label>
//                                 <div className="flex gap-2 h-[52px] items-center">
//                                     {colorOptions.map((color) => (
//                                         <button
//                                             key={color.value}
//                                             onClick={() => setSelectedColor(color.value)}
//                                             className={`w-8 h-8 rounded-full transition-transform ${color.value} ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`}
//                                             title={color.name}
//                                         />
//                                     ))}
//                                 </div>
//                             </div>
//                             <div className="md:col-span-2">
//                                 <GradiantButton onClick={handleAddEvent} className="w-full h-[52px]">Add Event</GradiantButton>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Calendar Section */}
//                     <div className="bg-white rounded-[16px] border border-[#EAEDF2] p-6 shadow-sm flex-1 flex flex-col overflow-hidden mb-6">
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
//                             <div className="flex gap-2">
//                                 {/* Today Button */}
//                                 <button
//                                     onClick={goToToday}
//                                     className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
//                                 >
//                                     Today
//                                 </button>
//                                 <button onClick={prevMonth} className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"><ChevronLeft size={20} /></button>
//                                 <button onClick={nextMonth} className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"><ChevronRight size={20} /></button>
//                             </div>
//                         </div>

//                         <div className="overflow-x-auto flex-1">
//                             <div className="min-w-[800px] grid grid-cols-7 border-t border-l border-gray-100">
//                                 {days.map((day) => {
//                                     const dayEvents = events.filter(event =>
//                                         isWithinInterval(startOfDay(day), {
//                                             start: startOfDay(event.startDate),
//                                             end: startOfDay(event.endDate)
//                                         })
//                                     );

//                                     return (
//                                         <div key={day.toString()} className="min-h-[120px] border-r border-b border-gray-100 p-0 flex flex-col relative overflow-visible">
//                                             <div className="flex justify-between items-center p-2">
//                                                 <span className={`text-sm ${isToday(day) ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : isSameMonth(day, currentDate) ? 'text-gray-800' : 'text-gray-300'}`}>
//                                                     {format(day, 'd')}
//                                                 </span>
//                                             </div>

//                                             <div className="flex flex-col gap-1 mt-1 w-full relative">
//                                                 {dayEvents.map(event => {
//                                                     const isStart = isSameDay(day, event.startDate);
//                                                     const isEnd = isSameDay(day, event.endDate);
//                                                     const isMiddle = !isStart && !isEnd;

//                                                     return (
//                                                         <div
//                                                             key={event.id}
//                                                             className={`h-6 text-[10px] flex items-center px-2 z-10 whitespace-nowrap ${event.color} ${isStart ? 'rounded-l-md ml-1' : ''} ${isEnd ? 'rounded-r-md mr-1' : ''} ${isMiddle ? 'mx-[-1px]' : ''}`}
//                                                             style={{
//                                                                 width: isStart && isEnd ? 'calc(100% - 8px)' : isStart || isEnd ? 'calc(100% + 1px)' : 'calc(100% + 2px)',
//                                                                 marginLeft: isMiddle || isEnd ? '-1px' : '4px',
//                                                             }}
//                                                         >
//                                                             {(isStart || format(day, 'i') === '0') && (
//                                                                 <span className="sticky left-0 pl-1 font-semibold">{event.title}</span>
//                                                             )}
//                                                         </div>
//                                                     );
//                                                 })}
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default AdminCalendar;


import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Sidebar from '@/components/layouts/SideBar';
import Navbar from '@/components/layouts/NavBar';
import Input1 from '@/components/ui/inputs/Input1';
import GradiantButton from '@/components/ui/buttons/GradiantButton';
import { isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import StatusTable from '@/components/ui/statusTable/StatusTable';
import dummyUserCourses from '@/constants/dummyData';
import { getAllEvents, createEvent } from '@/api/event';

const AdminCalendar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [view, setView] = useState('calendar'); // 'calendar' or 'list'
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        try {
            const data = await getAllEvents();
            if (data?.data) {
                const mappedEvents = data.data.map(ev => ({
                    id: ev._id,
                    title: ev.title,
                    type: ev.type || "Event",
                    status: ev.status || "upcoming",
                    startDate: new Date(ev.fromDate),
                    endDate: new Date(ev.toDate),
                    color: 'bg-indigo-500'
                }));
                setEvents(mappedEvents);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const getFormattedDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const tenDaysLater = new Date(today);
    tenDaysLater.setDate(today.getDate() + 10);

    // Form State
    const [eventTitle, setEventTitle] = useState('');
    const [startDate, setStartDate] = useState(getFormattedDate(today));
    const [endDate, setEndDate] = useState(getFormattedDate(tenDaysLater));
    const [selectedColor, setSelectedColor] = useState('bg-indigo-500');

    const handleAddEvent = async () => {
        if (!eventTitle || !startDate) return;

        try {
            await createEvent({
                title: eventTitle,
                type: "Event",
                fromDate: new Date(startDate).toISOString(),
                toDate: (endDate ? new Date(endDate) : new Date(startDate)).toISOString(),
            });
            await fetchEvents();
            setEventTitle('');
            setStartDate(getFormattedDate(today));
            setEndDate(getFormattedDate(tenDaysLater));
        } catch (error) {
            console.error("Failed to create event:", error);
        }
    };

    // Logic to render content inside each calendar tile
    const renderTileContent = ({ date, view }) => {
        if (view !== 'month') return null;

        const dayEvents = events.filter(event =>
            isWithinInterval(startOfDay(date), {
                start: startOfDay(event.startDate),
                end: startOfDay(event.endDate)
            })
        );

        return (
            <div className="flex flex-col gap-1 mt-1 w-full overflow-visible">
                {dayEvents.map(event => {
                    const isStart = isSameDay(date, event.startDate);
                    const isEnd = isSameDay(date, event.endDate);
                    const isMiddle = !isStart && !isEnd;

                    return (
                        <div
                            key={event.id}
                            className={`h-5 text-[9px] flex items-center px-1 text-white truncate z-10 
                                ${event.color}
                                ${isStart ? 'rounded-l-md ml-0.5' : ''} 
                                ${isEnd ? 'rounded-r-md mr-0.5' : ''}
                                ${isMiddle ? 'mx-[-4px]' : ''}
                            `}
                        >
                            {(isStart || date.getDay() === 0) ? event.title : ''}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Calendar Navigation Logic
    const [activeStartDate, setActiveStartDate] = useState(new Date());

    const handleToday = () => setActiveStartDate(new Date());
    const handlePrev = () => setActiveStartDate(prev => {
        const date = new Date(prev);
        date.setMonth(date.getMonth() - 1);
        return date;
    });
    const handleNext = () => setActiveStartDate(prev => {
        const date = new Date(prev);
        date.setMonth(date.getMonth() + 1);
        return date;
    });

    const formatShortWeekday = (locale, date) => {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative'>

                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`
                        transition-transform duration-300 ease-in-out z-40
                        lg:translate-x-0 lg:static lg:block
                        fixed left-0 top-0 h-full lg:max-h-[800px] shadow-2xl
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar scrollbar-hide" style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        {/* Toggle Switch */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-[#F3F4F6] p-1 rounded-md flex">
                                <button
                                    onClick={() => setView('calendar')}
                                    className={`px-6 py-2 text-sm font-medium transition-all ${view === 'calendar' ? 'bg-white text-gray-900 rounded shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Add New Event
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    className={`px-6 py-2 text-sm font-medium transition-all ${view === 'list' ? 'bg-white text-gray-900 rounded shah' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    List
                                </button>
                            </div>
                        </div>

                        {view === 'calendar' ? (
                            <>
                                {/* Add Event Form (Simplified) */}
                                <div className="bg-white rounded-xl border p-6 shadow-sm">
                                    <h3 className="text-[#3758EE] text-[16px] font-bold mb-4">+ Add New Event</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <Input1 label="Event title" name={"event title"} value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
                                        <input type="date" className="h-[52px] border rounded px-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        <input type="date" className="h-[52px] border rounded px-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                        <GradiantButton onClick={handleAddEvent} className="h-[52px] md:rounded-lg ">Add Event</GradiantButton>
                                    </div>
                                </div>

                                {/* React Calendar Section */}
                                <div className="bg-white rounded-xl border p-6 shadow-sm flex-1 custom-calendar-container mb-6 flex flex-col overflow-hidden">

                                    {/* Custom Header */}
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-[28px] text-[#18181B] font-normal">
                                            {activeStartDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleToday}
                                                className="px-6 py-2 bg-[#A892FF] text-white rounded-md text-sm font-medium hover:bg-[#937aff] transition-colors"
                                            >
                                                today
                                            </button>
                                            <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center bg-[#6366F1] text-white rounded-md hover:bg-[#4f46e5] text-xl pb-1">‹</button>
                                            <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center bg-[#6366F1] text-white rounded-md hover:bg-[#4f46e5] text-xl pb-1">›</button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto flex-1 w-full">
                                        <div className="min-w-[700px]">
                                            <Calendar
                                                onChange={() => { }}
                                                value={null}
                                                activeStartDate={activeStartDate}
                                                onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                                                tileContent={renderTileContent}
                                                className="w-full border-none font-sans"
                                                showNavigation={false} // Hide default navigation
                                                formatShortWeekday={formatShortWeekday}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-xl border p-6 shadow-sm overflow-x-auto flex-1">
                                <h2 className="text-xl font-bold mb-4">All Events</h2>
                                <table className="w-full text-left text-sm text-gray-700">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="py-3 px-4 font-semibold">Event Title</th>
                                            <th className="py-3 px-4 font-semibold">Type</th>
                                            <th className="py-3 px-4 font-semibold">From</th>
                                            <th className="py-3 px-4 font-semibold">To</th>
                                            <th className="py-3 px-4 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-gray-500">No events found.</td>
                                            </tr>
                                        ) : (
                                            events.map(ev => (
                                                <tr key={ev.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-4 font-medium">{ev.title}</td>
                                                    <td className="py-4 px-4">{ev.type}</td>
                                                    <td className="py-4 px-4">{ev.startDate.toLocaleDateString()}</td>
                                                    <td className="py-4 px-4">{ev.endDate.toLocaleDateString()}</td>
                                                    <td className="py-4 px-4">
                                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold capitalize">
                                                            {ev.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </main>
                </div>

                {/* Global CSS to override react-calendar defaults */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                .react-calendar { width: 100% !important; border: none !important; font-family: inherit !important; }
                .react-calendar__tile { min-height: 120px; display: flex; flex-direction: column; align-items: flex-start; !important; border: 1px solid #f3f4f6 !important; position: relative; }
                .react-calendar__month-view__days__day--neighboringMonth { background-color: #f9fafb; color: #d1d5db; }
                .react-calendar__tile--now { background: #eef2ff !important; color: #4f46e5 !important; font-weight: bold; }
                .react-calendar__navigation button { font-size: 1.5rem; font-weight: bold; color: #1f2937; }
                .react-calendar__month-view__weekdays { text-transform: uppercase; font-weight: 600; font-size: 0.8rem; color: #6b7280; padding-bottom: 10px;}

                @media (max-width: 768px) {
                    .react-calendar__tile { min-height: 80px !important; padding: 4px !important; }
                    .react-calendar__navigation button { font-size: 1.1rem; }
                    .react-calendar__month-view__weekdays { font-size: 0.7rem; }
                }
            `}} />
            </div>

        </div>
    );
};

export default AdminCalendar;


// import React, { useState } from 'react';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import Sidebar from '@/components/layouts/SideBar';
// import Navbar from '@/components/layouts/NavBar';
// import Input1 from '@/components/ui/inputs/Input1';
// import GradiantButton from '@/components/ui/buttons/GradiantButton';
// import { isSameDay, isWithinInterval, startOfDay } from 'date-fns';
// import StatusTable from '@/components/ui/statusTable/StatusTable';
// import dummyUserCourses from '@/constants/dummyData';

// const AdminCalendar = () => {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [view, setView] = useState('calendar');
//     const [events, setEvents] = useState([
//         { id: 1, title: 'German class', startDate: new Date(2025, 8, 7), endDate: new Date(2025, 8, 10), color: 'bg-indigo-500' },
//         { id: 2, title: 'French class', startDate: new Date(2025, 8, 18), endDate: new Date(2025, 8, 18), color: 'bg-purple-500' },
//     ]);

//     // Form State
//     const [eventTitle, setEventTitle] = useState('');
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     const [selectedColor, setSelectedColor] = useState('bg-indigo-500');
//     const handleAddEvent = () => {
//         if (!eventTitle || !startDate) return;
//         setEvents([...events, {
//             id: Date.now(),
//             title: eventTitle,
//             startDate: new Date(startDate),
//             endDate: endDate ? new Date(endDate) : new Date(startDate),
//             color: selectedColor
//         }]);
//         setEventTitle(''); setStartDate(''); setEndDate('');
//     };

//     // Logic to render content inside each calendar tile
//     const renderTileContent = ({ date, view }) => {
//         if (view !== 'month') return null;

//         const dayEvents = events.filter(event =>
//             isWithinInterval(startOfDay(date), {
//                 start: startOfDay(event.startDate),
//                 end: startOfDay(event.endDate)
//             })
//         );

//         return (
//             <div className="flex flex-col gap-1 mt-1 w-full overflow-visible">
//                 {dayEvents.map(event => {
//                     const isStart = isSameDay(date, event.startDate);
//                     const isEnd = isSameDay(date, event.endDate);
//                     const isMiddle = !isStart && !isEnd;

//                     return (
//                         <div
//                             key={event.id}
//                             className={`h-5 text-[9px] flex items-center px-1 text-white truncate z-10 
//                                  ${event.color}
//                                  ${isStart ? 'rounded-l-md ml-0.5' : ''} 
//                                  ${isEnd ? 'rounded-r-md mr-0.5' : ''}
//                                  ${isMiddle ? 'mx-[-4px]' : ''}
//                              `}
//                         >
//                             {(isStart || date.getDay() === 0) ? event.title : ''}
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     }

//     const [activeStartDate, setActiveStartDate] = useState(new Date());

//     const handleToday = () => setActiveStartDate(new Date());
//     const handlePrev = () => setActiveStartDate(prev => {
//         const date = new Date(prev);
//         date.setMonth(date.getMonth() - 1);
//         return date;
//     });
//     const handleNext = () => setActiveStartDate(prev => {
//         const date = new Date(prev);
//         date.setMonth(date.getMonth() + 1);
//         return date;
//     });

//     const formatShortWeekday = (locale, date) => {
//         return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
//     };

//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };

//     return (
//         <div className="h-screen w-screen flex items-center justify-center">
//             <div className="relative w-full max-w-[1920px] max-h-[1680px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 h-screen overflow-hidden gap-4">
//                 <Navbar onMenuClick={toggleSidebar} />
//                 <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-hidden relative'>

//                     {isSidebarOpen && (
//                         <div
//                             className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
//                             onClick={() => setIsSidebarOpen(false)}
//                         />
//                     )}

//                     <Sidebar
//                         onClose={() => setIsSidebarOpen(false)}
//                         className={`
//                         transition-transform duration-300 ease-in-out z-40
//                         lg:translate-x-0 lg:static lg:block
//                         fixed left-0 top-0 h-full lg:max-h-[800px] shadow-2xl
//                         ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//                     `} />

//                     <main className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide" style={{
//                         msOverflowStyle: 'none',
//                         scrollbarWidth: 'none'
//                     }}>
//                         <div className="flex items-center gap-2 mb-2">
//                             <div className="bg-[#F3F4F6] p-1 rounded-md flex">
//                                 <button
//                                     onClick={() => setView('calendar')}
//                                     className={`px-6 py-2 text-sm font-medium transition-all ${view === 'calendar' ? 'bg-white text-gray-900 rounded shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
//                                 >
//                                     Add New Event
//                                 </button>
//                                 <button
//                                     onClick={() => setView('list')}
//                                     className={`px-6 py-2 text-sm font-medium transition-all ${view === 'list' ? 'bg-white text-gray-900 rounded shah' : 'text-gray-500 hover:text-gray-900'}`}
//                                 >
//                                     List
//                                 </button>
//                             </div>
//                         </div>

//                         {view === 'calendar' ? (
//                             <>
//                                 {/* Add Event Form (Simplified) */}
//                                 <div className="bg-white rounded-xl border p-6 shadow-sm">
//                                     <h3 className="text-[#3758EE] text-[16px] font-bold mb-4">+ Add New Event</h3>
//                                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//                                         <Input1 label="Event title" name={"event title"} value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
//                                         <input type="date" className="h-[52px] border rounded px-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//                                         <input type="date" className="h-[52px] border rounded px-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
//                                         <GradiantButton onClick={handleAddEvent} className="h-[52px] md:rounded-lg ">Add Event</GradiantButton>
//                                     </div>
//                                 </div>

//                                 {/* React Calendar Section */}
//                                 <div className="bg-white rounded-xl border p-6 shadow-sm flex-1 custom-calendar-container mb-6 flex flex-col overflow-hidden">

//                                     {/* Custom Header */}
//                                     <div className="flex justify-between items-center mb-6">
//                                         <h2 className="text-[28px] text-[#18181B] font-normal">
//                                             {activeStartDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
//                                         </h2>
//                                         <div className="flex items-center gap-2">
//                                             <button
//                                                 onClick={handleToday}
//                                                 className="px-6 py-2 bg-[#A892FF] text-white rounded-md text-sm font-medium hover:bg-[#937aff] transition-colors"
//                                             >
//                                                 today
//                                             </button>
//                                             <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center bg-[#6366F1] text-white rounded-md hover:bg-[#4f46e5] text-xl pb-1">‹</button>
//                                             <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center bg-[#6366F1] text-white rounded-md hover:bg-[#4f46e5] text-xl pb-1">›</button>
//                                         </div>
//                                     </div>

//                                     <div className="overflow-x-auto flex-1 w-full">
//                                         <div className="min-w-[700px]">
//                                             <Calendar
//                                                 onChange={() => { }}
//                                                 value={null}
//                                                 activeStartDate={activeStartDate}
//                                                 onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
//                                                 tileContent={renderTileContent}
//                                                 className="w-full border-none font-sans"
//                                                 showNavigation={false} // Hide default navigation
//                                                 formatShortWeekday={formatShortWeekday}
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>
//                             </>
//                         ) : (
//                             <StatusTable userCourses={dummyUserCourses} />
//                         )}
//                     </main>
//                 </div>

//                 <style dangerouslySetInnerHTML={{
//                     __html: `
//                     .no-scrollbar::-webkit-scrollbar {
//                         display: none;
//                     }
//                     .no-scrollbar {
//                         -ms-overflow-style: none;
//                         scrollbar-width: none;
//                     }
//                 `}} />
//             </div>
//         </div>
//     );
// };

// export default AdminCalendar;