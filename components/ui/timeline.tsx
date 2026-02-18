import type React from "react"

interface TimelineItemProps {
  title: string
  description: string
  date: string
}

const TimelineItem = ({ title, description, date }: TimelineItemProps) => (
  <li className="flex items-center gap-x-4">
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary">
      <span className="sr-only">Timeline item</span>
    </div>
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
      <time className="text-xs text-muted-foreground">{date}</time>
    </div>
  </li>
)

const Timeline = ({ children }: { children: React.ReactNode }) => <ul className="space-y-4">{children}</ul>

export { Timeline, TimelineItem, type TimelineItemProps }

