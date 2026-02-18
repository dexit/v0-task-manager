"use client"

import React, { ReactNode, CSSProperties } from "react"
import { useDraggable } from "@/hooks/useDraggable"

interface Position {
  x: number
  y: number
}

interface DraggableProps {
  initialPosition: Position
  children: ReactNode
  onDragEnd?: (position: Position) => void
  onDragStart?: () => void
  onPositionChange?: (position: Position) => void
  className?: string
  containerClassName?: string
  style?: CSSProperties
}

export function Draggable({
  initialPosition,
  children,
  onDragEnd,
  onDragStart,
  onPositionChange,
  className = "",
  containerClassName = "",
  style = {},
}: DraggableProps) {
  const { position, dragState, containerRef, startDrag, getWobbleAnimation } = useDraggable(
    initialPosition,
    { onDragEnd, onDragStart, onPositionChange },
  )

  const animationClass = getWobbleAnimation()
  const cursorClass = dragState.isDragging ? "cursor-grabbing" : "cursor-grab"

  return (
    <div
      ref={containerRef}
      className={`absolute pointer-events-auto ${containerClassName}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      <div
        onMouseDown={startDrag}
        className={`
          transform -translate-x-1/2 -translate-y-1/2
          ${cursorClass}
          ${animationClass}
          ${className}
        `}
        style={style}
      >
        {children}
      </div>
    </div>
  )
}

