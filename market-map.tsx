"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Draggable } from "@/components/Draggable"

interface Position {
  x: number
  y: number
}

interface DraggableLabelProps {
  initialX: number
  initialY: number
  children: React.ReactNode
  color: string
}

function DraggableLabel({ initialX, initialY, children, color }: DraggableLabelProps) {
  const [position, setPosition] = useState<Position>({ x: initialX, y: initialY })
  const dropSoundRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    dropSoundRef.current = new Audio(
      "https://rjj2qyxxex49xrmy.public.blob.vercel-storage.com/a_short_and_fun_womp%20(1)-KP9MRnczG1Yn0Er85oaT3beNqA8Hri.mp3",
    )
    clickSoundRef.current = new Audio(
      "https://rjj2qyxxex49xrmy.public.blob.vercel-storage.com/a_quick_click_sound-fsBeePlfPVSXEf5MiVtaMBPjArwufm.mp3",
    )
  }, [])

  const handleDragStart = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0
      clickSoundRef.current.play()
    }
  }

  const handleDragEnd = (newPosition: Position) => {
    setPosition(newPosition)
    if (dropSoundRef.current) {
      dropSoundRef.current.currentTime = 0
      dropSoundRef.current.play()
    }
  }

  return (
    <Draggable
      initialPosition={position}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPositionChange={setPosition}
      className="px-4 py-1 rounded-full text-xl font-medium select-none whitespace-nowrap text-black"
      style={{
        backgroundColor: color,
      }}
    >
      {children}
    </Draggable>
  )
}

export default function MarketMap() {
  return (
    <div
      className="min-h-screen w-full bg-black flex items-center justify-center font-sans"
      style={{ cursor: "auto" }}
    >
      <style jsx global>{`
        body.dragging * {
          cursor: none !important;
        }
      `}</style>
      <div className="relative w-full max-w-3xl aspect-square p-8 bg-black text-white">
        {/* Axes */}
        <div className="absolute inset-8 flex items-center justify-center">
          <div className="w-[2px] h-full bg-gray-500" />
          <div className="absolute w-full h-[2px] bg-gray-500" />
        </div>

        {/* Axis Labels */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="text-center text-lg -mt-8 text-gray-500">Better DX</div>
          <div className="text-center text-lg -mb-8 text-gray-500">Worse DX</div>
        </div>
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div className="text-lg absolute left-0 -translate-x-full pr-3 whitespace-nowrap text-gray-500">
            Less cost-efficient
          </div>
          <div className="text-lg absolute right-0 translate-x-full pl-3 whitespace-nowrap text-gray-500">
            More cost-efficient
          </div>
        </div>

        {/* Quadrant Items */}
        <div className="absolute inset-0">
          <DraggableLabel initialX={-20} initialY={102} color="#6AACF8">
            Serverless
          </DraggableLabel>
          <DraggableLabel initialX={-4} initialY={102} color="#6CDA76">
            Fluid
          </DraggableLabel>
          <DraggableLabel initialX={14} initialY={102} color="#F2AB3C">
            Edge Workers
          </DraggableLabel>
          <DraggableLabel initialX={34} initialY={102} color="#8955DD">
            Servers
          </DraggableLabel>
        </div>
      </div>
    </div>
  )
}

