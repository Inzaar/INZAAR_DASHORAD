import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background p-3 rounded-md border shadow-sm flex flex-col items-center",
        "w-full h-full overflow-hidden group/calendar",
        className
      )}
      captionLayout={captionLayout}
      classNames={{
        ...defaultClassNames,
        // ADDED 'relative' here so the absolute nav buttons stay inside the calendar
        months: "w-full flex flex-col relative",
        month: "w-full flex flex-col gap-2",
        // Nav buttons now stay pinned to the top of the calendar
        nav: "flex items-center justify-between absolute top-0 inset-x-0 w-full z-10 px-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100 bg-background"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100 bg-background"
        ),
        month_caption: "flex justify-center items-center h-7 mb-1",
        caption_label: "text-sm font-semibold select-none",
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7 w-full mb-1",
        weekday: "text-muted-foreground font-normal text-[10px] uppercase text-center select-none",
        week: "grid grid-cols-7 w-full mt-1",
        day: "flex items-center justify-center p-0 relative",
        selected: "bg-primary text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground rounded-md",
        outside: "text-muted-foreground/40 opacity-50",
        disabled: "text-muted-foreground opacity-20",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") return <ChevronLeftIcon className="size-4" />;
          if (orientation === "right") return <ChevronRightIcon className="size-4" />;
          return <ChevronDownIcon className="size-4" />;
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props} />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }) {
  const defaultClassNames = getDefaultClassNames()
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-8 w-full p-0 font-normal text-xs transition-all",
        modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary",
        className,
        defaultClassNames.day,
      )}
      {...props}
    />
  );
}

export { Calendar }