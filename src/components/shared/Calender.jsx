"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export function Calendar18() {
    const [date, setDate] = React.useState()
    return (

        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)] "
            // buttonVariant="ghost"
            modifiers={{
                sunday: { dayOfWeek: [0] }
            }}
            classNames={{
                // Layout
                // months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                // month: "space-y-4",
                // table: "w-full border-collapse space-y-1",
                // head_row: "flex",
                // head_cell: "text-[#9CA3AF] rounded-md w-9 font-normal text-[0.8rem] uppercase",
                // row: "flex w-full mt-2",
                // cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",

                // Navigation
                // nav: "space-x-1 flex items-center",
                // nav_button: "h-7 w-7 bg-transparent p-0 opacity-100 hover:opacity-100",
                // nav_button_previous: "absolute left-1",
                // nav_button_next: "absolute right-1",

                // Caption
                // caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-sm font-bold bg-gradient-to-r from-[#3758EE] to-[#B666E7] bg-clip-text text-transparent",

                // Days
                // day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-gray-100",
                // day_today: "text-[#3758EE] font-bold",
                // day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                // day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                // day_hidden: "invisible",
            }}
            modifiersClassNames={{
                // selected: "bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white hover:bg-gradient-to-r hover:from-[#3758EE] hover:to-[#B666E7] hover:text-white focus:bg-gradient-to-r focus:from-[#3758EE] focus:to-[#B666E7] focus:text-white rounded-full",
                // today: "text-[#3758EE] font-bold",
                today: "bg-gradient-to-r from-[#3758EE] to-[#B666E7] text-white rounded-full",
                sunday: "bg-gradient-to-r from-[#3758EE] to-[#B666E7] bg-clip-text text-transparent font-bold"
                // disabled: "text-muted-foreground opacity-50",
                // range_start: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                // range_middle: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                // range_end: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
            }}
        />
    )
}
