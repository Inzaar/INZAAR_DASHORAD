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
import { isWithinInterval, startOfDay } from 'date-fns';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '@/api/event';
import { toast } from 'react-hot-toast';

const AdminCalendar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [view, setView] = useState('calendar'); // 'calendar' or 'list'
    const [events, setEvents] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchEvents = async () => {
        try {
            const data = await getAllEvents();
            if (data?.data) {
                const mappedEvents = data.data.map(ev => ({
                    id: ev._id,
                    title: ev.title,
                    type: ev.type || "Event",
                    status: ev.status || "upcoming",
                    canceledBy: ev.canceledBy || null,
                    startDate: new Date(ev.fromDate),
                    endDate: new Date(ev.toDate),
                    color: 'bg-gradient-to-r from-[#6366F1] to-[#A855F7]'
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

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(events.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    const [eventType, setEventType] = useState('');
    const [startDate, setStartDate] = useState(getFormattedDate(today));
    const [endDate, setEndDate] = useState(getFormattedDate(today));
    const [selectedColor, setSelectedColor] = useState('bg-gradient-to-r from-[#6366F1] to-[#A855F7]');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const handleAddEvent = async () => {
        if (!eventTitle.trim()) {
            toast.error("Event name cannot be empty");
            return;
        }
        if (!startDate) return;
        setIsSubmitting(true);

        try {
            const eventData = {
                title: eventTitle,
                type: eventType || "Event",
                fromDate: new Date(startDate).toISOString(),
                toDate: (endDate ? new Date(endDate) : new Date(startDate)).toISOString(),
                color: selectedColor,
                status: 'upcoming', // Reactivate on edit
                canceledBy: null,   // Clear cancel info
            };

            if (editingEvent) {
                await updateEvent(editingEvent.id, eventData);
                toast.success("Event updated successfully");
                setEditingEvent(null);
            } else {
                await createEvent(eventData);
                toast.success("Event created successfully");
            }

            await fetchEvents();
            // Reset form
            setEventTitle('');
            setEventType('');
            setStartDate(getFormattedDate(today));
            setEndDate(getFormattedDate(today));
            setSelectedColor('bg-gradient-to-r from-[#6366F1] to-[#A855F7]');
            if (view === 'list') setView('calendar');
        } catch (error) {
            console.error("Failed to save event:", error);
            toast.error("Failed to save event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (ev) => {
        setEditingEvent(ev);
        setEventTitle(ev.title);
        setEventType(ev.type);
        setStartDate(getFormattedDate(ev.startDate));
        setEndDate(getFormattedDate(ev.endDate));
        setSelectedColor(ev.color || 'bg-gradient-to-r from-[#6366F1] to-[#A855F7]');
        setView('calendar'); // Switch to form view
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    const handleDeleteClick = (eventId) => {
        setEventToDelete(eventId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;
        try {
            await deleteEvent(eventToDelete);
            toast.success("Event deleted successfully");
            await fetchEvents();
        } catch (error) {
            console.error("Failed to delete event:", error);
            toast.error("Failed to delete event");
        } finally {
            setShowDeleteConfirm(false);
            setEventToDelete(null);
        }
    };

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [eventToCancel, setEventToCancel] = useState(null);

    const handleCancelEvent = (eventId) => {
        setEventToCancel(eventId);
        setShowCancelConfirm(true);
    };

    const confirmCancel = async () => {
        if (!eventToCancel) return;
        try {
            await updateEvent(eventToCancel, { 
                status: 'canceled',
                canceledBy: 'Admin'
            });
            toast.success("Event canceled successfully");
            await fetchEvents();
        } catch (error) {
            console.error("Failed to cancel event:", error);
            toast.error("Failed to cancel event");
        } finally {
            setShowCancelConfirm(false);
            setEventToCancel(null);
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
            <div className="flex flex-col gap-1.5 mt-2 w-full overflow-visible">
                {dayEvents.map(event => (
                    <div
                        key={event.id}
                        className={`h-[24px] text-[11px] flex items-center px-2 text-white truncate z-10 rounded-full mb-[2px] mx-1 shadow-sm ${event.color} ${event.status === 'canceled' ? 'opacity-40 grayscale-[0.3]' : ''}`}
                    >
                        <span className="flex items-center gap-1 font-medium">
                            {event.title.toLowerCase().includes('game') && <span className="text-[10px]">⚽</span>}
                            {event.title}
                            {event.status === 'canceled' && <span className="ml-1 opacity-80 font-bold">[Canceled]</span>}
                        </span>
                    </div>
                ))}
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
        <div className="min-h-screen lg:h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} />
                <div className='flex flex-col lg:flex-row px-4 gap-4 flex-1 overflow-visible lg:overflow-hidden relative pb-4'>

                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar
                        onClose={() => setIsSidebarOpen(false)}
                        className={`
                        transition-transform duration-300 ease-in-out z-[70]
                        lg:translate-x-0 lg:static lg:block
                        fixed left-0 top-0 shadow-2xl h-screen
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `} />

                    <main className="flex-1 flex flex-col gap-4 overflow-y-visible lg:overflow-y-auto no-scrollbar scrollbar-hide pb-10 lg:pb-0">
                        {/* Toggle Switch */}
                        <div className="flex items-center gap-2 mb-4 w-full md:w-[400px]">
                            <div className="bg-[#F8F9FA] p-1 rounded-md flex w-full border border-gray-100">
                                <button
                                    onClick={() => setView('calendar')}
                                    className={`flex-1 py-2 text-[14px] font-medium transition-all ${view === 'calendar' ? 'bg-white text-gray-900 rounded shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Add New Event
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    className={`flex-1 py-2 text-[14px] font-medium transition-all ${view === 'list' ? 'bg-white text-gray-900 rounded shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    List
                                </button>
                            </div>
                        </div>

                        {view === 'calendar' ? (
                            <>
                                {/* Add Event Form (Simplified) */}
                                <div className="bg-white rounded-[16px] p-6 shadow-sm mb-6 border border-[#EAEDF2]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[#3758EE] text-[16px] font-bold">
                                            {editingEvent ? '✎ Edit Event' : '+ Add New Event'}
                                        </h3>
                                        {editingEvent && (
                                            <button 
                                                onClick={() => {
                                                    setEditingEvent(null);
                                                    setEventTitle('');
                                                    setEventType('');
                                                    setStartDate(getFormattedDate(today));
                                                    setEndDate(getFormattedDate(today));
                                                }}
                                                className="text-xs text-rose-500 hover:underline font-bold"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[14px] font-medium text-gray-700">Event title name</label>
                                                <input type="text" placeholder="enter title name" className="h-[44px] w-full border border-gray-200 rounded-md px-3 text-[14px] outline-none focus:border-[#3758EE] transition-colors" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[14px] font-medium text-gray-700">Event Type</label>
                                                <div className="relative">
                                                    <select className="h-[44px] w-full border border-gray-200 rounded-md px-3 text-[14px] text-gray-500 outline-none focus:border-[#3758EE] transition-colors appearance-none bg-white" value={eventType} onChange={(e) => {
                                                        setEventType(e.target.value);
                                                        // Automatically set color based on type
                                                        setSelectedColor('bg-gradient-to-r from-[#6366F1] to-[#A855F7]');
                                                    }}>
                                                        <option value="" disabled hidden>Select</option>
                                                        <option value="Class" className="text-black">Class</option>
                                                        <option value="Game" className="text-black">Game</option>
                                                        <option value="Meeting" className="text-black">Meeting</option>
                                                        <option value="Other" className="text-black">Other</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[14px] font-medium text-gray-700">From</label>
                                                <input type="date" className="h-[44px] w-full border border-gray-200 rounded-md px-3 text-[14px] text-gray-500 outline-none focus:border-[#3758EE] transition-colors" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[14px] font-medium text-gray-700">To</label>
                                                <input type="date" className="h-[44px] w-full border border-gray-200 rounded-md px-3 text-[14px] text-gray-500 outline-none focus:border-[#3758EE] transition-colors" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <button 
                                                onClick={handleAddEvent} 
                                                disabled={isSubmitting}
                                                className={`h-[44px] w-full bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white rounded-md font-medium text-[15px] shadow-sm hover:opacity-90 transition-opacity ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {editingEvent ? 'Update Event' : 'Add Event'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* React Calendar Section */}
                                <div className="bg-white rounded-xl border p-4 sm:p-6 shadow-sm flex-col custom-calendar-container mb-6 flex overflow-visible min-h-[500px] shrink-0">

                                    {/* Custom Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-4 pt-4">
                                        <h2 className="text-[20px] text-[#6B7280] font-medium">
                                            {activeStartDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </h2>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={handleToday}
                                                className="px-6 py-2 bg-[#C7D2FE] text-[#4338CA] rounded-md text-[14px] font-medium hover:bg-[#A5B4FC] transition-all"
                                            >
                                                today
                                            </button>
                                            <button onClick={handlePrev} className="w-9 h-9 flex items-center justify-center bg-[#8B5CF6] text-white rounded-md hover:bg-[#7c3aed] text-xl pb-1 transition-all">‹</button>
                                            <button onClick={handleNext} className="w-9 h-9 flex items-center justify-center bg-[#8B5CF6] text-white rounded-md hover:bg-[#7c3aed] text-xl pb-1 transition-all">›</button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto flex-1 w-full custom-scrollbar">
                                        <div className="min-w-[800px] pb-4">
                                            <Calendar
                                                onChange={() => { }}
                                                value={null}
                                                activeStartDate={activeStartDate}
                                                onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                                                tileContent={renderTileContent}
                                                className="w-full border-none font-sans"
                                                showNavigation={false}
                                                formatShortWeekday={formatShortWeekday}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-xl border border-[#EAEDF2] shadow-sm flex-1 flex flex-col overflow-hidden mb-6">
                                <div className="p-6 border-b border-[#EAEDF2]">
                                    <h2 className="text-[18px] font-bold text-gray-800">Event Table</h2>
                                </div>

                                <div className="overflow-x-auto flex-1 custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#F8F9FA]">
                                            <tr>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600">Event Name</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">Type</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">Date</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">Status</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">Created By</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">Canceled By</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#EAEDF2]">
                                            {currentEvents.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="py-12 text-center text-gray-500 font-medium">
                                                        No events found on this page.
                                                    </td>
                                                </tr>
                                            ) : (
                                                currentEvents.map((ev, idx) => (
                                                    <tr key={ev.id} className={`${idx % 2 === 1 ? 'bg-[#FDFDFF]' : 'bg-white'} hover:bg-gray-50/80 transition-colors`}>
                                                        <td className="py-5 px-6">
                                                            <span className="text-[14px] font-medium text-gray-700">{ev.title}</span>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <span className="text-[14px] text-gray-600">{ev.type}</span>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <div className="flex flex-col items-center justify-center min-w-[100px]">
                                                                <div className="text-[13px] font-bold text-gray-700 whitespace-nowrap">
                                                                    {ev.startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}
                                                                </div>
                                                                {ev.endDate && ev.startDate.getTime() !== ev.endDate.getTime() && (
                                                                    <>
                                                                        <div className="h-2 w-[1px] bg-gray-200 my-0.5"></div>
                                                                        <div className="text-[13px] font-bold text-gray-400 whitespace-nowrap">
                                                                            {ev.endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <span className={`text-[14px] font-semibold capitalize ${ev.status === 'canceled' ? 'text-[#FF4D4D]' : ev.status === 'upcoming' ? 'text-[#EAB308]' : 'text-[#10B981]'
                                                                }`}>
                                                                {ev.status === 'canceled' ? 'Cancelled' : ev.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <span className="text-[14px] text-gray-600">Admin</span>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <span className="text-[14px] text-gray-400">{ev.canceledBy || 'N/A'}</span>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {ev.status !== 'canceled' && (
                                                                    <button 
                                                                        onClick={() => handleCancelEvent(ev.id)}
                                                                        className="px-4 py-1.5 bg-[#F59E0B] text-white rounded text-[13px] font-medium hover:bg-[#d97706] transition-all active:scale-95 shadow-sm shadow-amber-200"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => handleEditClick(ev)}
                                                                    className="px-4 py-1.5 bg-[#6366F1] text-white rounded text-[13px] font-medium hover:bg-[#4f46e5] transition-all active:scale-95 shadow-sm shadow-[#6366F1]/20"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteClick(ev.id)}
                                                                    className="px-4 py-1.5 bg-[#F43F5E] text-white rounded text-[13px] font-medium hover:bg-[#e11d48] transition-all active:scale-95 shadow-sm shadow-[#F43F5E]/20"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination matching the design */}
                                <div className="p-6 border-t border-[#EAEDF2] flex justify-end">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className={`flex items-center gap-1 px-3 py-2 text-[14px] font-medium transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            <span className="text-xl leading-none mb-1">‹</span> Previous
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                                            // Show limited pages if many
                                            if (totalPages > 5) {
                                                if (number !== 1 && number !== totalPages && Math.abs(number - currentPage) > 1) {
                                                    if (Math.abs(number - currentPage) === 2) return <span key={number} className="px-1 text-gray-400">...</span>;
                                                    return null;
                                                }
                                            }

                                            return (
                                                <button
                                                    key={number}
                                                    onClick={() => paginate(number)}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-[14px] font-medium transition-all ${currentPage === number
                                                        ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {number}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            className={`flex items-center gap-1 px-3 py-2 text-[14px] font-medium transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            Next <span className="text-xl leading-none mb-1">›</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Global CSS to override react-calendar defaults */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                .react-calendar { width: 100% !important; border: none !important; font-family: inherit !important; }
                .react-calendar__tile { min-height: 120px; display: flex; flex-direction: column; align-items: flex-start !important; border: 1px solid #EAEDF2 !important; position: relative; padding: 10px !important; transition: background 0.2s; background: white; }
                .react-calendar__tile:hover { background: #f8fafc !important; }
                .react-calendar__month-view__days__day--neighboringMonth { color: #cbd5e1; }
                .react-calendar__tile--now { background: white !important; }
                .react-calendar__tile--now > abbr { background: #3758EE; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; }
                .react-calendar__month-view__weekdays { text-transform: capitalize; font-weight: 500; font-size: 14px; color: #6B7280; padding-bottom: 12px; border-bottom: none; }
                .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; cursor: default; }
                .react-calendar__month-view__days { border-top: 1px solid #EAEDF2; border-left: 1px solid #EAEDF2; }
                .react-calendar__tile { border-top: none !important; border-left: none !important; border-right: 1px solid #EAEDF2 !important; border-bottom: 1px solid #EAEDF2 !important; }

                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                /* Prevent the calendar itself from scrolling vertically, forcing it to expand */
                .custom-scrollbar { overflow-y: hidden !important; }

                @media (max-width: 1024px) {
                    .react-calendar__tile { min-height: 100px !important; }
                }

                @media (max-width: 768px) {
                    .react-calendar__tile { 
                        min-height: 110px !important; 
                        padding: 4px !important;
                        font-size: 0.7rem;
                    }
                    .react-calendar__month-view__weekdays { font-size: 0.65rem; padding-bottom: 8px; }
                    .custom-calendar-container { min-height: 500px !important; }
                }
            `}} />

                {showCancelConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowCancelConfirm(false)}
                        />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-8 animate-in fade-in zoom-in duration-200">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-3xl">⚠️</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Event?</h3>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    Are you sure you want to cancel this event? It will still appear on the calendar but as "Canceled".
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button 
                                        onClick={() => setShowCancelConfirm(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        Keep Event
                                    </button>
                                    <button 
                                        onClick={confirmCancel}
                                        className="flex-1 px-6 py-3 bg-[#F59E0B] text-white rounded-xl font-bold hover:bg-[#d97706] transition-all active:scale-95 shadow-lg shadow-amber-200"
                                    >
                                        Cancel Event
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowDeleteConfirm(false)}
                        />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-8 animate-in fade-in zoom-in duration-200">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-3xl">🗑️</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Event?</h3>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    Are you sure you want to delete this event? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button 
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={confirmDelete}
                                        className="flex-1 px-6 py-3 bg-[#F43F5E] text-white rounded-xl font-bold hover:bg-[#e11d48] transition-all active:scale-95 shadow-lg shadow-rose-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCalendar;