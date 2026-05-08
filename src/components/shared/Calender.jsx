"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import { getAllEvents } from "@/api/event"
import { isSameDay, format } from "date-fns"
import { cn } from "@/lib/utils"

export function Calendar18() {
    const [date, setDate] = React.useState()
    const [events, setEvents] = React.useState([])

    React.useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents()
                if (data?.data) {
                    setEvents(data.data)
                }
            } catch (error) {
                console.error("Failed to fetch events:", error)
            }
        }
        fetchEvents()
    }, [])

    return (
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border w-full h-full flex-1"
            components={{
                DayButton: ({ day, modifiers, ...props }) => {
                    const dayEvents = events.filter(ev => isSameDay(new Date(ev.fromDate), day.date));
                    const activeEvents = dayEvents.filter(ev => ev.status !== 'canceled');
                    const isToday = modifiers.today;
                    const hasActive = activeEvents.length > 0;
                    const hasMultipleActive = activeEvents.length > 1;
                    const allCanceled = dayEvents.length > 0 && activeEvents.length === 0;

                    let bgClass = "rounded-md";
                    if (isToday) {
                        bgClass = "bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white rounded-full shadow-md";
                    } else if (hasMultipleActive) {
                        bgClass = "bg-gradient-to-br from-[#3758EE] via-[#5D5FEF] to-[#B666E7] text-white rounded-md shadow-lg ring-1 ring-white/30";
                    } else if (hasActive) {
                        bgClass = `${activeEvents[0].color} text-white rounded-md shadow-sm`;
                    } else if (allCanceled) {
                        bgClass = "bg-gray-100/80 text-gray-400 rounded-md border border-gray-200 grayscale-[0.8]";
                    }

                    return (
                        <div className="relative flex items-center justify-center w-full h-full group">
                            <button
                                {...props}
                                className={cn(
                                    "h-9 w-9 p-0 font-normal transition-all flex items-center justify-center relative z-10",
                                    bgClass,
                                    props.className
                                )}
                            >
                                {day.date.getDate()}
                                
                                {hasMultipleActive && !isToday && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-[#FF4D4D] to-[#FF0000] text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-md z-20 animate-pulse transition-all">
                                        {activeEvents.length}
                                    </span>
                                )}

                                {isToday && hasActive && (
                                    <span className={cn(
                                        "absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-white",
                                        activeEvents[0].color
                                    )} />
                                )}
                            </button>
                            
                            {dayEvents.length > 0 && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-gray-100 flex flex-col gap-1.5 items-center min-w-[160px] max-w-[240px] pointer-events-none group-hover:pointer-events-auto after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:w-9 after:h-2">
                                    <div className="text-[9px] font-bold text-indigo-500 border-b border-gray-100 w-full text-center pb-1 mb-1 uppercase tracking-wider">
                                        {format(day.date, 'EEEE, MMM do')}
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        {dayEvents.map((ev, idx) => (
                                            <div key={idx} className="flex flex-col items-start w-full px-1">
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.color?.split(' ')[0] || 'bg-indigo-500'}`} />
                                                    <span className={`text-[11px] font-bold truncate flex-1 ${ev.status === 'canceled' ? 'line-through text-gray-400' : ''}`}>
                                                        {ev.title}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between w-full pl-3.5 mt-[-2px]">
                                                    <span className="text-[8px] text-gray-500 font-medium">
                                                        {format(new Date(ev.fromDate), 'h:mm a')}
                                                    </span>
                                                    {ev.status === 'canceled' && (
                                                        <span className="text-[8px] text-rose-500 font-bold uppercase">Canceled</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white" />
                                </div>
                            )}
                        </div>
                    )
                }
            }}
            modifiers={{
                sunday: { dayOfWeek: [0] }
            }}
            classNames={{
                caption_label: "text-sm font-bold bg-gradient-to-r from-[#3758EE] to-[#B666E7] bg-clip-text text-transparent",
            }}
            modifiersClassNames={{
                today: "text-[#3758EE] font-bold",
                sunday: "text-[#3758EE] font-bold"
            }}
        />
    )
}
