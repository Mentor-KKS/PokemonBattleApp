"use client"

import type React from "react"

interface RetroButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "danger"
  disabled?: boolean
  className?: string
}

export default function RetroButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: RetroButtonProps) {
  const baseClasses = "pixel-font text-sm font-bold border-2 border-black px-4 py-2 transition-all duration-100"

  const variantClasses = {
    primary: "bg-gameboy-gold hover:bg-yellow-500 active:translate-y-1 text-black",
    secondary: "bg-gameboy-medium hover:bg-gameboy-dark active:translate-y-1 text-white",
    danger: "bg-gameboy-accent hover:bg-red-600 active:translate-y-1 text-white",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
