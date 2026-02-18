"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface Position {
  x: number
  y: number
}

interface DragState {
  isDragging: boolean
  moveDirection: string | null
  tiltAngle: number
  isWobbling: boolean
}

interface UseDraggableOptions {
  onDragEnd?: (position: Position) => void
  onDragStart?: () => void
  onPositionChange?: (position: Position) => void
}

export function useDraggable(
  initialPosition: Position = { x: 50, y: 50 },
  options: UseDraggableOptions = {},
) {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    moveDirection: null,
    tiltAngle: 0,
    isWobbling: false,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const lastPosition = useRef<Position>(initialPosition)
  const lastMoveTime = useRef<number>(0)
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dragStartPosition = useRef<Position | null>(null)

  // Normalize coordinates to percentage
  const normalizeCoordinates = useCallback(
    (clientX: number, clientY: number): Position => {
      if (!containerRef.current?.parentElement) return position
      const rect = containerRef.current.parentElement.getBoundingClientRect()
      return {
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
      }
    },
    [position],
  )

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current) return

      const currentTime = Date.now()
      const newPos = normalizeCoordinates(e.clientX, e.clientY)

      const dx = newPos.x - lastPosition.current.x
      const dy = newPos.y - lastPosition.current.y
      const timeDiff = Math.max(currentTime - lastMoveTime.current, 1)

      const velocity = Math.sqrt(dx * dx + dy * dy) / timeDiff
      const newTiltAngle = Math.min(Math.max(velocity * 200, 1), 15)

      let direction: string | null = null
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? "right" : "left"
      } else {
        direction = dy > 0 ? "down" : "up"
      }

      setPosition(newPos)
      setDragState((prev) => ({
        ...prev,
        moveDirection: direction,
        tiltAngle: newTiltAngle,
      }))

      lastPosition.current = newPos
      lastMoveTime.current = currentTime

      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
      moveTimeoutRef.current = setTimeout(() => {
        setDragState((prev) => ({
          ...prev,
          moveDirection: null,
          tiltAngle: 0,
        }))
      }, 50)

      options.onPositionChange?.(newPos)
    },
    [dragState.isDragging, normalizeCoordinates, options],
  )

  // Handle mouse up
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return

      const endPos = normalizeCoordinates(e.clientX, e.clientY)
      const distance = Math.sqrt(
        Math.pow(endPos.x - (dragStartPosition.current?.x || 0), 2) +
          Math.pow(endPos.y - (dragStartPosition.current?.y || 0), 2),
      )

      setDragState((prev) => ({
        ...prev,
        isDragging: false,
        moveDirection: null,
        tiltAngle: 0,
        isWobbling: true,
      }))

      setTimeout(() => {
        setDragState((prev) => ({
          ...prev,
          isWobbling: false,
        }))
      }, 300)

      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)

      options.onDragEnd?.(endPos)
      document.body.classList.remove("dragging")

      // Return whether it was a click (small distance)
      return distance < 5
    },
    [dragState.isDragging, normalizeCoordinates, options],
  )

  // Setup event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      document.body.classList.add("dragging")
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp])

  // Start drag
  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startPos = normalizeCoordinates(e.clientX, e.clientY)
      dragStartPosition.current = startPos
      lastPosition.current = position
      lastMoveTime.current = Date.now()

      setDragState((prev) => ({
        ...prev,
        isDragging: true,
        isWobbling: false,
      }))

      options.onDragStart?.()
    },
    [position, normalizeCoordinates, options],
  )

  // Get wobble animation class
  const getWobbleAnimation = (): string => {
    if (dragState.isWobbling) return "animate-lightWobble"
    switch (dragState.moveDirection) {
      case "left":
        return "animate-wobbleLeft"
      case "right":
        return "animate-wobbleRight"
      case "up":
        return "animate-wobbleUp"
      case "down":
        return "animate-wobbleDown"
      default:
        return ""
    }
  }

  return {
    position,
    setPosition,
    dragState,
    containerRef,
    startDrag,
    getWobbleAnimation,
  }
}
