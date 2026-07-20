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
import { getAllCourses } from '@/api/course';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AdminCalendar = () => {
    const { t, i18n } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [view, setView] = useState('calendar'); // 'calendar' or 'list'
    const [events, setEvents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('events');

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

    const fetchCourses = async () => {
        try {
            const data = await getAllCourses();
            if (data?.data?.data) {
                const mappedCourses = data.data.data.map(c => ({
                    id: c._id,
                    title: c.title,
                    status: c.status || "active",
                    startDate: new Date(c.createdAt), // fallback for display
                    endDate: new Date(c.createdAt),
                    ...c
                }));
                setCourses(mappedCourses);
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchCourses();
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
    const [eventType, setEventType] = useState('Class');
    const [eventTime, setEventTime] = useState('09:00');
    const [eventDate, setEventDate] = useState(getFormattedDate(today));

    // New Modal Fields

    const [selectedColor] = useState('bg-[#8B5CF6]');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventSpeaker, setEventSpeaker] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventDuration, setEventDuration] = useState('1 hour');
    const [eventDay, setEventDay] = useState('5');
    const [eventMonth, setEventMonth] = useState('August');
    const [eventYear, setEventYear] = useState('2025');
    const [editingEvent, setEditingEvent] = useState(null);

    const handleAddEventModal = async () => {
        if (!eventTitle || !eventType || !eventTime) {
            toast.error("Please fill required fields (Title, Type, Time)");
            return;
        }

        try {
            setIsSubmitting(true);
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthIndex = monthNames.indexOf(eventMonth) + 1;
            const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;
            const formattedDay = parseInt(eventDay) < 10 ? `0${eventDay}` : `${eventDay}`;
            const finalDateString = `${eventYear}-${formattedMonth}-${formattedDay}`;

            let timeString = eventTime;
            if (eventTime.includes('AM') || eventTime.includes('PM')) {
                const match = eventTime.match(/(\d+):(\d+)(AM|PM)/i);
                if (match) {
                    let hours = parseInt(match[1]);
                    const mins = match[2];
                    const modifier = match[3].toUpperCase();
                    if (hours === 12) hours = 0;
                    if (modifier === 'PM') hours += 12;
                    timeString = `${hours < 10 ? '0' + hours : hours}:${mins}`;
                }
            }

            const fromDateObj = new Date(`${finalDateString}T${timeString}`);
            const toDateObj = new Date(fromDateObj);
            
            const durationMatch = eventDuration.match(/(\d+(\.\d+)?)/);
            if (durationMatch) {
                const hoursToAdd = parseFloat(durationMatch[1]);
                toDateObj.setMinutes(toDateObj.getMinutes() + (hoursToAdd * 60));
            }

            const eventPayload = {
                title: eventTitle,
                type: eventType,
                fromDate: fromDateObj.toISOString(),
                toDate: toDateObj.toISOString(),
                color: selectedColor || '#3758EE',
                status: 'upcoming',
            };

            if (editingEvent) {
                await updateEvent(editingEvent.id, eventPayload);
                toast.success("Event updated successfully");
                setEditingEvent(null);
            } else {
                await createEvent(eventPayload);
                toast.success("Event added successfully");
            }
            
            // Reset modal form
            setEventTitle("");
            setEventType("");
            setEventTime("");
            setEventSpeaker("");
            setEventDescription("");
            setIsModalOpen(false);
            
            const res = await getAllEvents();
            if (res.data && res.data.data) {
                setEvents(res.data.data);
            }
        } catch (err) {
            console.error("Failed to add event from modal", err);
            toast.error(err.response?.data?.message || "Failed to add event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (ev) => {
        setEditingEvent(ev);
        setEventTitle(ev.title);
        setEventType(ev.type);
        setEventDate(getFormattedDate(ev.startDate));
        setEventTime(ev.startDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
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

        if (activeTab === 'events') {
            const dayEvents = events.filter(event =>
                isWithinInterval(startOfDay(date), {
                    start: startOfDay(event.startDate),
                    end: startOfDay(event.endDate)
                })
            );

            return (
                <div className="flex flex-col gap-1 w-full mt-1 px-1 overflow-visible">
                    {dayEvents.map(event => {
                        const colors = [
                            'text-blue-700 bg-blue-100 border border-blue-200',
                            'text-green-700 bg-green-100 border border-green-200',
                            'text-yellow-700 bg-yellow-100 border border-yellow-200',
                            'text-red-700 bg-red-100 border border-red-200',
                            'text-purple-700 bg-purple-100 border border-purple-200',
                            'text-orange-700 bg-orange-100 border border-orange-200',
                            'text-pink-700 bg-pink-100 border border-pink-200',
                            'text-cyan-700 bg-cyan-100 border border-cyan-200'
                        ];

                        const globalIndex = events.findIndex(e => e.id === event.id);
                        const colorIndex = (globalIndex >= 0 ? globalIndex : 0) % colors.length;

                        const styleClass = colors[colorIndex];
                        const timeStr = event.startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                        return (
                            <div
                                key={event.id}
                                className={`flex items-center px-1 py-[2px] rounded-[4px] text-[10px] font-medium truncate ${styleClass} ${event.status === 'canceled' ? 'opacity-40 grayscale-[0.3]' : ''}`}
                            >
                                <svg className="w-[10px] h-[10px] mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="truncate max-w-[80px]">{event.title}</span>
                                <span className="ml-auto text-[9px] opacity-70 ml-1 whitespace-nowrap">{timeStr}</span>
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            // Courses rendering
            const dayCourses = courses.filter(course => {
                const courseStart = startOfDay(course.startDate);
                // For mock display, let's just show course if start date matches, since courses might not have endDates that map well to calendar days in our basic mocked version
                return isWithinInterval(startOfDay(date), {
                    start: courseStart,
                    end: courseStart // just show on start date for now
                });
            });

            return (
                <div className="flex flex-col gap-1 w-full mt-1 px-1 overflow-visible">
                    {dayCourses.map(course => {
                        const isActive = course.status !== 'upcoming';
                        const statusBg = isActive ? 'bg-blue-100' : 'bg-[#E5F0FF]';
                        const statusText = isActive ? 'text-[#3758EE]' : 'text-[#60A5FA]';
                        const statusLabel = isActive ? 'Active' : 'Upcoming';

                        return (
                            <div
                                key={course.id}
                                className="flex flex-col p-1.5 rounded-[4px] text-[10px] font-medium bg-[#F0F5FF] border-l-[3px] border-[#3758EE] mb-1 relative"
                            >
                                <div className="flex items-start gap-1">
                                    <svg className="w-[12px] h-[12px] text-[#3758EE] mt-[1px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                                    </svg>
                                    <span className="truncate text-[#3758EE] font-bold text-[11px] leading-tight">{course.title}</span>
                                </div>
                                <div className="mt-1 pl-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusBg} ${statusText}`}>
                                        {statusLabel}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }
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
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return t(`day_${days[date.getDay()]}`);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen lg:h-screen w-screen flex items-center justify-center">
            <div className="relative w-full max-w-[1920px] mx-auto flex flex-col bg-[#F8F9FA] font-sans text-slate-800 min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden gap-4">
                <Navbar onMenuClick={toggleSidebar} title="Calendar" />
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
                        <div className="flex w-fit mb-6 bg-[#F8F9FA] rounded-[6px] border border-gray-200 p-1">
                            <button
                                onClick={() => setView('calendar')}
                                className={`px-8 py-2 text-[14px] font-medium transition-all rounded-[4px] ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {t('add_new_event', 'Add New Event')}
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`px-8 py-2 text-[14px] font-medium transition-all rounded-[4px] ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {t('list', 'List')}
                            </button>
                        </div>

                        
                        {/* Inline Add Event Form */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6 flex-shrink-0">
                            <h3 className="text-[#1E3A8A] text-[16px] font-bold mb-4">+ Add New Event</h3>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-4">
                                    <label className="block mb-2 text-sm font-semibold text-gray-800">Event title name</label>
                                    <input 
                                        type="text" 
                                        placeholder="enter title name" 
                                        className="w-full h-[48px] border border-gray-200 rounded-[8px] px-4 focus:outline-none focus:border-blue-500" 
                                        value={eventTitle} 
                                        onChange={(e) => setEventTitle(e.target.value)} 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-sm font-semibold text-gray-800">Event Type</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full h-[48px] border border-gray-200 rounded-[8px] px-4 appearance-none focus:outline-none focus:border-blue-500 bg-white"
                                            value={eventType}
                                            onChange={(e) => setEventType(e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            <option value="Jummah Khutbah">Jummah Khutbah</option>
                                            <option value="Lecture">Lecture</option>
                                            <option value="Live Broadcast">Live Broadcast</option>
                                            <option value="Special Program">Special Program</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-sm font-semibold text-gray-800">Time</label>
                                    <div className="relative">
                                        <input 
                                            type="time" 
                                            className="w-full h-[48px] border border-gray-200 rounded-[8px] px-4 focus:outline-none focus:border-blue-500 bg-white" 
                                            value={eventTime} 
                                            onChange={(e) => setEventTime(e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-sm font-semibold text-gray-800">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full h-[48px] border border-gray-200 rounded-[8px] px-4 focus:outline-none focus:border-blue-500 bg-white" 
                                        value={eventDate} 
                                        onChange={(e) => setEventDate(e.target.value)} 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full h-[48px] bg-gradient-to-r from-[#4A6BF3] to-[#A855F7] text-white font-semibold rounded-[8px] hover:opacity-90 transition-opacity flex items-center justify-center"
                                    >
                                        Add Event
                                    </button>
                                </div>
                            </div>
                        </div>

                        {view === 'calendar' ? (
                            <>
                                {/* React Calendar Section */}
                                <div className="bg-white rounded-xl border p-4 sm:p-6 shadow-sm flex-col custom-calendar-container mb-6 flex overflow-visible min-h-[500px] shrink-0">

                                    {/* Custom Header */}
                                    <div className="flex flex-col w-full mb-2">
                                        <div className="flex items-center gap-3 px-2 pt-2">
                                            <button onClick={handlePrev} className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">‹</button>
                                            <button onClick={handleNext} className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">›</button>
                                            <div className="px-4 py-1.5 border border-gray-200 rounded font-medium text-[15px] flex items-center gap-2 cursor-pointer hover:bg-gray-50 text-gray-800">
                                                {activeStartDate.toLocaleString(i18n.language || 'en-US', { month: 'long', year: 'numeric' })}
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                            <button onClick={handleToday} className="px-5 py-1.5 border border-[#3758EE] text-[#3758EE] rounded font-medium text-[15px] hover:bg-blue-50 transition-colors">
                                                {t('today', 'Today')}
                                            </button>
                                        </div>

                                        <div className="flex mt-6 w-full border-b border-gray-200 px-2">
                                            {/* Events Tab */}
                                            <div
                                                onClick={() => setActiveTab('events')}
                                                className={`flex items-center gap-2 pb-3 px-4 border-b-[3px] -mb-[1.5px] cursor-pointer transition-colors ${activeTab === 'events' ? 'border-[#3758EE] text-[#3758EE]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                <span className="font-bold text-sm">Events</span>
                                                <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${activeTab === 'events' ? 'bg-[#3758EE] text-white' : 'bg-gray-200 text-gray-600'}`}>{events.length}</span>
                                            </div>

                                            {/* Courses Tab */}
                                            <div
                                                onClick={() => setActiveTab('courses')}
                                                className={`flex items-center gap-2 pb-3 px-4 border-b-[3px] -mb-[1.5px] cursor-pointer transition-colors ${activeTab === 'courses' ? 'border-[#3758EE] text-[#3758EE]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                                                <span className="font-bold text-sm">Courses</span>
                                                <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${activeTab === 'courses' ? 'bg-[#3758EE] text-white' : 'bg-gray-200 text-gray-600'}`}>{courses.length}</span>
                                            </div>
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
                                    <h2 className="text-[18px] font-bold text-gray-800">{t('event_table', 'Event Table')}</h2>
                                </div>

                                <div className="overflow-auto flex-1 custom-table-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#F8F9FA]">
                                            <tr>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600">{t('event_name', 'Event Name')}</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">{t('type', 'Type')}</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">{t('date', 'Date')}</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">{t('status', 'Status')}</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">{t('created_by', 'Created By')}</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">{t('canceled_by', 'Canceled By')}</th>
                                                <th className="py-4 px-6 text-[14px] font-bold text-gray-600 text-center">{t('action', 'Action')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#EAEDF2]">
                                            {currentEvents.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="py-12 text-center text-gray-500 font-medium">
                                                        {t('no_events_found', 'No events found on this page.')}
                                                    </td>
                                                </tr>
                                            ) : (
                                                currentEvents.map((ev, idx) => (
                                                    <tr key={ev.id} className={`${idx % 2 === 1 ? 'bg-[#FDFDFF]' : 'bg-white'} hover:bg-gray-50/80 transition-colors`}>
                                                        <td className="py-5 px-6">
                                                            <span className="text-[14px] font-medium text-gray-700">{t(ev.title, ev.title)}</span>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <span className="text-[14px] text-gray-600">{t(ev.type.toLowerCase(), ev.type)}</span>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <div className="flex flex-col items-center justify-center min-w-[100px]">
                                                                <div className="text-[13px] font-bold text-gray-700 whitespace-nowrap">
                                                                    {ev.startDate.toLocaleDateString(i18n.language || 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}
                                                                </div>
                                                                {ev.endDate && ev.startDate.getTime() !== ev.endDate.getTime() && (
                                                                    <>
                                                                        <div className="h-2 w-[1px] bg-gray-200 my-0.5"></div>
                                                                        <div className="text-[13px] font-bold text-gray-400 whitespace-nowrap">
                                                                            {ev.endDate.toLocaleDateString(i18n.language || 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <span className={`text-[14px] font-semibold capitalize ${ev.status === 'canceled' ? 'text-[#FF4D4D]' : ev.status === 'upcoming' ? 'text-[#EAB308]' : 'text-[#10B981]'
                                                                }`}>
                                                                {ev.status === 'canceled' ? t('cancelled', 'Cancelled') : t(ev.status.toLowerCase(), ev.status)}
                                                            </span>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <span className="text-[14px] text-gray-600">{t('admin', 'Admin')}</span>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <span className="text-[14px] text-gray-400">{ev.canceledBy ? t(ev.canceledBy.toLowerCase(), ev.canceledBy) : t('not_applicable', 'N/A')}</span>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {ev.status !== 'canceled' && (
                                                                    <button
                                                                        onClick={() => handleCancelEvent(ev.id)}
                                                                        className="px-4 py-1.5 bg-[#F59E0B] text-white rounded text-[13px] font-medium hover:bg-[#d97706] transition-all active:scale-95 shadow-sm shadow-amber-200"
                                                                    >
                                                                        {t('cancel', 'Cancel')}
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleEditClick(ev)}
                                                                    className="px-4 py-1.5 bg-[#6366F1] text-white rounded text-[13px] font-medium hover:bg-[#4f46e5] transition-all active:scale-95 shadow-sm shadow-[#6366F1]/20"
                                                                >
                                                                    {t('edit', 'Edit')}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteClick(ev.id)}
                                                                    className="px-4 py-1.5 bg-[#F43F5E] text-white rounded text-[13px] font-medium hover:bg-[#e11d48] transition-all active:scale-95 shadow-sm shadow-[#F43F5E]/20"
                                                                >
                                                                    {t('delete', 'Delete')}
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
                                            <span className="text-xl leading-none mb-1">‹</span> {t('previous', 'Previous')}
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
                                            {t('next', 'Next')} <span className="text-xl leading-none mb-1">›</span>
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
                .react-calendar__tile { min-height: 120px; display: flex; flex-direction: column; justify-content: flex-start !important; align-items: flex-start !important; border: 1px solid transparent !important; position: relative; padding: 4px !important; transition: background 0.2s; background: white; border-right: 1px solid #EAEDF2 !important; border-bottom: 1px solid #EAEDF2 !important; }
                .react-calendar__tile > abbr { align-self: flex-start; margin-left: 4px; margin-top: 4px; font-weight: 500; font-size: 13px; color: #4B5563; }
                .react-calendar__tile:hover { background: #f8fafc !important; }
                .react-calendar__month-view__days__day--neighboringMonth { color: #cbd5e1; }
                .react-calendar__tile--now { background: white !important; }
                .react-calendar__tile--now > abbr { background: #3758EE !important; color: white !important; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; }
                .react-calendar__month-view__weekdays { text-transform: uppercase; font-weight: bold; font-size: 11px; color: #9CA3AF; padding-bottom: 12px; padding-top: 12px; }
                .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; cursor: default; }
                .react-calendar__month-view__weekdays__weekday:nth-child(6) abbr { color: #10B981; }
                .react-calendar__month-view__days { border-top: 1px solid #EAEDF2; border-left: 1px solid #EAEDF2; }

                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                .custom-scrollbar { overflow-y: hidden !important; }

                .custom-table-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-table-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
                .custom-table-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-table-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                @media (max-width: 1024px) {
                    .react-calendar__tile { min-height: 100px !important; }
                }

                @media (max-width: 768px) {
                    .react-calendar__tile { 
                        min-height: 110px !important; 
                        padding: 2px !important;
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cancel_event_confirm_title', 'Cancel Event?')}</h3>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    {t('cancel_event_confirm_msg', 'Are you sure you want to cancel this event? It will still appear on the calendar but as "Canceled".')}
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setShowCancelConfirm(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        {t('keep_event', 'Keep Event')}
                                    </button>
                                    <button
                                        onClick={confirmCancel}
                                        className="flex-1 px-6 py-3 bg-[#F59E0B] text-white rounded-xl font-bold hover:bg-[#d97706] transition-all active:scale-95 shadow-lg shadow-amber-200"
                                    >
                                        {t('cancel_event', 'Cancel Event')}
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('delete_event_confirm_title', 'Delete Event?')}</h3>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    {t('delete_event_confirm_msg', 'Are you sure you want to delete this event? This action cannot be undone.')}
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        {t('cancel', 'Cancel')}
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-6 py-3 bg-[#F43F5E] text-white rounded-xl font-bold hover:bg-[#e11d48] transition-all active:scale-95 shadow-lg shadow-rose-200"
                                    >
                                        {t('delete', 'Delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                
                {/* Modal Overlay */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                        <div className="bg-white rounded-[24px] w-full max-w-[600px] flex flex-col overflow-hidden shadow-2xl max-h-[95vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
                            
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#3758EE] to-[#5B75F0] p-6 text-white relative">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Add New Event</h2>
                                        <p className="text-blue-100 text-sm mt-0.5">Fill in the details to schedule your event</p>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 flex flex-col gap-6">
                                
                                {/* Event Type Selection */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-[#4B5563] font-semibold text-[14px]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                                        Event Type
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {[
                                            { label: "Jummah Khutbah", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                                            { label: "Lecture", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
                                            { label: "Live Broadcast", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><circle cx="12" cy="12" r="2"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14"/><path d="M7.76 16.24a6 6 0 0 1 0-8.48"/><path d="M16.24 7.76a6 6 0 0 1 0 8.48"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
                                            { label: "Special Program", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                                            { label: "Eid Event", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
                                            { label: "Community Event", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" }
                                        ].map((type) => (
                                            <div 
                                                key={type.label}
                                                onClick={() => setEventType(type.label)}
                                                className={`flex items-center gap-2 p-3 rounded-[12px] border cursor-pointer transition-all active:scale-95 ${eventType === type.label ? `${type.bg} ${type.border} ring-2 ring-offset-1 ring-${type.color.split('-')[1]}-400` : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                            >
                                                <span className="flex items-center justify-center">{type.icon}</span>
                                                <span className={`text-[12px] font-semibold ${eventType === type.label ? type.color : 'text-gray-600'}`}>{type.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Event Title */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[#4B5563] font-semibold text-[14px]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
                                        Event Title
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Jummah Khutbah — The Value of Time"
                                        value={eventTitle}
                                        onChange={(e) => setEventTitle(e.target.value)}
                                        className="w-full h-[48px] border border-gray-200 rounded-[8px] px-4 text-[14px] outline-none focus:border-[#3758EE] placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Speaker / Host */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[#4B5563] font-semibold text-[14px]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                                        Speaker / Host <span className="text-gray-400 font-normal">(optional)</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Imam Ahmed"
                                        value={eventSpeaker}
                                        onChange={(e) => setEventSpeaker(e.target.value)}
                                        className="w-full h-[48px] border border-gray-200 rounded-[8px] px-4 text-[14px] outline-none focus:border-[#3758EE] placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Date Selection */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[#4B5563] font-semibold text-[14px]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        Date
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="relative w-[100px] shrink-0">
                                            <select value={eventDay} onChange={e => setEventDay(e.target.value)} className="w-full h-[48px] border border-gray-200 rounded-[8px] pl-4 pr-8 text-[14px] outline-none focus:border-[#3758EE] appearance-none bg-white">
                                                {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                        <div className="relative flex-1">
                                            <select value={eventMonth} onChange={e => setEventMonth(e.target.value)} className="w-full h-[48px] border border-gray-200 rounded-[8px] pl-4 pr-8 text-[14px] outline-none focus:border-[#3758EE] appearance-none bg-white">
                                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                        <div className="relative w-[120px] shrink-0">
                                            <select value={eventYear} onChange={e => setEventYear(e.target.value)} className="w-full h-[48px] border border-gray-200 rounded-[8px] pl-4 pr-8 text-[14px] outline-none focus:border-[#3758EE] appearance-none bg-white">
                                                {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Time & Duration */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="flex items-center gap-2 text-[#4B5563] font-semibold text-[14px]">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            Start Time
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="01:30PM"
                                            value={eventTime}
                                            onChange={(e) => setEventTime(e.target.value)}
                                            className="w-full h-[48px] border border-gray-200 rounded-[8px] px-4 text-[14px] outline-none focus:border-[#3758EE] placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="flex items-center gap-2 text-[#4B5563] font-semibold text-[14px]">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            Duration
                                        </div>
                                        <div className="relative">
                                            <select value={eventDuration} onChange={e => setEventDuration(e.target.value)} className="w-full h-[48px] border border-gray-200 rounded-[8px] pl-4 pr-8 text-[14px] outline-none focus:border-[#3758EE] appearance-none bg-white">
                                                <option value="30 minutes">30 minutes</option>
                                                <option value="1 hour">1 hour</option>
                                                <option value="1.5 hours">1.5 hours</option>
                                                <option value="2 hours">2 hours</option>
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[#4B5563] font-semibold text-[14px]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
                                        Description <span className="text-gray-400 font-normal">(optional)</span>
                                    </div>
                                    <textarea 
                                        placeholder="Brief description of the event..."
                                        value={eventDescription}
                                        onChange={(e) => setEventDescription(e.target.value)}
                                        className="w-full h-[100px] border border-gray-200 rounded-[8px] p-4 text-[14px] outline-none focus:border-[#3758EE] placeholder:text-gray-400 resize-none"
                                    />
                                </div>

                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end items-center gap-3 bg-white mt-auto">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-[8px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        // Trigger handleAddEvent logic.
                                        // Because handleAddEvent expects finalDateString we need to format it or we can just call it
                                        handleAddEventModal();
                                    }}
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-[8px] font-semibold text-white bg-gradient-to-r from-[#4A6BF3] to-[#A855F7] hover:opacity-90 transition-opacity shadow-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    + Save Event
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCalendar;