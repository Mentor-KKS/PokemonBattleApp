import type React from "react"
interface GameBoyScreenProps {
  children: React.ReactNode
  className?: string
}

export default function GameBoyScreen({ children, className = "" }: GameBoyScreenProps) {
  return (
    <div
      className={`
      max-w-6xl mx-auto 
      bg-gameboy-medium 
      border-4 border-black 
      rounded-lg 
      p-6 
      shadow-lg
      ${className}
    `}
    >
      <div className="bg-gameboy-light border-2 border-black rounded p-4 min-h-[400px]">{children}</div>
    </div>
  )
}
