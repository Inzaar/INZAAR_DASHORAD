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
                    const event = events.find(ev => isSameDay(new Date(ev.fromDate), day.date))
                    const isCanceled = event?.status === 'canceled'
                    const isToday = modifiers.today
                    const hasEvent = event && !isCanceled

                    return (
                        <div className="relative flex items-center justify-center w-full h-full group">
                            <button
                                {...props}
                                className={cn(
                                    "h-9 w-9 p-0 font-normal transition-all flex items-center justify-center relative z-10",
                                    isToday 
                                        ? "bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white rounded-full shadow-md" 
                                        : (hasEvent ? `${event.color} text-white rounded-md shadow-sm` : "rounded-md"),
                                    isCanceled && "opacity-40 grayscale-[0.5]",
                                    props.className
                                )}
                                title={event ? `${event.title}${isCanceled ? ' (Canceled)' : ''}` : undefined}
                            >
                                {day.date.getDate()}
                                
                                {/* Today's Event Dot OR Normal Today Dot? */}
                                {/* User said: if an event is happening on the current date, then have it a little dot of the same color as the event color */}
                                {isToday && hasEvent && (
                                    <span className={cn(
                                        "absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-white",
                                        event.color
                                    )} />
                                )}
                            </button>
                            
                            {/* Hover Tooltip - Theme matching */}
                            {event && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl border border-white/10 flex flex-col gap-1 items-center">
                                    <span className="text-[11px] font-bold">
                                        {event.title}
                                        {isCanceled && <span className="ml-1 text-rose-400">[Canceled]</span>}
                                    </span>
                                    <span className="text-[9px] text-gray-400">
                                        {format(new Date(event.fromDate), 'MMM d')} - {format(new Date(event.toDate), 'MMM d')}
                                    </span>
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
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
