'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { DayPicker, type DayPickerProps } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-background p-3',
        className,
      )}
      classNames={{
        months: cn('flex gap-4 flex-col md:flex-row'),
        month: cn('flex flex-col w-full gap-4'),
        caption: cn('flex items-center justify-between px-0 py-3'),
        caption_label: cn('text-sm font-medium'),
        nav: cn('flex gap-1'),
        nav_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-7 p-0',
        ),
        nav_button_previous: cn('absolute left-1'),
        nav_button_next: cn('absolute right-1'),
        table: cn('w-full border-collapse space-y-1'),
        head_row: cn('flex'),
        head_cell: cn(
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        ),
        row: cn('flex w-full mt-2'),
        cell: cn(
          'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-middle)]:bg-accent [&:has(>.day-range-middle)]:text-accent-foreground'
            : '',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        day_range_start: cn('day-range-start'),
        day_range_middle: cn(
          'aria-selected:bg-accent aria-selected:text-accent-foreground day-range-middle',
        ),
        day_range_end: cn('day-range-end'),
        day_selected: cn(
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        ),
        day_today: cn('bg-accent text-accent-foreground'),
        day_outside: cn(
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        ),
        day_disabled: cn('text-muted-foreground opacity-50'),
        day_hidden: cn('invisible'),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('h-4 w-4', className)} {...props} />
            )
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('h-4 w-4', className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn('h-4 w-4', className)} {...props} />
          )
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
